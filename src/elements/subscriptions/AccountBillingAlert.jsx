"use client";
/* global Intl */

import { useId } from "react";
import { useDispatch } from "react-redux";
import { showModal } from "@/redux/modal";
import { USER_UPDATE_MODAL } from "@/util/defines/common";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { IconlyDanger } from "@/elements/ui/icons/IconlyIcons";
import { BillingStatusBannerSkeleton } from "./BillingStatusBanner";
import { getAccountStatusNotice } from "./account-status-notice.mjs";
import { useBillingAttention } from "./BillingAttentionProvider";
import SubscriptionStart from "./SubscriptionStart";
import SubscriptionManage from "@/elements/ui/buttons/SubscriptionManage";
import { billingAction, hasCustomerId, hasSubscriptionId } from "./subscription-checkout.mjs";
import styles from "./subscriptions.module.scss";

export default function AccountBillingAlert({ user, showAction = true, flushBottom = false, hideUnavailable = false }) {
  const dispatch = useDispatch();
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  const billing = useBillingAttention();
  const accountNotice = billing?.notice || getAccountStatusNotice(user);
  const notice = hideUnavailable && accountNotice?.reason === "unavailable" ? null : accountNotice;
  const loading = billing?.loading;
  const key = loading ? "loading" : notice ? `${notice.reason || notice.title}:${notice.description}` : null;
  const action = showAction && notice ? billingAction(user, notice.reason) : null;

  return <AnimatePresence mode="wait" initial={false}>
    {key && <motion.div key={key} className={styles.billingAlertTransition}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }} transition={{ duration: reduceMotion ? 0 : 0.22 }}>
      {loading ? <BillingStatusBannerSkeleton /> : <section className={`${styles.dangerBanner} ${flushBottom ? styles.dangerBannerFlushBottom : ""}`} role="alert" aria-labelledby={titleId}>
        <IconlyDanger className={styles.dangerIcon} aria-hidden />
        <h2 id={titleId}>{notice.title}</h2>
        <div className={styles.dangerContent}>
          <p>{notice.reason === "subscription_ended" && hasSubscriptionId(user?.subscription) ? "Your subscription has ended. Renew your previous subscription or switch to another plan to restore paid benefits." : notice.description}</p>
          {notice.reason === "unavailable" && showAction && <button className={styles.textButton} type="button" onClick={billing?.retry || (() => window.location.reload())}>Retry membership check</button>}
          {notice.amountDue > 0 && <p>Outstanding amount: <strong>{new Intl.NumberFormat("en-NL", { style: "currency", currency: notice.currency }).format(notice.amountDue / 100)}</strong></p>}
          {notice.paymentNote && <p>{notice.paymentNote}</p>}
          {notice.reason !== "unavailable" && showAction && <div className={styles.billingAlertActions}>
            {notice.reason === "info_requested" ? <button type="button" className={styles.textButton} aria-haspopup="dialog"
              onClick={() => dispatch(showModal(USER_UPDATE_MODAL))}>Complete profile</button>
              : action === "start" ? <>
                <SubscriptionStart user={user} renewal={hasSubscriptionId(user?.subscription)} linkStyle />
                {hasSubscriptionId(user?.subscription) && <SubscriptionStart user={user} buttonLabel="Switch" modalTitle="Switch subscription" linkStyle />}
              </>
              : action === "manage" && hasCustomerId(user?.subscription)
                ? <SubscriptionManage portalOnly portalLabel="Resolve" portalButtonClassName={styles.textButton} subscription={user.subscription} user={user} />
                : action === "support" && <a className={styles.dangerLink} href="/user#help">Contact support</a>}
          </div>}
        </div>
      </section>}
    </motion.div>}
  </AnimatePresence>;
}
AccountBillingAlert.propTypes = { user: PropTypes.object, showAction: PropTypes.bool, flushBottom: PropTypes.bool, hideUnavailable: PropTypes.bool };
