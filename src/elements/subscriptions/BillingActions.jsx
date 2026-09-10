"use client";

import PropTypes from "prop-types";
import SubscriptionManage from "@/elements/ui/buttons/SubscriptionManage";
import SubscriptionStart from "./SubscriptionStart";
import { billingAction } from "./subscription-checkout.mjs";
import { useBillingAttention } from "./BillingAttentionProvider";
import styles from "./subscriptions.module.scss";

export default function BillingActions({ user }) {
  const billing = useBillingAttention();
  if (billing?.loading) return <span role="status" aria-label="Checking billing actions" className={`${styles.skeletonBlock} ${styles.billingActionSkeleton}`} />;
  const action = billingAction(user, billing?.notice?.reason);
  return <div className="subscription-actions">
    {action === "start"
      ? <SubscriptionStart />
      : action === "manage"
        ? <SubscriptionManage subscription={user.subscription} />
        : <a className="settings-action rn-button-style--2 rn-btn-reverse-green rn-btn-small" href="/user#help">Contact support</a>}
  </div>;
}
BillingActions.propTypes = { user: PropTypes.object };
