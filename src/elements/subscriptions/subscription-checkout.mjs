/* global Intl */
const ENDED_STATUSES = new Set(["canceled", "incomplete_expired"]);

export const hasSubscriptionId = (subscription) => typeof subscription?.id === "string" && /^sub_[A-Za-z0-9]+$/.test(subscription.id.trim());
export const hasCustomerId = (subscription) => typeof subscription?.customerId === "string" && /^cus_[A-Za-z0-9]+$/.test(subscription.customerId.trim());
export const hasEndedSubscription = (subscription) => ENDED_STATUSES.has(subscription?.status);
export const hasScheduledCancellation = (subscription) => !hasEndedSubscription(subscription) &&
  !!(subscription?.cancelAtPeriodEnd || subscription?.cancelAt);

export function scheduledCancellationDate(subscription) {
  if (!hasScheduledCancellation(subscription)) return null;
  for (const value of [subscription.cancelAt, subscription.cancelAtPeriodEnd ? subscription.currentPeriodEnd : null]) {
    if (!value) continue;
    const date = new Date(value);
    if (Number.isFinite(date.getTime())) return date;
  }
  return null;
}


export function hasBillingReference(subscription) {
  return hasSubscriptionId(subscription) || hasCustomerId(subscription);
}

// This only controls the UI. The API re-checks the account and Stripe state.
export function canStartSubscription(user) {
  return !!user && ["active", "locked", "payment_awaiting"].includes(user.status) &&
    !user.billingVerificationUnavailable && (!user.subscription?.id || hasEndedSubscription(user.subscription));
}

export function canManageSubscription(user) {
  return !canStartSubscription(user) && hasBillingReference(user?.subscription);
}

export function canSwitchSubscription(user) {
  return user?.status === "active" && hasSubscriptionId(user.subscription) &&
    ["active", "trialing"].includes(user.subscription.status) &&
    !user.billingLocked && !user.billingVerificationUnavailable &&
    !user.subscription.pendingUpdate && !hasScheduledCancellation(user.subscription);
}

export function billingAction(user, reason) {
  // Unknown billing state is not evidence of either an active or absent subscription.
  if (reason === "unavailable" || (!reason && user?.billingVerificationUnavailable)) return "none";
  if (!["active", "locked", "payment_awaiting"].includes(user?.status) ||
      ["account_restricted", "account_sync_pending"].includes(reason)) return "support";
  if (["no_membership", "subscription_ended", "late_payment_review"].includes(reason)) return "start";
  if (reason && hasSubscriptionId(user.subscription)) return "manage";
  if (canStartSubscription(user)) return "start";
  return hasSubscriptionId(user.subscription) && !hasEndedSubscription(user.subscription) ? "manage" : "support";
}

export function paidSubscriptionPlans(plans) {
  if (!Array.isArray(plans)) throw new Error("Subscription options are unavailable.");
  return plans.filter((plan) => plan && ["member", "alumni"].includes(plan.type) &&
    /^price_[A-Za-z0-9]+$/.test(plan.priceId) &&
    Number.isSafeInteger(plan.amount) && plan.amount > 0 && plan.currency === "eur" &&
    ["month", "year"].includes(plan.interval) &&
    Number.isSafeInteger(plan.intervalCount) && plan.intervalCount > 0);
}

export function subscriptionPlanLabel(plan) {
  const price = new Intl.NumberFormat("en-NL", { style: "currency", currency: plan.currency }).format(plan.amount / 100);
  const interval = plan.intervalCount === 1 ? plan.interval : `${plan.intervalCount} ${plan.interval}s`;
  return `${plan.label} — ${price} / ${interval}`;
}

export function planChangeChargesImmediately(current, selected) {
  return !!selected && (!current || current.type !== selected.type ||
    (current.type === "alumni" && (current.tier == null || selected.tier > current.tier)));
}

export function validChargeQuote(quote, priceId) {
  return !!quote && typeof priceId === "string" && quote.priceId === priceId &&
    Number.isSafeInteger(quote.amountDue) && quote.amountDue >= 0 && quote.currency === "eur";
}

export function chargeAmountLabel(quote) {
  return new Intl.NumberFormat("en-NL", { style: "currency", currency: "eur" }).format(quote.amountDue / 100);
}

export async function requestSubscriptionCheckout(request, priceId, origin, region) {
  const response = await request("payment/subscription/change", "POST", {
    itemId: priceId,
    origin_url: origin,
    ...(region ? { region } : {}),
  }, {}, true, false);

  // Same-programme changes are saved without a payment redirect. Callers
  // refresh account state; never navigate to an arbitrary API-provided URL.
  if (response?.updated === true) return null;

  // Reconciliation may discover an existing subscription and return the portal.
  let url;
  try { url = new URL(response?.url); } catch { /* Show the recoverable error below. */ }
  if (!url || url.protocol !== "https:" || url.username || url.password || url.port ||
    !["checkout.stripe.com", "billing.stripe.com"].includes(url.hostname)) {
    throw new Error("We could not open the payment page. Please try again or contact support if the problem continues.");
  }
  return url.href;
}
