"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { readWalletDevice, walletDeviceMessage } from "@/util/wallet/device-support.mjs";
import { eventTicketBrand } from "@/util/wallet/event-ticket-brand.mjs";
import { LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import MultiStepLoader from "@/elements/ui/loaders/MultiStepLoader";
import styles from "./event-ticket-wallet.module.scss";

const PASS_STEPS = [
  { text: "Ticket details verified" },
  { text: "Preparing your secure pass" },
  { text: "Opening Wallet" },
];
const LOOKUP_STEPS = [
  { text: "Checking ticket details" },
  { text: "Preparing your secure pass" },
  { text: "Opening Wallet" },
];

export default function EventTicketWallet({ state, packet, providers, issueError }) {
  const [device, setDevice] = useState(null);
  const [busy, setBusy] = useState(false);
  const navigationTimer = useRef(null);
  const attemptedAutomatically = useRef(false);
  useEffect(() => { setDevice(readWalletDevice()); }, []);
  useEffect(() => {
    if (!busy) return undefined;
    // A native download may leave this page open without a browser callback.
    const timeout = window.setTimeout(() => setBusy(false), 15000);
    const onPageShow = () => setBusy(false);
    window.addEventListener("pageshow", onPageShow);
    return () => { window.clearTimeout(timeout); window.removeEventListener("pageshow", onPageShow); };
  }, [busy]);
  const provider = device?.provider;
  const brand = eventTicketBrand(packet?.event?.region);
  const available = state === "ready" && provider && providers?.[provider]?.available;
  const when = packet && new Date(packet.event.date).toLocaleString("en-GB", { timeZone: "Europe/Amsterdam", dateStyle: "full", timeStyle: "short" });
  const failed = state === "error" || !!issueError || !!(provider && !available);
  const deviceMessage = !device ? "Checking this device…" : !provider ? walletDeviceMessage(device.reason) : "";
  const start = useCallback((force = false) => {
    if ((!available && !force) || busy || !provider || !packet) return;
    setBusy(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("walletError");
    // Paint the modal before native navigation starts preparing the pass.
    navigationTimer.current = window.setTimeout(() => window.location.assign(`/wallet/ticket/${provider}${url.search}`), 100);
  }, [available, busy, packet, provider]);
  useEffect(() => {
    if (state !== "ready" || issueError || !available || attemptedAutomatically.current) return;
    attemptedAutomatically.current = true;
    start();
  }, [available, issueError, start, state]);
  const retry = () => {
    if (busy) return;
    if (state === "ready" && provider && packet) { start(true); return; }
    setBusy(true);
    navigationTimer.current = window.setTimeout(() => window.location.reload(), 100);
  };
  const closeProgress = () => {
    window.clearTimeout(navigationTimer.current);
    setBusy(false);
  };
  return <main className={styles.page}>
    <section className={styles.panel} aria-labelledby="wallet-title">
      <p className={styles.brand}><img src={brand.logoUrl} alt="" />{brand.name}</p>
      <h1 id="wallet-title">Add your event ticket to Wallet</h1>
      {packet && <div className={styles.event}>
        <div className={styles.details}>
          <strong>{packet.event.title}</strong>
          <span>{when}</span>
          {packet.event.location && <span>{packet.event.location}</span>}
          <span>Ticket for {packet.ticket.name}{packet.ticket.quantity > 1 ? ` · ${packet.ticket.quantity} tickets in this booking` : ""}</span>
        </div>
        {/^https:\/\//.test(packet.event.poster) && <div className={styles.poster}><img src={packet.event.poster} alt={`${packet.event.title} poster`} /></div>}
      </div>}
      {failed && <LoadErrorBanner onRetry={retry} retryLabel="Retry downloading the pass" showHome disabled={busy}>
        <h2 className={styles.errorTitle}>Pass unavailable</h2>
        <p>Downloading the pass failed! Please retry or contact support!</p>
      </LoadErrorBanner>}
      {!failed && <>
        {deviceMessage ? <p className={styles.message} role="status">{deviceMessage}</p>
          : <p className={styles.hint}>Wallet will open automatically with the same QR code as your ticket email.</p>}
        {available && <button type="button" className={styles.action} onClick={() => start()} disabled={busy} aria-busy={busy}>
          {busy ? "Preparing your pass…" : `Add to ${provider === "apple" ? "Apple" : "Google"} Wallet`}
        </button>
        }
      </>}
      <p className={styles.fallback}>You can always use the ticket in your email at the entrance.</p>
    </section>
    <MultiStepLoader loading={busy} loadingStates={packet ? PASS_STEPS : LOOKUP_STEPS} value={packet ? 1 : 0} closable onClose={closeProgress} label="Preparing your Wallet pass" className={styles.loadingOverlay}>
      <div className={styles.loadingIdentity}><img src={brand.logoUrl} alt="" /><span>{brand.name}</span></div>
      <h2 className={styles.loadingTitle}>Preparing your Wallet pass</h2>
      <p className={styles.loadingNote}>This can take a moment. Please keep this page open.</p>
    </MultiStepLoader>
  </main>;
}

EventTicketWallet.propTypes = { state: PropTypes.oneOf(["ready", "error"]).isRequired,
  packet: PropTypes.object, providers: PropTypes.object, issueError: PropTypes.string };
