"use client";
import { formatDisplayDateTime } from "@/util/functions/display-date.mjs";
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import AppModal from "@/elements/ui/modals/AppModal";
import { LoadingSkeleton, LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import { useHttpClient } from "@/hooks/common/http-hook";
import styles from "./event-campaign.module.scss";

const kinds = [["announcement", "Event announcement"], ["last-chance", "Last chance to book"], ["limited-offer", "Limited offer"]];
const savingsKind = ["guest-savings", "Guest ticket savings and membership"];
const audiences = [["members", "Members"], ["guests", "Guests"], ["both", "Both"]];
const terminalStatuses = new Set(["completed", "completed-with-errors", "stopped"]);
const campaignLabel = kind => [...kinds, savingsKind].find(([value]) => value === kind)?.[1] || "Event email";
const emailCountLabel = count => `${count.toLocaleString("en-NL")} email${count === 1 ? "" : "s"}`;
const formatSentAt = value => value && !Number.isNaN(new Date(value).getTime())
  ? formatDisplayDateTime(value) : "Date unavailable";

export default function EventCampaignModal({ event, open, onClose, initialKind = "announcement" }) {
  const { sendRequest } = useHttpClient();
  const [kind, setKind] = useState(initialKind);
  const [audience, setAudience] = useState("both");
  const [promoCode, setPromoCode] = useState("");
  const [preview, setPreview] = useState(null);
  const [previewSelection, setPreviewSelection] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [pending, setPending] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [campaign, setCampaign] = useState(null);
  const [statusError, setStatusError] = useState(false);
  const [statusRefresh, setStatusRefresh] = useState(0);
  const [history, setHistory] = useState([]);
  const [sentCount, setSentCount] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const requestId = useRef(null);
  const submitLock = useRef(false);
  const eventId = event.id || event._id;
  const eventTime = new Date(event.correctedDate || event.date).getTime();
  const pastEvent = Number.isFinite(eventTime) && eventTime <= Date.now();
  const savingsAvailable = pastEvent && Date.now() >= eventTime + 72 * 3600000;
  const availableKinds = savingsAvailable ? [savingsKind] : pastEvent ? [] : kinds;
  const effectiveAudience = kind === savingsKind[0] ? "guests" : audience;
  const selectionKey = JSON.stringify([kind, effectiveAudience, promoCode]);
  const previewReady = !pending && preview && previewSelection === selectionKey;
  useEffect(() => {
    if (!open) return;
    setKind(savingsAvailable ? savingsKind[0] : initialKind); setAudience("both"); setPromoCode(""); setCampaign(null); setError("");
    requestId.current = null;
  }, [open, eventId, initialKind, savingsAvailable]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setHistoryLoading(true); setHistoryError(false);
    sendRequest(`event/${eventId}/campaigns/history`, "GET", null, {}, false, false, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return;
        if (Array.isArray(result?.history)) {
          setHistory(result.history);
          setSentCount(result.sentCount ?? result.history.reduce((count, item) => count + (item.accepted || 0), 0));
        }
        else setHistoryError(true);
        setHistoryLoading(false);
      });
    return () => controller.abort();
  }, [open, eventId, historyRefresh, sendRequest]);
  useEffect(() => {
    if (!open || campaign || !availableKinds.some(([value]) => value === kind)) return;
    const controller = new AbortController();
    setPending(true); setPreview(null); setPreviewSelection(""); setError("");
    sendRequest(`event/${eventId}/campaigns/preview`, "POST", { kind, audience: effectiveAudience, promoCode }, {}, false, false, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return;
        if (result?.preview) { setPreview(result.preview); setPreviewSelection(selectionKey); setEnabled(result.sendingEnabled); }
        else setError("We couldn't review this campaign. Check your access and connection, then try again.");
        setPending(false);
      });
    return () => controller.abort();
  }, [open, eventId, kind, effectiveAudience, promoCode, refresh, campaign, sendRequest, savingsAvailable, pastEvent, selectionKey]);
  useEffect(() => {
    if (!open || !campaign?.id || terminalStatuses.has(campaign.status)) return;
    const controller = new AbortController();
    const poll = async () => {
      const result = await sendRequest(`event/${eventId}/campaigns/${campaign.id}`, "GET", null, {}, false, false, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setStatusError(!result?.campaign);
      if (result?.campaign) setCampaign(current => ({ ...current, ...result.campaign }));
    };
    poll();
    const timer = setInterval(poll, 5000);
    return () => { clearInterval(timer); controller.abort(); };
  }, [open, campaign?.id, campaign?.status, eventId, sendRequest, statusRefresh]);
  useEffect(() => {
    if (campaign?.status && terminalStatuses.has(campaign.status)) setHistoryRefresh(value => value + 1);
  }, [campaign?.status]);
  const confirm = async () => {
    if (submitLock.current || !previewReady || preview.blocked || !preview.total || !enabled || historyLoading || historyError) return;
    submitLock.current = true; setSending(true); setError("");
    requestId.current ||= crypto.randomUUID();
    try {
      const result = await sendRequest(`event/${eventId}/campaigns/confirm`, "POST", { kind, audience: effectiveAudience, promoCode, review: preview.review, requestId: requestId.current }, {}, false, false);
      if (result?.campaign) { setCampaign(result.campaign); setHistoryRefresh(value => value + 1); }
      else setError("We couldn't confirm the send. Refresh the recipient count, then try again. If it was already queued, it won't be sent twice.");
    } finally { submitLock.current = false; setSending(false); }
  };
  const button = (label, onClick, disabled = false, primary = false) => <button type="button" className={`event-form-button event-form-button--${primary ? "primary" : "ghost"}`} onClick={onClick} disabled={disabled}>{label}</button>;
  return <AppModal open={open} onClose={onClose} title={`Emails — ${event.title || "Event"}`} closable={!sending} maximizable={false}
    className={styles.modal} actions={campaign ? button("Done", onClose) : <>
      {button("Cancel", onClose, sending)}
      {button(sending ? <><span className="event-form-button__spinner" aria-hidden="true" />Queuing…</>
        : previewReady ? `Send ${emailCountLabel(preview.total)}` : "Send emails", confirm,
      sending || !previewReady || preview.blocked || !preview.total || !enabled || historyLoading || historyError, true)}
    </>}>
    <div className={styles.content} aria-busy={pending || sending}>
      {historyLoading && !history.length && <LoadingSkeleton label="Loading email history" count={1} />}
      {historyError && <LoadErrorBanner message="We couldn't load email history. Check it before sending another campaign." onRetry={() => setHistoryRefresh(value => value + 1)} />}
      {!!history.length && <details className={styles.history}>
        <summary><strong>{emailCountLabel(sentCount)} sent so far</strong><span>View history</span></summary>
        <div className={styles.historyBody}>
          <p>Sent means accepted by the mailer; inbox delivery is not confirmed.</p>
          <ul className={styles.historyList}>{history.map(item => <li key={item.campaignId}>
            <div className={styles.historyTitle}><strong>{campaignLabel(item.kind)}</strong><span>{formatSentAt(item.completedAt || item.createdAt)}</span></div>
            <p>{audiences.find(([value]) => value === item.audience)?.[1] || "Audience unknown"} · {item.source === "automatic" ? "Automatic" : "Manual"} · {item.status.replaceAll("-", " ")}</p>
            <p>{terminalStatuses.has(item.status)
              ? `${item.accepted || 0} accepted · ${item.skipped || 0} skipped · ${item.failed || 0} unconfirmed${item.notSent ? ` · ${item.notSent} not sent` : ""}`
              : `${item.total || 0} approved recipients · ${item.status === "sending" ? "Sending in progress" : "Queued for sending"}`}</p>
          </li>)}</ul>
        </div>
      </details>}
      {campaign ? <div role="status">
        <h3>Campaign {campaign.status.replaceAll("-", " ")}</h3>
        <p>{campaign.total} recipients were approved. {campaign.kind === savingsKind[0] ? "Consent, opt-outs and existing accounts are checked again before each email." : "Buyers, opt-outs and availability are checked again before each email."}</p>
        {campaign.counts && <p>{campaign.counts.accepted || 0} accepted by the mailer · {campaign.counts.skipped || 0} skipped · {campaign.counts.failed || 0} unconfirmed</p>}
        {statusError && <LoadErrorBanner message="We couldn't refresh delivery progress. The campaign may still be processing; don't send it again." onRetry={() => setStatusRefresh(value => value + 1)} />}
        {campaign.status === "stopped" && <p>The event or offer changed, so remaining emails were stopped. Contact an administrator before retrying this campaign.</p>}
        {campaign.status === "completed-with-errors" && <p>Some deliveries could not be confirmed after retries. Contact an administrator; do not resend them as a new campaign.</p>}
      </div> : <>
        {pastEvent && !savingsAvailable && <p className={styles.notice}>The guest savings email becomes available 3 days after the event.</p>}
        {!!availableKinds.length && <fieldset><legend>Campaign</legend><div className={styles.options}>{availableKinds.map(([value, label]) => <label key={value}><input type="radio" name="event-campaign-kind" checked={kind === value} onChange={() => { setKind(value); requestId.current = null; }} disabled={sending} />{label}</label>)}</div></fieldset>}
        {kind !== savingsKind[0] && !!availableKinds.length && <fieldset><legend>Audience</legend><div className={styles.options}>{audiences.map(([value, label]) => <label key={value}><input type="radio" name="event-campaign-audience" checked={audience === value} onChange={() => { setAudience(value); requestId.current = null; }} disabled={sending} />{label}</label>)}</div></fieldset>}
        {kind === "limited-offer" && <label className={styles.field}>Promo code to advertise (optional)<select value={promoCode} onChange={event => { setPromoCode(event.target.value); requestId.current = null; }} disabled={sending}>
          <option value="">Current price / automatic offers only</option>{[...new Set([...(preview?.promoCodes || []), ...(promoCode ? [promoCode] : [])])].map(code => <option key={code} value={code}>{code}</option>)}
        </select></label>}
        {pending && <LoadingSkeleton label="Counting eligible email recipients" count={1} />}
        {error && <LoadErrorBanner message={error} onRetry={() => setRefresh(value => value + 1)} disabled={sending} />}
        {previewReady && <>
          {preview.warnings.map(warning => <p key={warning} className={`${styles.notice} ${styles.warning}`} role="status">{warning}</p>)}
          {!enabled && <p className={styles.notice}>Sending is disabled in this environment.</p>}
          <p className={styles.recipientCount}><strong>{preview.total.toLocaleString("en-NL")}</strong> email{preview.total === 1 ? "" : "s"} to send</p>
          {!preview.total && <p className={styles.notice}>{kind === savingsKind[0] ? "No opted-in guest addresses remain. Existing accounts, opt-outs and addresses already queued for this event are excluded." : "No eligible recipients remain for this campaign. Ticket holders, opt-outs and previously contacted recipients are excluded. Choose another campaign or audience."}</p>}
        </>}
      </>}
    </div>
  </AppModal>;
}
EventCampaignModal.propTypes = { event: PropTypes.object.isRequired, open: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired, initialKind: PropTypes.oneOf([...kinds, savingsKind].map(([kind]) => kind)) };
