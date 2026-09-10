"use client";

import { useEffect, useState } from "react";
import { scheduleLoadingRecovery } from "./loading-recovery.mjs";
import styles from "./loading-recovery.module.scss";

export function LoadingRecoveryActions() {
  return (
    <div className={styles.actions}>
      <button type="button" className="rn-button-style--2 rn-btn-reverse-green rn-btn-small" onClick={() => window.location.reload()}>Retry</button>
      {/* Recovery deliberately bypasses the router/client cache, including a
          stuck navigation or account initialization that refresh() preserves. */}
      <a className="rn-button-style--2 rn-btn-reverse-red rn-btn-small" href="/">Home</a>
    </div>
  );
}

// Mounted only by the two full loading components. No portal or global state:
// finishing/replacing the loader removes its notice and cancels the timer.
export default function LoadingRecovery() {
  const [isSlow, setIsSlow] = useState(false);
  useEffect(() => scheduleLoadingRecovery(() => setIsSlow(true)), []);
  if (!isSlow) return null;
  return (
    <div className={styles.notice} aria-label="Loading help">
      <p role="status" aria-live="polite">This is taking longer than expected.</p>
      <LoadingRecoveryActions />
    </div>
  );
}
