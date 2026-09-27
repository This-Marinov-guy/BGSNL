"use client";
import RetryIcon from "@/elements/ui/icons/RetryIcon";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import DigitalMembershipCard from "./DigitalMembershipCard";
import MembershipCardSkeleton from "./MembershipCardSkeleton";
import { FiRotateCw } from "@/elements/ui/icons/IconlyIcons";
import { ANALYTICS_EVENTS } from "@/util/analytics/events.mjs";
import styles from "@/screens/private/WalletCardPreview.module.scss";

export default function PublicCard({ token, initialResult = null, initialError = "" }) {
  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState(initialError);
  const [checking, setChecking] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    // Analytics must not sit on the initial card rendering path.
    if (process.env.NODE_ENV === "production") void import("@/util/functions/helpers").then(({ clarityEvent }) => clarityEvent(ANALYTICS_EVENTS.USER_CARD_OPENED)).catch(() => {});
  }, [token]);
  useEffect(() => {
    let active = true, controller;
    const load = async () => {
      controller?.abort();
      controller = new AbortController();
      const current = controller;
      setChecking(true); setError("");
      const timeout = setTimeout(() => current.abort(), 20000);
      try {
        const response = await fetch(`/api/cards/${encodeURIComponent(token)}`, { cache: "no-store", credentials: "omit", signal: current.signal });
        if (response.status === 404 && active && controller === current) setResult(null);
        if (!response.ok) throw new Error(response.status === 404 ? "This card is unavailable or its link has been revoked." : "Current membership status could not be verified.");
        const data = await response.json();
        if (!["active", "locked"].includes(data.card?.status)) throw new Error("Current membership status could not be verified.");
        if (active && controller === current) setResult(data);
      } catch (failure) {
        if (active && controller === current) setError(failure.name === "AbortError" ? "The status check timed out. Please try again." : failure.message);
      } finally { clearTimeout(timeout); if (active && controller === current) setChecking(false); }
    };
    // Fresh server data already contains the first lookup; do not duplicate it.
    if (attempt > 0 || (!initialResult && !initialError) || (initialResult && Date.now() - initialResult.verifiedAt >= 60000)) load();
    const interval = setInterval(() => { if (document.visibilityState === "visible") load(); }, 60000);
    const visibility = () => { if (document.visibilityState === "visible") load(); else { controller?.abort(); controller = null; setChecking(true); } };
    document.addEventListener("visibilitychange", visibility);
    return () => { active = false; controller?.abort(); clearInterval(interval); document.removeEventListener("visibilitychange", visibility); };
  }, [token, attempt, initialResult, initialError]);
  return <main className={`${styles.page} ${styles.publicPage}`}>
      {result ? <><DigitalMembershipCard card={result.card} qrImage={result.qrImage} tickets={result.ticketImages || []} verification={checking ? "checking" : error ? "error" : null} />
        {error && <p role="alert">{error} <button type="button" onClick={() => setAttempt(value => value + 1)}><RetryIcon />Retry</button></p>}
        <p className={styles.attribution}>By the might of <a href="https://bulgariansociety.nl">Bulgarian Society Netherlands</a></p></> : error
      && !checking ? <div className={styles.cardError}>
        <p role="alert">{error}</p>
        <button
          aria-label="Try loading the membership card again"
          className={styles.retryButton}
          onClick={() => setAttempt((value) => value + 1)}
          title="Try again"
          type="button"
        ><FiRotateCw size={22} /></button>
      </div>
      : <MembershipCardSkeleton />}
  </main>;
}
PublicCard.propTypes = { token: PropTypes.string.isRequired, initialResult: PropTypes.object, initialError: PropTypes.string };
