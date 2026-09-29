"use client";

import { LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import { useEffect, useState } from "react";
import Link from "next/link";
import PropTypes from "prop-types";
import { IconlyWallet } from "@/elements/ui/icons/IconlyIcons";
import { MembershipCardFront } from "./DigitalMembershipCard";
import styles from "./wallet.module.scss";

export default function MembershipCardThumbnail({ cardPath, locked, loading }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setResult(null);
    setError(false);
    if (!cardPath || locked) return;
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    fetch(`/api/cards/${encodeURIComponent(cardPath.split("/").pop())}`, {
      cache: "no-store", credentials: "omit", signal: controller.signal,
    }).then(async response => {
      if (!response.ok) throw new Error("Preview unavailable");
      const data = await response.json();
      if (!["active", "locked"].includes(data.card?.status) || !data.qrImage) throw new Error("Preview unavailable");
      if (active) setResult(data);
    }).catch(() => { if (active) setError(true); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; controller.abort(); clearTimeout(timeout); };
  }, [cardPath, locked, attempt]);

  if (!locked && result?.card.status === "active") {
    return <Link href={cardPath} target="_blank" rel="noopener noreferrer" className={styles.thumbnail} aria-label="Open your full membership card">
      <div aria-hidden="true"><MembershipCardFront card={result.card} qrImage={result.qrImage} /></div>
    </Link>;
  }

  const isLoading = !locked && (loading || (cardPath && !result && !error));
  if (isLoading) {
    return <div className={`${styles.thumbnail} ${styles.thumbnailSkeleton}`} role="status" aria-busy="true">
      <span className="visually-hidden">Loading membership card…</span>
      <span className={styles.skeletonPortrait} aria-hidden="true" />
      <span className={styles.skeletonName} aria-hidden="true" />
      <span className={styles.skeletonMembership} aria-hidden="true" />
      <span className={styles.skeletonQr} aria-hidden="true" />
    </div>;
  }
  if (error && !locked) {
    return <div className={styles.thumbnail}>
      <LoadErrorBanner compact message="Card preview unavailable." retryLabel="Retry card preview" onRetry={() => setAttempt(value => value + 1)} />
    </div>;
  }
  return <div className={`${styles.thumbnail} ${styles.thumbnailPlaceholder}`}>
    <IconlyWallet size={32} aria-hidden="true" />
    <span role="status">{locked || result?.card.status === "locked" ? "Card locked" : "Your card preview"}</span>
  </div>;
}

MembershipCardThumbnail.propTypes = { cardPath: PropTypes.string, locked: PropTypes.bool, loading: PropTypes.bool };
