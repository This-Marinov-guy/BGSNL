"use client";

import PropTypes from "prop-types";
import SubscriptionManage from "@/elements/ui/buttons/SubscriptionManage";
import AlumniRegistrationButton from "@/elements/ui/buttons/AlumniRegistrationButton";
import SubscriptionStart from "./SubscriptionStart";
import { billingAction, hasCustomerId, hasSubscriptionId } from "./subscription-checkout.mjs";
import { useBillingAttention } from "./BillingAttentionProvider";
import styles from "./subscriptions.module.scss";

export default function BillingActions({ user, hideSwitch = false }) {
  const billing = useBillingAttention();
  const action = billing?.loading ? "none" : billingAction(user, billing?.notice?.reason);
  const freeAlumni = user?.isAlumni && user?.tier === 0;
  return <div className="subscription-actions">
    {billing?.loading && <span role="status" aria-label="Checking billing actions" className={`${styles.skeletonBlock} ${styles.billingActionSkeleton}`} />}
    {action === "start" && (freeAlumni
      ? <AlumniRegistrationButton asLink={false} className={`settings-action rn-button-style--2 rn-btn-small ${styles.tierUpButton}`}>Tier up</AlumniRegistrationButton>
      : <SubscriptionStart user={user} renewal={hasSubscriptionId(user?.subscription)} />)}
    {action === "manage" ? <SubscriptionManage subscription={user.subscription} user={user} hideSwitch={hideSwitch} />
      : hasCustomerId(user?.subscription) && <SubscriptionManage portalOnly subscription={user.subscription} user={user} />}
    {action === "support" && <a className="settings-action rn-button-style--2 rn-btn-reverse-green rn-btn-small" href="/user#help">Contact support</a>}
  </div>;
}
BillingActions.propTypes = { user: PropTypes.object, hideSwitch: PropTypes.bool };
