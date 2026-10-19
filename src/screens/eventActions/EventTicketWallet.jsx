"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import HeaderTwo from "@/component/header/HeaderTwo";
import Footer from "@/component/footer/Footer";
import DonationModal from "@/elements/ui/modals/DonationModal";
import WalletBadge from "@/elements/wallet/WalletBadge";
import { readWalletDevice, validGoogleWalletSaveUrl } from "@/util/wallet/device-support.mjs";
import { eventTicketBrand } from "@/util/wallet/event-ticket-brand.mjs";
import { LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import MultiStepLoader from "@/elements/ui/loaders/MultiStepLoader";
import { ANALYTICS_EVENTS, ANALYTICS_PROPERTIES } from "@/util/analytics/events.mjs";
import { clarityEvent } from "@/util/functions/helpers";
import styles from "./event-ticket-wallet.module.scss";

const LONG_LOADING_MS = 12000;
const WALLET_STEPS = [{ text: "Ticket verified" }, { text: "Waiting for your Wallet pass" }];
const waitForWallet = (duration, signal) => new Promise((resolve, reject) => {
  const timeout = window.setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, duration);
  const abort = () => { window.clearTimeout(timeout); reject(signal.reason || new Error("Wallet request stopped")); };
  if (signal.aborted) abort(); else signal.addEventListener("abort", abort, { once: true });
});

const ticketImageHref = (value, preview) => {
  if (preview && value === "/assets/wallet-cards/preview-event-ticket.svg") return value;
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
};

export default function EventTicketWallet({ state, packet, issueError, autoDownloadPass = false, preview = false, previewProvider = null }) {
  const [provider, setProvider] = useState(previewProvider || "google");
  const [providerReady, setProviderReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [handoff, setHandoff] = useState("");
  const [legacyError, setLegacyError] = useState(Boolean(issueError));
  const request = useRef(null);
  const autoAttempted = useRef(false);
  const brand = eventTicketBrand(packet?.event?.region);
  const ticketImage = ticketImageHref(packet?.ticket?.image, preview);
  const hasPoster = /^https:\/\//.test(packet?.event?.poster || "") ||
    (preview && packet?.event?.poster === "/assets/wallet-cards/preview-event-poster.jpg");

  useEffect(() => {
    const detected = readWalletDevice();
    const appleDevice = /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);
    setProvider(previewProvider || detected?.provider || (appleDevice ? "apple" : "google"));
    setProviderReady(true);
  }, [previewProvider]);
  useEffect(() => () => {
    request.current?.abort();
    request.current = null;
  }, []);

  const start = useCallback(async (automatic = false) => {
    if (!packet || busy || request.current) return;
    setBusy(true);
    setActionError("");
    setHandoff("");
    setLegacyError(false);
    const controller = new AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 35000);
    const trackDownload = () => {
      try {
        clarityEvent(ANALYTICS_EVENTS.EVENT_TICKET_WALLET_DOWNLOAD_STARTED, {
          [ANALYTICS_PROPERTIES.WALLET_PROVIDER]: provider,
          [ANALYTICS_PROPERTIES.SOURCE]: automatic ? "auto_download" : "wallet_button",
        });
      } catch {
        // An analytics failure must not prevent the Wallet handoff.
      }
    };
    try {
      if (preview) {
        await waitForWallet(LONG_LOADING_MS, controller.signal);
        setHandoff("Preview complete. No Wallet pass was issued.");
        return;
      }
      const url = new URL(`/wallet/ticket/${provider}`, window.location.origin);
      const identity = new URLSearchParams(window.location.search);
      identity.delete("walletError");
      if (provider === "google") identity.set("response", "json");
      url.search = identity.toString();
      if (provider === "apple") {
        // A direct .pkpass download preserves Safari's native Wallet handoff.
        await waitForWallet(100, controller.signal);
        trackDownload();
        if (automatic) window.location.assign(url.href);
        else {
          const link = document.createElement("a");
          link.href = url.href;
          link.download = "bgsnl-event-ticket.pkpass";
          link.hidden = true;
          document.body.append(link);
          link.click();
          link.remove();
        }
        await waitForWallet(LONG_LOADING_MS, controller.signal);
        setHandoff("If your browser downloads the pass, open the file to add it to Apple Wallet.");
        return;
      }
      const response = await fetch(url, { cache: "no-store", credentials: "same-origin", redirect: "manual",
        referrerPolicy: "no-referrer", signal: controller.signal });
      if (!response.ok) throw new Error("Google Wallet could not prepare your ticket. Please try again.");
      if (!response.headers.get("content-type")?.includes("application/json")) throw new Error("Google Wallet returned an invalid response. Please try again.");
      const { saveUrl } = await response.json();
      if (!validGoogleWalletSaveUrl(saveUrl)) throw new Error("Google Wallet returned an invalid link. Please try again.");
      trackDownload();
      window.location.assign(saveUrl);
      await waitForWallet(LONG_LOADING_MS, controller.signal);
      setHandoff("If Google Wallet did not open, select Add to Google Wallet again.");
    } catch (error) {
      if (request.current === controller) setActionError(controller.signal.aborted
        ? "Preparing your Wallet pass timed out. Please try again."
        : error.message || "Your Wallet pass could not be prepared. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  }, [busy, packet, preview, provider]);

  useEffect(() => {
    if (!autoDownloadPass || !providerReady || state !== "ready" || !packet || issueError || autoAttempted.current) return;
    autoAttempted.current = true;
    start(true);
  }, [autoDownloadPass, providerReady, state, packet, issueError, start]);

  return <div className={styles.shell}>
    <HeaderTwo anonymous forceRegion={brand.region} />
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="wallet-title">
        {packet ? <div className={`${styles.event}${hasPoster ? ` ${styles.withPoster}` : ""}`}>
          <div className={styles.details}>
            <h1 id="wallet-title">{packet.event.title}</h1>
            <dl className={styles.facts}>
              <div><dt>Ticket holder</dt><dd>{packet.ticket.name}</dd></div>
              <div><dt>Tickets in booking</dt><dd>{packet.ticket.quantity}</dd></div>
            </dl>
          </div>
          {hasPoster && <div className={styles.poster}><img src={packet.event.poster} alt={`${packet.event.title} poster`} /></div>}
        </div> : <h1 id="wallet-title">Your event ticket</h1>}
        {state === "error" && <LoadErrorBanner onRetry={() => window.location.reload()} retryLabel="Reload ticket details">
          <h2 className={styles.errorTitle}>Ticket details unavailable</h2>
          <p>We couldn’t load your ticket details. Please try again.</p>
        </LoadErrorBanner>}
        {(actionError || legacyError) && <p className={styles.error} role="alert">{actionError || "Your Wallet pass could not be prepared. Please try again."}</p>}
        {packet && <div className={styles.actions}>
          {ticketImage && <a className={`rn-button-style--2 rn-btn-green ${styles.actionControl}`} href={ticketImage} target="_blank" rel="noopener noreferrer">View ticket</a>}
          <div className={styles.walletAction}>
            {providerReady ? <WalletBadge provider={provider} busy={busy} onClick={() => start(false)} />
              : <span className={styles.deviceCheck} role="status">Checking this device…</span>}
          </div>
        </div>}
        {handoff && <p className={styles.message} role="status">{handoff}</p>}
        {packet && !ticketImage && <p className={styles.fallback}>The ticket image isn’t available here. You can use the copy in your email at the entrance.</p>}
        {preview && <p className={styles.previewNote}>Preview only · Sample ticket · The Wallet action shows a 12-second loading preview without issuing a pass.</p>}
      </section>
      <MultiStepLoader loading={busy} loadingStates={WALLET_STEPS} value={1} label="Waiting for your Wallet pass" className={styles.loadingOverlay}>
        <h2 className={styles.loadingTitle}>Waiting for your Wallet pass</h2>
        <p className={styles.loadingNote}>We’re preparing your card. Please keep this page open.</p>
      </MultiStepLoader>
    </main>
    <Footer forceRegion={brand.region} />
    <DonationModal />
  </div>;
}

EventTicketWallet.propTypes = { state: PropTypes.oneOf(["ready", "error"]).isRequired,
  packet: PropTypes.object, issueError: PropTypes.string, autoDownloadPass: PropTypes.bool,
  preview: PropTypes.bool, previewProvider: PropTypes.oneOf(["apple", "google"]) };
