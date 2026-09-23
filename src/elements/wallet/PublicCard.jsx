"use client";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import DigitalMembershipCard from "./DigitalMembershipCard";
import MembershipCardSkeleton from "./MembershipCardSkeleton";
import { FiRotateCw } from "@/elements/ui/icons/IconlyIcons";
import { ANALYTICS_EVENTS } from "@/util/analytics/events.mjs";
import { clarityEvent } from "@/util/functions/helpers";
import styles from "@/screens/private/WalletCardPreview.module.scss";

export default function PublicCard({ token }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    clarityEvent(ANALYTICS_EVENTS.USER_CARD_OPENED);
  }, [token]);
  useEffect(() => {
    let active = true, controller;
    const load = async () => {
      controller?.abort();
      controller = new AbortController();
      const current = controller;
      setResult(null); setError("");
      const timeout = setTimeout(() => current.abort(), 20000);
      try {
        const response = await fetch(`/api/cards/${encodeURIComponent(token)}`, { cache: "no-store", credentials: "omit", signal: current.signal });
        if (!response.ok) throw new Error(response.status === 404 ? "This card is unavailable or its link has been revoked." : "Current membership status could not be verified.");
        const data = await response.json();
        if (!["active", "locked"].includes(data.card?.status)) throw new Error("Current membership status could not be verified.");
        if (active && controller === current) setResult(data);
      } catch (failure) {
        if (active && controller === current) setError(failure.name === "AbortError" ? "The status check timed out. Please try again." : failure.message);
      } finally { clearTimeout(timeout); }
    };
    load();
    const interval = setInterval(() => { if (document.visibilityState === "visible") load(); }, 60000);
    const visibility = () => { if (document.visibilityState === "visible") load(); else { controller?.abort(); setResult(null); } };
    document.addEventListener("visibilitychange", visibility);
    return () => { active = false; controller?.abort(); clearInterval(interval); document.removeEventListener("visibilitychange", visibility); };
  }, [token, attempt]);
  return <main className={`${styles.page} ${styles.publicPage}`}>
      {result ? <><DigitalMembershipCard card={result.card} qrImage={result.qrImage} tickets={result.ticketImages || []} />
        <p className={styles.attribution}>By the might of <a href="https://bulgariansociety.nl">Bulgarian Society Netherlands</a></p></> : error
      ? <div className={styles.cardError}>
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
PublicCard.propTypes = { token: PropTypes.string.isRequired };
