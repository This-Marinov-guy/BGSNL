"use client";
/* global Intl */

import { useId } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { IconlyDanger } from "@/elements/ui/icons/IconlyIcons";
import { BillingStatusBannerSkeleton } from "./BillingStatusBanner";
import { getAccountStatusNotice } from "./account-status-notice.mjs";
import { useBillingAttention } from "./BillingAttentionProvider";
import BillingActions from "./BillingActions";
import styles from "./subscriptions.module.scss";

export default function AccountBillingAlert({ user, showAction = true }) {
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  const billing = useBillingAttention();
  const notice = billing?.notice || getAccountStatusNotice(user);
  const loading = billing?.loading;
  const key = loading ? "loading" : notice ? `${notice.reason || notice.title}:${notice.description}` : null;

  return <AnimatePresence mode="wait" initial={false}>
    {key && <motion.div key={key} className={styles.billingAlertTransition}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }} transition={{ duration: reduceMotion ? 0 : 0.22 }}>
      {loading ? <BillingStatusBannerSkeleton /> : <section className={styles.dangerBanner} role="alert" aria-labelledby={titleId}>
        <IconlyDanger className={styles.dangerIcon} aria-hidden />
        <h2 id={titleId}>{notice.title}</h2>
        <div className={styles.dangerContent}>
          <p>{notice.description}</p>
          {notice.amountDue > 0 && <p>Outstanding amount: <strong>{new Intl.NumberFormat("en-NL", { style: "currency", currency: notice.currency }).format(notice.amountDue / 100)}</strong></p>}
          {notice.paymentNote && <p>{notice.paymentNote}</p>}
          {(showAction || notice.reason === "unavailable") && <div className={styles.billingAlertActions}>
            {showAction && <BillingActions user={user} />}
            {notice.reason === "unavailable" && <button className="settings-action rn-button-style--2 rn-btn-reverse-green rn-btn-small" type="button" onClick={billing.retry}>Try again</button>}
          </div>}
        </div>
      </section>}
    </motion.div>}
  </AnimatePresence>;
}
AccountBillingAlert.propTypes = { user: PropTypes.object, showAction: PropTypes.bool };
