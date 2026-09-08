"use client";

import PropTypes from "prop-types";
import { IconlyDanger } from "@/elements/ui/icons/IconlyIcons";
import SubscriptionManage from "@/elements/ui/buttons/SubscriptionManage";
import styles from "./subscriptions.module.scss";

export default function BillingStatusBanner({ user }) {
  if (!user?.billingVerificationUnavailable && !user?.billingLocked && !["locked", "payment_awaiting", "frozen"].includes(user?.status)) return null;
  const failed = user.lockReason === "payment_failed";
  const suspended = user.status === "frozen";
  return (
    <section className={styles.dangerBanner} role="alert" aria-labelledby="billing-warning-title">
      <IconlyDanger aria-hidden />
      <div>
        <h2 id="billing-warning-title">{user.billingVerificationUnavailable ? "We could not verify your subscription" : failed ? "Your account is locked" : "Your membership benefits are unavailable"}</h2>
        <p>{user.billingVerificationUnavailable ? "Billing is temporarily unavailable. Your profile and settings are still accessible, but benefits cannot be used until we verify your subscription. Please try again shortly."
          : suspended ? "Your account is suspended. Please contact support for help."
          : failed ? "We could not collect your subscription payment. All membership benefits are locked. Update your payment method and pay the outstanding invoice, or cancel your subscription in the Stripe customer portal."
            : user.lockReason === "subscription_ended" ? "Your subscription has ended. You can still manage your account and choose a new plan in Settings."
              : "Your subscription needs attention. Open Stripe billing to check your payment or cancel your subscription. Your profile and settings remain available."}</p>
        {failed && <p>Benefits return after payment is confirmed. Cancelling does not restore paid benefits or automatically settle an outstanding invoice.</p>}
        {user.subscription?.customerId && <SubscriptionManage canCancel={user.isSubscribed} />}
      </div>
    </section>
  );
}

BillingStatusBanner.propTypes = { user: PropTypes.object };
