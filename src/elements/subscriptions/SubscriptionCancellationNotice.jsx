"use client";
/* global Intl */

import PropTypes from "prop-types";
import { IconlyDanger } from "@/elements/ui/icons/IconlyIcons";
import { hasScheduledCancellation, scheduledCancellationDate } from "./subscription-checkout.mjs";
import styles from "./subscriptions.module.scss";

export default function SubscriptionCancellationNotice({ user }) {
  if (user?.status !== "active" || !user.hasBenefits) return null;
  const canceled = user.subscription?.status === "canceled";
  if (!canceled && !hasScheduledCancellation(user.subscription)) return null;
  const end = canceled ? new Date(user.subscription.currentPeriodEnd) : scheduledCancellationDate(user.subscription);
  if (!end || !Number.isFinite(end.getTime()) || end.getTime() <= Date.now()) return null;
  return <section className={styles.dangerBanner} role="alert" aria-label="Subscription cancellation scheduled">
    <IconlyDanger className={styles.dangerIcon} aria-hidden />
    <h2>Your subscription is ending</h2>
    <div className={styles.dangerContent}><p>Your subscription will end on <time dateTime={end.toISOString()}>{new Intl.DateTimeFormat("en-GB", {
      day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Amsterdam",
    }).format(end)}</time>. You keep your paid benefits until then.</p></div>
  </section>;
}

SubscriptionCancellationNotice.propTypes = { user: PropTypes.object };
