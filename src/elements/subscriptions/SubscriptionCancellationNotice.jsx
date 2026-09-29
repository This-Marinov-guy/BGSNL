"use client";
/* global Intl */

import PropTypes from "prop-types";
import { IconlyDanger } from "@/elements/ui/icons/IconlyIcons";
import { hasScheduledCancellation, scheduledCancellationDate } from "./subscription-checkout.mjs";
import styles from "./subscriptions.module.scss";

export default function SubscriptionCancellationNotice({ user }) {
  if (user?.status !== "active" || !user.hasBenefits || !hasScheduledCancellation(user.subscription)) return null;
  const end = scheduledCancellationDate(user.subscription);
  return <section className={styles.chargeWarning} role="status" aria-label="Subscription cancellation scheduled">
    <IconlyDanger aria-hidden />
    <p><strong>Your subscription is scheduled to end.</strong></p>
    <p>{end ? <>Your subscription will end on <time dateTime={end.toISOString()}>{new Intl.DateTimeFormat("en-GB", {
      day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Amsterdam",
    }).format(end)}</time>.</> : "Your subscription will end at the end of the current billing period. Check Payments for the exact date."} You keep your paid benefits until then.</p>
  </section>;
}

SubscriptionCancellationNotice.propTypes = { user: PropTypes.object };
