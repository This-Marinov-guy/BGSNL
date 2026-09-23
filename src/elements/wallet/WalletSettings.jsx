"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { showNotification } from "@/redux/notification";
import { selectUser } from "@/redux/user";
import { browserFetch } from "@/util/auth/browser-request.mjs";
import { ANALYTICS_EVENTS, ANALYTICS_PROPERTIES } from "@/util/analytics/events.mjs";
import { clarityEvent } from "@/util/functions/helpers";
import { readWalletDevice, walletDeviceMessage, availableWalletProvider, validGoogleWalletSaveUrl } from "@/util/wallet/device-support.mjs";
import { IconlyExternalLink, IconlyPlus, IconlyRotate, IconlyShare, IconlyWallet } from "@/elements/ui/icons/IconlyIcons";
import ImageTooltip from "@/elements/ui/media/ImageTooltip";
import WalletBadge from "./WalletBadge";
import styles from "./wallet.module.scss";

const WALLET_LOADING_TOAST = "wallet-card-preparation";

export default function WalletSettings({ user }) {
  const dispatch = useDispatch();
  const { session, roles } = useSelector(selectUser);
  const membershipLocked = user.status !== "active" || user.billingLocked === true || user.billingVerificationUnavailable === true ||
    (!user.hasBenefits && !(user.roles?.includes("alumni") && user.tier === 0));
  const [device, setDevice] = useState(null);
  const [check, setCheck] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const identity = `${session?.userId || ""}:${session?.sessionVersion || 0}:${session?.sid || ""}`;
  const action = useRef(null);
  const reportError = useCallback((message) => {
    setActionError(message);
    dispatch(showNotification({ severity: "error", summary: "Wallet card", detail: message, life: 6000, dismissToast: WALLET_LOADING_TOAST }));
  }, [dispatch]);
  const showLoadingToast = useCallback(() => {
    dispatch(showNotification({
      severity: "info",
      loading: true,
      detail: "Preparing your card…",
      toastId: WALLET_LOADING_TOAST,
      life: Infinity,
    }));
  }, [dispatch]);
  const dismissLoadingToast = useCallback(() => {
    dispatch(showNotification({ dismissToast: WALLET_LOADING_TOAST }));
  }, [dispatch]);

  useEffect(() => {
    setBusy(false);
    setShareMessage("");
    setActionError("");
    setCheck(null);
    return () => { action.current?.abort(); action.current = null; };
  }, [identity, membershipLocked]);

  useEffect(() => { setDevice(readWalletDevice()); }, []);
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("walletError");
    if (!code) return;
    url.searchParams.delete("walletError");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    reportError(code === "session" ? "Your session has ended. Please sign in again to add your card."
      : code === "unavailable" ? "This card is no longer available. Check your membership status and try again."
      : "Apple Wallet could not prepare your card. Please try again later.");
  }, [reportError]);
  useEffect(() => {
    if (!session?.userId || membershipLocked) return undefined;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let current = true;
    setCheck(null);
    setActionError("");
    browserFetch("/api/user/wallet/availability", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Wallet availability could not be checked");
        const data = await response.json();
        if (typeof data?.eligible !== "boolean" || !data.providers) throw new Error("Invalid wallet availability");
        if (current) setCheck({ identity, data });
      })
      .catch(() => { if (current) {
        setCheck({ identity, error: true });
        reportError("Wallet availability could not be checked. Please try again.");
      } })
      .finally(() => clearTimeout(timeout));
    return () => { current = false; controller.abort(); clearTimeout(timeout); };
  }, [identity, device?.provider, session?.userId, attempt, membershipLocked, reportError]);

  const currentCheck = check?.identity === identity ? check : null;
  const controlsLoading = !membershipLocked && Boolean(session?.userId) && (!device || !currentCheck);
  const provider = availableWalletProvider(device, currentCheck?.data);
  const hasCard = currentCheck?.data?.hasCard === true;
  const publicUrl = currentCheck?.data?.publicUrl;
  const cardPath = typeof publicUrl === "string" && /^https:\/\/bulgariansociety\.nl\/c\/[A-Za-z0-9_-]{22}$/.test(publicUrl)
    ? new URL(publicUrl).pathname : null;
  const create = async () => {
    if (membershipLocked || hasCard || !currentCheck?.data?.eligible || busy || action.current) return;
    const controller = new AbortController();
    action.current = controller;
    const timeout = setTimeout(() => controller.abort(), 30000);
    setBusy(true); setActionError("");
    showLoadingToast();
    let completed = false;
    try {
      const response = await browserFetch("/api/user/wallet/card", { method: "POST", signal: controller.signal });
      if (!response.ok) throw new Error("Your card could not be created. Please try again.");
      if (!controller.signal.aborted) { setAttempt((value) => value + 1); completed = true; }
    } catch (error) {
      if (action.current === controller) reportError(controller.signal.aborted ? "The request timed out. Please try again." : error.message);
    } finally {
      clearTimeout(timeout);
      if (action.current === controller) {
        action.current = null;
        setBusy(false);
        if (completed) dismissLoadingToast();
      }
    }
  };
  const share = async () => {
    if (membershipLocked || !hasCard || !cardPath || busy) return;
    setShareMessage(""); setActionError("");
    try {
      if (navigator.share) await navigator.share({ title: "BGSNL membership card", url: publicUrl });
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicUrl);
        setShareMessage("Card link copied.");
      } else setShareMessage("Open your card and copy the link from the address bar to share it.");
    } catch (error) {
      if (error.name !== "AbortError") reportError("Your card could not be shared. Open it and copy the link instead.");
    }
  };
  const add = async () => {
    if (membershipLocked || !provider || !hasCard || busy) return;
    if (action.current) return;
    clarityEvent(ANALYTICS_EVENTS.WALLET_ADD_CLICKED, { [ANALYTICS_PROPERTIES.WALLET_PROVIDER]: provider });
    const controller = new AbortController();
    action.current = controller;
    const timeout = setTimeout(() => controller.abort(), 35000);
    setBusy(true); setActionError("");
    showLoadingToast();
    let completed = false;
    try {
      // Recheck immediately before navigating, not just when Settings mounted.
      const fresh = await browserFetch("/api/user/wallet/availability", { signal: controller.signal });
      if (!fresh.ok) throw new Error("Wallet availability could not be verified. Please try again.");
      const availability = await fresh.json();
      controller.signal.throwIfAborted();
      setCheck({ identity, data: availability });
      if (!availability.hasCard || availableWalletProvider(readWalletDevice(), availability) !== provider) throw new Error("This card is not currently available for this device.");
      if (provider === "apple") {
        // Preserve the account page while Safari handles the pass MIME type.
        // A normal download link retains the native Wallet install sheet without
        // replacing this page with the .pkpass response.
        const link = document.createElement("a");
        link.href = "/api/user/wallet/apple";
        link.download = "bgsnl-membership.pkpass";
        link.hidden = true;
        document.body.append(link);
        link.click();
        link.remove();
      } else {
        const response = await browserFetch("/api/user/wallet/google", { method: "POST", signal: controller.signal });
        const result = await response.json();
        controller.signal.throwIfAborted();
        if (!response.ok || !validGoogleWalletSaveUrl(result?.saveUrl)) throw new Error("Google Wallet could not prepare your card. Please try again.");
        window.location.assign(result.saveUrl);
      }
      completed = true;
    } catch (error) {
      if (action.current === controller) reportError(controller.signal.aborted ? "The request timed out. Please try again." : error.message);
    } finally {
      clearTimeout(timeout);
      if (action.current === controller) {
        action.current = null;
        setBusy(false);
        if (completed) dismissLoadingToast();
      }
    }
  };

  let description = "Checking wallet support on this device…";
  if (currentCheck?.error) description = "Wallet availability could not be checked. Please try again.";
  else if (currentCheck?.data?.eligible && !hasCard) description = "Your card is not available yet. Select Create to prepare it.";
  else if (device && !device.provider) description = walletDeviceMessage(device.reason);
  else if (provider) description = `Keep your membership card in ${provider === "apple" ? "Apple" : "Google"} Wallet.`;
  else if (currentCheck?.data) description = currentCheck.data.eligible
    ? "Wallet cards are being prepared. Downloads will appear here when they are ready."
    : "A wallet card is not currently available for this account.";

  const badgeProviders = device?.provider ? [device.provider]
    : ["use_safari", "ipad"].includes(device?.reason) ? ["apple"]
    : device?.reason === "old_android" ? ["google"] : ["apple", "google"];

  return <li className="settings-list__item">
    <span aria-hidden="true" className="settings-list__icon"><IconlyWallet /></span>
    <div className="settings-list__text">
      <h3 className="settings-list__title">{roles?.includes("alumni") ? "Alumni card" : "Membership card"}</h3>
      {!membershipLocked && hasCard && <p className="settings-list__description">Your card is ready. Open or share it, or scan its QR code for current membership status.</p>}
      {!membershipLocked && shareMessage && <p className="settings-list__description" role="status">{shareMessage}</p>}
      {!membershipLocked && actionError && <p className="settings-list__description" role="alert">{actionError}</p>}
    </div>
    <div className={`settings-list__action ${styles.actions}`}>
      {membershipLocked ? <ImageTooltip label="Your membership is locked. Resolve your membership status to access your card." openOnClick>
        <span className={styles.lockedCard} tabIndex={0} role="img" aria-label="Membership card locked">
          <Image src="/assets/images/svg/3d/lock.png" alt="" width={56} height={56} />
        </span>
      </ImageTooltip> : controlsLoading ? <div className={styles.actionsSkeleton} role="status" aria-live="polite" aria-busy="true">
        <span className="visually-hidden">Loading membership card actions…</span>
        <span className={styles.iconActionSkeleton} aria-hidden="true" />
        <span className={styles.iconActionSkeleton} aria-hidden="true" />
        <span className={styles.badgeSkeleton} aria-hidden="true" />
      </div> : <>
      {currentCheck?.data?.eligible && !hasCard && <ImageTooltip label="Create card">
        <button type="button" disabled={busy} aria-label="Create card"
          className={`settings-action ${styles.iconAction}`} onClick={create}><IconlyPlus /></button>
      </ImageTooltip>}
      {hasCard && cardPath && <ImageTooltip label="Open card">
        <Link href={cardPath} target="_blank" rel="noopener noreferrer" aria-label="Open card"
          className={`settings-action ${styles.iconAction}`}><IconlyExternalLink /></Link>
      </ImageTooltip>}
      {hasCard && cardPath && <ImageTooltip label="Share card">
        <button type="button" disabled={busy} aria-label="Share card"
          className={`settings-action ${styles.iconAction}`} onClick={share}><IconlyShare /></button>
      </ImageTooltip>}
      {device && badgeProviders.map(badgeProvider => <WalletBadge key={badgeProvider} provider={badgeProvider}
        busy={busy} disabled={!hasCard || provider !== badgeProvider} unavailableReason={description} onClick={add} />)}
      {currentCheck?.error && <ImageTooltip label="Try again">
        <button type="button" aria-label="Try again" className={`settings-action ${styles.iconAction}`}
          onClick={() => setAttempt((value) => value + 1)}><IconlyRotate /></button>
      </ImageTooltip>}
      </>}
    </div>
  </li>;
}

WalletSettings.propTypes = { user: PropTypes.object.isRequired };
