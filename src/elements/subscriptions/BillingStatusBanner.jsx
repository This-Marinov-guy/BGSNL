"use client";

import PropTypes from "prop-types";
import { useId } from "react";
import { IconlyDanger } from "@/elements/ui/icons/IconlyIcons";
import { getAccountStatusNotice } from "./account-status-notice.mjs";
import styles from "./subscriptions.module.scss";

export function BillingStatusBannerSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Checking account benefits"
      className={`${styles.dangerBanner} ${styles.dangerBannerSkeleton}`}
      role="status"
    >
      <span className="visually-hidden">Checking account benefits</span>
      <span
        aria-hidden="true"
        className={`${styles.skeletonBlock} ${styles.skeletonIcon}`}
      />
      <span
        aria-hidden="true"
        className={`${styles.skeletonBlock} ${styles.skeletonTitle}`}
      />
      <div aria-hidden="true" className={styles.dangerContent}>
        <span
          className={`${styles.skeletonBlock} ${styles.skeletonLine}`}
        />
        <span
          className={`${styles.skeletonBlock} ${styles.skeletonLine} ${styles.skeletonLineShort}`}
        />
      </div>
    </section>
  );
}

export default function BillingStatusBanner({
  user,
  context = "account",
  missedDiscount = null,
  showMissingBenefits = false,
}) {
  const titleId = useId();
  const notice =
    getAccountStatusNotice(user) ||
    (showMissingBenefits && user?.hasBenefits !== true
      ? {
          title: "Account attention needed",
          description:
            "Your account does not currently have active membership benefits. Review your account settings to resolve the issue before using member benefits.",
          href: "/user#settings",
          actionLabel: "Go to settings",
        }
      : null);
  if (!notice) return null;

  const actionLink = (
    // Native fragment navigation triggers the account page's hashchange listener.
    <a className={styles.dangerLink} href={notice.href}>
      {notice.actionLabel}
    </a>
  );

  return (
    <section
      className={`${styles.dangerBanner} ${styles.dangerBannerReady}`}
      role="alert"
      aria-labelledby={titleId}
    >
      <IconlyDanger className={styles.dangerIcon} aria-hidden />
      <h2 id={titleId}>{notice.title}</h2>
      <div className={styles.dangerContent}>
        {context === "ticket" ? (
          <p>
            Guest checkout only—this ticket won’t be saved to your account. Restore
            access to get your {missedDiscount && (
              <><strong>{missedDiscount} member discount</strong> and keep it in your account. </>
            )}{!missedDiscount && <>member discount and keep it in your account. </>}
            {actionLink}
          </p>
        ) : (
          <>
            <p>
              {notice.description}
              {!notice.paymentNote && <> {actionLink}</>}
            </p>
            {notice.paymentNote && <p>{notice.paymentNote} {actionLink}</p>}
          </>
        )}
      </div>
    </section>
  );
}

BillingStatusBanner.propTypes = {
  user: PropTypes.object,
  context: PropTypes.oneOf(["account", "ticket"]),
  missedDiscount: PropTypes.string,
  showMissingBenefits: PropTypes.bool,
};
