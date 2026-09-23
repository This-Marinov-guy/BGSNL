"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { Dialog, Skeleton, Steps } from "@/compat/primereact";
import HeaderTwo from "@/component/header/HeaderTwo";
import StepContentTransition from "@/elements/ui/functional/StepContentTransition";
import { FiExternalLink, FiShare2, IconlyDocument } from "@/elements/ui/icons/IconlyIcons";
import InfoHint from "@/elements/ui/icons/InfoHint";
import { browserFetch } from "@/util/auth/browser-request.mjs";
import { parseTicketScan } from "@/util/functions/ticket-scan.mjs";
import { formatRegionBadgeLabel, getRegionBadgeStyle } from "@/util/defines/REGION_BADGES";
import { showNotification } from "@/redux/notification";
import styles from "./check-ticket.module.scss";
import { estimateScanProgress } from "@/util/functions/scan-progress.mjs";

const mockGroupResult = () => ({
  outcome: "choose_quantity", name: "Mock Guest Trio", event: "Mock event · preview only",
  total: 3, remaining: 2,
  guests: [0, 1, 2].map(index => ({ id: `mock-${index}`, name: "Mock Guest Trio", present: index === 0 })),
});

const ResultSkeleton = () => <div className={styles.resultSkeleton} role="status">
  <span className="visually-hidden">Updating ticket result…</span>
  <div aria-hidden="true" className={styles.resultSkeletonContent}>
    <Skeleton width="8rem" height="1.8rem" borderRadius="999px" />
    <Skeleton width="75%" height="2.5rem" />
    <Skeleton width="9rem" height="1.2rem" />
    <div className={styles.skeletonActions}><Skeleton width="8rem" height="3rem" /><Skeleton width="8rem" height="3rem" /></div>
  </div>
</div>;

const DetailsSkeleton = () => <div role="status">
  <span className="visually-hidden">Loading ticket details…</span>
  <div aria-hidden="true" className={styles.detailsSkeleton}>
    <Skeleton width="60%" height="1.2rem" />
    {Array.from({ length: 7 }, (_, index) => <div className={styles.skeletonDetailRow} key={index}><Skeleton width="80%" height="1rem" /><Skeleton width="100%" height="1rem" /></div>)}
  </div>
</div>;

export default function CheckTicket() {
  const params = useSearchParams();
  const mockPreview = process.env.NODE_ENV === "development" && params.get("preview") === "group";
  const dispatch = useDispatch();
  const video = useRef(null);
  const busy = useRef(false);
  const blocked = useRef(false);
  const lastScan = useRef("");
  const initial = useRef("");
  const currentTicket = useRef(null);
  const [camera, setCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(() => mockPreview ? mockGroupResult() : null);
  const [quantity, setQuantity] = useState(1);
  const [extended, setExtended] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [detailsError, setDetailsError] = useState("");
  const [detailsAttempt, setDetailsAttempt] = useState(0);
  const [autoConfirm, setAutoConfirm] = useState(true);
  const autoConfirmRef = useRef(true);
  const expectedEventId = params.get("forEvent") || params.get("event") || undefined;
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(!expectedEventId);
  const [eventsError, setEventsError] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(expectedEventId || "");
  const [search, setSearch] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [scannerUrl, setScannerUrl] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const activeEventId = selectedEventId;
  const normalizedSearch = search.replace(/\s+/g, "").toLocaleLowerCase();
  const filteredEvents = events.filter((event) => !normalizedSearch || [event.name, event.title, event.region]
    .some((value) => String(value || "").replace(/\s+/g, "").toLocaleLowerCase().includes(normalizedSearch)));

  useEffect(() => {
    setSelectedEventId(expectedEventId || "");
  }, [expectedEventId]);

  useEffect(() => {
    setCamera(Boolean(activeEventId) && !mockPreview);
    setCameraReady(false);
    setCameraError("");
  }, [activeEventId, mockPreview]);

  useEffect(() => {
    if (!scannerUrl) return undefined;
    let active = true;
    setQrImage("");
    import("qrcode").then((module) => (module.default || module).toDataURL(scannerUrl, {
      width: 320, margin: 2, errorCorrectionLevel: "M",
    })).then((image) => active && setQrImage(image)).catch(() => active && setShareMessage("The QR code could not be generated. Use Open link instead."));
    return () => { active = false; };
  }, [scannerUrl]);

  useEffect(() => {
    if (activeEventId) return undefined;
    const controller = new AbortController();
    async function loadEvents() {
      setEventsLoading(true);
      setEventsError("");
      try {
        const response = await browserFetch("/api/future-event/full-data-events-list", { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Events could not be loaded.");
        setEvents((data.events || [])
          .filter((event) => !["draft", "archived"].includes(String(event.status || "").trim().toLowerCase()))
          .sort((first, second) => new Date(second.correctedDate || second.date || 0) - new Date(first.correctedDate || first.date || 0)));
      } catch (error) {
        if (error.name !== "AbortError") setEventsError(error.message || "Events could not be loaded.");
      } finally {
        if (!controller.signal.aborted) setEventsLoading(false);
      }
    }
    void loadEvents();
    return () => controller.abort();
  }, [activeEventId]);

  const reportError = useCallback((message) => {
    blocked.current = true;
    setResult({ outcome: "error", message });
    dispatch(showNotification({ severity: "error", detail: message }));
  }, [dispatch]);

  const check = useCallback(async (ticket, count) => {
    if (busy.current || !activeEventId) return;
    setExtended(false);
    if (mockPreview) {
      busy.current = true;
      setPending(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      setResult(previous => {
        const current = previous || mockGroupResult();
        let admitted = 0;
        const guests = current.guests.map(guest => {
          if (!guest.present && admitted < Number(count || 1)) { admitted++; return { ...guest, present: true }; }
          return guest;
        });
        return { ...current, guests, admitted, remaining: guests.filter(guest => !guest.present).length, outcome: "present" };
      });
      setQuantity(1);
      busy.current = false;
      setPending(false);
      return;
    }
    busy.current = true;
    setPending(true);
    currentTicket.current = ticket;
    try {
      const response = await browserFetch("/api/event/check-guest-list", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ticket, expectedEventId: activeEventId, preview: count == null && !autoConfirmRef.current, ...(count != null ? { count } : {}) }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Check-in could not be confirmed.");
      blocked.current = ["choose_quantity", "confirm_required"].includes(data.outcome);
      setResult(data);
      if (data.outcome === "present") window.dispatchEvent(new CustomEvent("bgsnl:guest-list-changed", { detail: { eventId: data.eventId } }));
      setQuantity(1);
      if (data.outcome === "present") navigator.vibrate?.(80);
    } catch (error) {
      reportError(error.name === "TimeoutError" ? "Connection timed out. Check this ticket again before admitting anyone." : error.message);
    } finally {
      busy.current = false;
      setPending(false);
    }
  }, [reportError, activeEventId, mockPreview]);

  useEffect(() => {
    if (!extended || !result || pending || result.outcome === "error") return undefined;
    const controller = new AbortController();
    setTicketDetails(null);
    setDetailsError("");
    async function loadDetails() {
      try {
        if (mockPreview) {
          await new Promise(resolve => setTimeout(resolve, 500));
          if (controller.signal.aborted) return;
          setTicketDetails(result.guests.map(guest => ({ ...guest, status: guest.present ? 1 : 0, email: "mock@example.invalid", phone: "+31600000000", type: "guest", transactionId: "pi_mock_preview", timestamp: "2026-09-23T12:00:00Z", addOns: [{ title: "Welcome drink" }], preferences: { "Dietary preferences": "Vegetarian" } })));
          return;
        }
        const response = await browserFetch("/api/event/check-guest-list", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...currentTicket.current, expectedEventId: activeEventId, preview: true, includeDetails: true }),
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Ticket details could not be loaded.");
        if (!controller.signal.aborted) setTicketDetails(data.ticketDetails || []);
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error.name === "TimeoutError" ? "Loading ticket details timed out. Try again." : error.message;
        setDetailsError(message);
        dispatch(showNotification({ severity: "error", detail: message }));
      }
    }
    void loadDetails();
    return () => controller.abort();
  }, [extended, result, pending, activeEventId, mockPreview, detailsAttempt, dispatch]);

  const acceptScan = useCallback((raw) => {
    if (busy.current || blocked.current || lastScan.current === raw) return;
    lastScan.current = raw;
    try { void check(parseTicketScan(raw)); } catch (error) { reportError(error.message); }
  }, [check, reportError]);

  const query = params.toString();
  useEffect(() => {
    setScanSuccess(result?.outcome === "present");
    if (result?.outcome !== "present") return undefined;
    const timer = setTimeout(() => setScanSuccess(false), 2000);
    return () => clearTimeout(timer);
  }, [result]);
  useEffect(() => {
    if (mockPreview) return;
    const search = new URLSearchParams(query);
    if (!search.has("token") && !search.has("code")) return;
    if (!activeEventId) return;
    if (initial.current === query) return;
    initial.current = query;
    acceptScan(`https://bulgariansociety.nl/user/dashboard/ticket-scanner?${query}`);
  }, [query, activeEventId, acceptScan, mockPreview]);

  useEffect(() => {
    if (!camera || !activeEventId) return undefined;
    let cancelled = false, controls, nearbyTimer;
    let framePatterns = 0;
    let heldProgress = 0;
    const element = video.current;
    setCameraReady(false);
    setCameraError("");
    setScanProgress(0);
    const updateProgress = (progress) => {
      if (cancelled || progress === 0) return;
      // Briefly retain the strongest recent signal to avoid per-frame flicker.
      if (progress < heldProgress) return;
      heldProgress = progress;
      setScanProgress(progress);
      clearTimeout(nearbyTimer);
      nearbyTimer = setTimeout(() => { heldProgress = 0; if (!cancelled) setScanProgress(0); }, 800);
    };
    async function start() {
      try {
        const [{ BrowserQRCodeReader }, { DecodeHintType, ChecksumException, FormatException }] = await Promise.all([import("@zxing/browser"), import("@zxing/library")]);
        if (cancelled) return;
        const hints = new Map([[DecodeHintType.NEED_RESULT_POINT_CALLBACK, {
          foundPossibleResultPoint() {
            if (cancelled) return;
            framePatterns++;
          },
        }]]);
        const reader = new BrowserQRCodeReader(hints);
        controls = await reader.decodeFromConstraints({ audio: false, video: { facingMode: { ideal: "environment" } } }, element,
          (decoded, error) => {
            if (cancelled) return;
            updateProgress(estimateScanProgress({ patterns: framePatterns, decoded: Boolean(decoded), decodeAttempted: error instanceof ChecksumException || error instanceof FormatException }));
            framePatterns = 0;
            if (decoded) acceptScan(decoded.getText());
          });
        if (cancelled) controls.stop();
        else setCameraReady(true);
      } catch {
        if (!cancelled) {
          setCamera(false);
          setCameraError("Camera unavailable. Allow camera access in your browser, then try again.");
        }
      }
    }
    void start();
    return () => { cancelled = true; clearTimeout(nearbyTimer); controls?.stop(); element?.srcObject?.getTracks?.().forEach(track => track.stop()); };
  }, [camera, activeEventId, acceptScan]);

  const reset = () => { blocked.current = false; lastScan.current = ""; currentTicket.current = null; setExtended(false); setTicketDetails(null); setResult(null); };
  const selectEvent = (eventId) => {
    if (busy.current) return;
    reset();
    setCamera(false);
    setQuantity(1);
    setShareOpen(false);
    setSelectedEventId(eventId);
    // Keep refresh/share behavior aligned with the selection, without replaying
    // a ticket from the previous event's URL.
    const url = new URL(window.location.href);
    for (const key of ["forEvent", "event", "token", "code", "count"]) url.searchParams.delete(key);
    if (eventId) url.searchParams.set("forEvent", eventId);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    initial.current = "";
  };
  const openShareModal = () => {
    if (!activeEventId) return;
    const url = new URL("/user/dashboard/ticket-scanner", window.location.origin);
    url.searchParams.set("forEvent", activeEventId);
    setShareMessage("");
    setScannerUrl(url.toString());
    setShareOpen(true);
  };
  const shareScannerLink = async () => {
    if (!scannerUrl) return;
    try {
      if (globalThis.navigator.share) {
        await globalThis.navigator.share({ title: "Ticket scanner", url: scannerUrl });
        return;
      }
      if (globalThis.navigator.clipboard?.writeText) {
        await globalThis.navigator.clipboard.writeText(scannerUrl);
        setShareMessage("Scanner link copied.");
      } else setShareMessage("Copying is unavailable in this browser. Use Open link instead.");
    } catch {
      setShareMessage("The scanner link could not be shared. Use Open link instead.");
    }
  };
  const titles = { present: "Checked in", already_present: "Already checked in", choose_quantity: "Choose how many to check in", confirm_required: "Awaiting confirmation", error: "Do not admit yet" };
  return <>
    <HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className={`${styles.checkIn}${activeEventId ? ` ${styles.scanning}` : ""}`}>
      <header className={styles.heading}>
        <h1 className="page-breadcrumb__title archive">Ticket scanner</h1>
      </header>
      <div className={`event-form-steps ${styles.stepper}`}>
        <Steps aria-label="Ticket scanner steps" activeIndex={activeEventId ? 1 : 0} model={[{ label: "Choose event" }, { label: "Scan tickets", disabled: !activeEventId }]} onSelect={({ index }) => { if (index === 0) selectEvent(""); }} readOnly={pending} />
      </div>
      <StepContentTransition step={activeEventId ? 1 : 0} direction={activeEventId ? "forward" : "backward"}>
      {!activeEventId ? <section className={styles.eventPicker} aria-busy={eventsLoading}>
          <div className={`rn-form-group ${styles.searchField}`}>
            <label htmlFor="scanner-event-search">Search events</label>
            <input className="bgsnl-form-control" id="scanner-event-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Event or region" autoComplete="off" />
          </div>
        {eventsLoading ? <div className={styles.eventCards} aria-hidden="true"><Skeleton height="7rem" /><Skeleton height="7rem" /><Skeleton height="7rem" /></div> : (
          <div className={styles.eventCards} role="list">
            {filteredEvents.map((event) => <button className={styles.eventCard} key={event.id || event._id} onClick={() => selectEvent(event.id || event._id)} role="listitem" type="button">
              {event.poster ? <img alt="" className={styles.eventPoster} loading="lazy" src={event.poster} /> : <span className={styles.eventPosterFallback} aria-hidden="true">No poster</span>}
              <span className={styles.eventCardContent}><strong>{event.name || event.title || "Untitled event"}</strong><span className={styles.regionBadge} style={getRegionBadgeStyle(event.region)}>{formatRegionBadgeLabel(event.region)}</span></span>
            </button>)}
          </div>
        )}
        {eventsError && <p role="alert">{eventsError}</p>}
        {!eventsLoading && !eventsError && !filteredEvents.length && <p className={styles.empty}>No events match this search.</p>}
      </section> : <section className={styles.scannerStep}>
        <div className={styles.actions}>
          <button className={styles.changeEvent} type="button" disabled={pending || mockPreview} onClick={() => selectEvent("")}>Change event</button>
          <button className={styles.shareButton} type="button" onClick={openShareModal}><FiShare2 aria-hidden /> Share scanner</button>
        </div>
        <div className={styles.cameraWindow}>
          <video ref={video} className={styles.camera} muted playsInline aria-label="Ticket scanning camera" />
          {cameraReady && <div className={styles.cameraGuide} aria-hidden="true"><span /><span /><span /><span /></div>}
          {cameraError ? <div className={styles.cameraMessage} role="alert">
            <p>{cameraError}</p>
            <button type="button" onClick={() => setCamera(true)}>Try camera again</button>
          </div> : !cameraReady && <p className={styles.cameraHint} role="status">{mockPreview ? "Mock scan" : "Opening camera…"}</p>}
          {cameraReady && !cameraError && <p className={styles.cameraHint} data-signal={pending ? "close" : scanSuccess ? "success" : ["choose_quantity", "confirm_required"].includes(result?.outcome) || scanProgress > 0 ? "close" : "idle"} role="status">
            {pending ? "Checking…" : scanSuccess ? "Checked in" : ["choose_quantity", "confirm_required"].includes(result?.outcome) ? "Review below" : result?.outcome === "error" ? "Check failed" : result?.outcome === "already_present" ? "Already used" : scanProgress === 100 ? "QR read · 100%" : `Scan ${scanProgress}%`}
          </p>}
        </div>
        <div className={styles.confirmSettings}>
          <label className={styles.switchLabel}>
            <input type="checkbox" role="switch" checked={autoConfirm} disabled={pending} onChange={event => { autoConfirmRef.current = event.target.checked; setAutoConfirm(event.target.checked); }} />
            <span className={styles.switchTrack} aria-hidden="true" />
            Auto confirm
          </label>
          <InfoHint label="About automatic confirmation" text="When on, single tickets are marked present as soon as they scan. Group tickets always require a quantity choice. When off, review the attendee and confirm before marking them present. Changing this switch does not confirm a pending ticket." />
        </div>
        <section className={pending || result ? styles.result : styles.waitingResult} data-outcome={pending ? "pending" : result?.outcome} aria-live="polite" aria-atomic="true" aria-busy={pending}>
        {pending && <ResultSkeleton />}
        {!pending && result && <p className={styles.status}>{titles[result?.outcome]}</p>}
        {!pending && result?.name && <h2 className={`${styles.name} archive`}>{result.name}</h2>}
        {!pending && result && <>
          {result.total > 0 && <p className={styles.remaining}>{result.remaining === 0 ? `${result.total} ${result.total === 1 ? "ticket" : "tickets"} total` : `${result.total - result.remaining}/${result.total} tickets checked`}</p>}
          {result.message && <p>{result.message}</p>}
          {(result.outcome === "choose_quantity" || (result.outcome === "present" && result.total > 1 && result.remaining > 0)) && <form onSubmit={event => { event.preventDefault(); void check(currentTicket.current, quantity); }}>
            <div className={styles.quantityActions}>
              <button type="button" onClick={() => check(currentTicket.current, result.remaining)}>Check all ({result.remaining})</button>
              <div className={`bgsnl-form-control ${styles.quantityStepper}`} role="group" aria-label="Quantity to check in">
                <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(value => Math.max(1, value - 1))}><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
                <output aria-label="Selected quantity">{quantity}</output>
                <button type="button" aria-label="Increase quantity" disabled={quantity >= result.remaining} onClick={() => setQuantity(value => Math.min(result.remaining, value + 1))}><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 9h12M9 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
              </div>
              <button type="submit">Check selected</button>
            </div>
          </form>}
          {result.outcome === "confirm_required" && <button type="button" onClick={() => check(currentTicket.current, 1)}>Confirm check-in</button>}
          {result.outcome === "error" && currentTicket.current && <button type="button" onClick={() => check(currentTicket.current)}>Check ticket again</button>}
          {result.outcome !== "error" && <>
            <button className={styles.extendButton} type="button" aria-expanded={extended} aria-controls="scanner-ticket-details" onClick={() => { setTicketDetails(null); setDetailsError(""); setExtended(value => !value); }}><IconlyDocument aria-hidden="true" />{extended ? "Compact" : "Extend"}</button>
            {extended && <div id="scanner-ticket-details" className={styles.ticketDetails} aria-busy={!ticketDetails && !detailsError}>
              {detailsError ? <div role="alert"><p>{detailsError}</p><button type="button" onClick={() => { setDetailsError(""); setTicketDetails(null); setDetailsAttempt(value => value + 1); }}>Try again</button></div> : !ticketDetails ? <DetailsSkeleton /> : ticketDetails.length === 0 ? <p>No additional details available.</p> : ticketDetails.map((guest, index) => <section key={guest.id} className={styles.ticketDetail}>
                <h3>Ticket {index + 1} · {guest.refunded ? "Refunded" : Number(guest.status) === 1 ? "Checked in" : "Not checked in"}</h3>
                <dl>
                  <dt>Name</dt><dd>{guest.name || "Not provided"}</dd>
                  <dt>Email</dt><dd>{guest.email || "Not provided"}</dd>
                  <dt>Phone</dt><dd>{guest.phone || "Not provided"}</dd>
                  <dt>Type</dt><dd>{guest.type || "Not provided"}</dd>
                  <dt>Purchased</dt><dd>{guest.timestamp && !Number.isNaN(new Date(guest.timestamp).getTime()) ? new Date(guest.timestamp).toLocaleString("en-GB") : "Not provided"}</dd>
                  <dt>Transaction ID</dt><dd>{guest.transactionId || "Not provided"}</dd>
                  <dt>Add-ons</dt><dd>{guest.addOns?.map(item => item.title).filter(Boolean).join(", ") || "None"}</dd>
                  {Object.entries(guest.preferences || {}).filter(([key, value]) => !["fixture", "pricingTier"].includes(key) && ["string", "number", "boolean"].includes(typeof value)).map(([key, value]) => <div className={styles.preferenceRow} key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>)}
                </dl>
              </section>)}
            </div>}
          </>}
        </>}
        {!pending && !result && <p>The ticket result will appear here.</p>}
        </section>
        {result && <button className={styles.clearButton} type="button" disabled={pending} onClick={reset}>Clear</button>}
        {mockPreview && !result && <button className={styles.clearButton} type="button" onClick={() => { setResult(mockGroupResult()); setQuantity(1); }}>Preview another group scan</button>}
      </section>}
      </StepContentTransition>
    </main>
    <Dialog aria-label="Share ticket scanner" className="ticket-scanner-link-modal" dismissableMask header={<div><h2>Share ticket scanner</h2><p>Open this link on the device used at the door.</p></div>} onHide={() => setShareOpen(false)} visible={shareOpen}>
      <div className="ticket-scanner-link">
        {qrImage ? <img alt="QR code for the ticket scanner" src={qrImage} /> : <Skeleton height="18rem" width="18rem" />}
        <div className="ticket-scanner-link__actions">
          <button className="rn-button-style--2 rn-btn-reverse-green" type="button" onClick={shareScannerLink}><FiShare2 aria-hidden /> Share link</button>
          <a className="rn-button-style--2 rn-btn-green" href={scannerUrl} rel="noopener noreferrer" target="_blank"><FiExternalLink aria-hidden /> Open link</a>
        </div>
        {shareMessage && <p role="status">{shareMessage}</p>}
      </div>
    </Dialog>
  </>;
}
