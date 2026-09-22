"use client";

import { useEffect, useState } from "react";
import DigitalMembershipCard from "@/elements/wallet/DigitalMembershipCard";
import MembershipCardSkeleton from "@/elements/wallet/MembershipCardSkeleton";
import { TEST_CASES } from "@/util/wallet/test-card.mjs";
import styles from "./WalletCardPreview.module.scss";

export default function WalletCardPreview() {
  const [cardId, setCardId] = useState("member-active");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("card");
    if (requested) setCardId(requested);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setResult(null);
    setError("");
    async function load() {
      try {
        const response = await fetch(`/api/dev/wallet-card?card=${encodeURIComponent(cardId)}`, {
          cache: "no-store", signal: controller.signal,
        });
        if (!response.ok) throw new Error(response.status === 404 ? "Card unavailable" : "Unable to fetch card status");
        const data = await response.json();
        if (!controller.signal.aborted) setResult(data);
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.message);
      }
    }
    load();
    return () => controller.abort();
  }, [cardId, reload]);

  const card = result?.card;
  return (
    <main className={styles.page}>
      <h1>Membership card preview</h1>
      <p>Mock data only. Nothing is issued to Apple or Google Wallet.</p>
      <div className={styles.controls}>
        <label htmlFor="wallet-case">Test case</label>
        <select id="wallet-case" value={cardId} onChange={(event) => {
          setCardId(event.target.value);
          window.history.replaceState(null, "", `?card=${event.target.value}`);
        }}>
          {!TEST_CASES.includes(cardId) && <option value={cardId}>Unknown card</option>}
          {TEST_CASES.map((id) => <option key={id} value={id}>{id.replaceAll("-", " · ")}</option>)}
        </select>
        <button type="button" onClick={() => setReload((value) => value + 1)}>Refresh status</button>
      </div>
      {error && <p role="alert">{error}. No active status is assumed.</p>}
      {!result && !error && <MembershipCardSkeleton />}
      {card && <>
        <DigitalMembershipCard card={card} qrImage={result.qrImage} tickets={result.ticketImages || []} />
        <p className={styles.hint}>The status badge sits above the card for this preview. Your supplied background is unchanged.</p>
        <p className={styles.hint}>Scanning localhost from a phone will not reach this computer. Set WALLET_TEST_BASE_URL to a reachable test address first.</p>
        <details className={styles.drafts}>
          <summary>Apple and Google native payload drafts</summary>
          <p>These are unsigned data drafts, not installable passes or accurate native-layout previews. Native artwork and signing still require setup.</p>
          <pre>{JSON.stringify(result.nativeDrafts, null, 2)}</pre>
        </details>
      </>}
    </main>
  );
}
