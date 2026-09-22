"use client";

import styles from "@/screens/private/WalletCardPreview.module.scss";

export default function MembershipCardSkeleton() {
  return (
    <div className={styles.cardLoading} role="status" aria-live="polite" aria-busy="true">
      <span className="visually-hidden">Checking current membership status…</span>
      <div className={styles.cardToolbar} aria-hidden="true">
        <span className={styles.statusSkeleton} />
        <span className={styles.ticketsToggleSkeleton} />
      </div>
      <div className={styles.cardSkeleton} aria-hidden="true">
        <span className={styles.cardSkeletonPortrait} />
        <span className={styles.cardSkeletonName} />
        <span className={styles.cardSkeletonMembership} />
        <span className={styles.cardSkeletonQr} />
      </div>
    </div>
  );
}
