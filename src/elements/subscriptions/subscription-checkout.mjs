/* global Intl */
const ENDED_STATUSES = new Set(["canceled", "incomplete_expired"]);

export const hasSubscriptionId = (subscription) => typeof subscription?.id === "string" && /^sub_[A-Za-z0-9]+$/.test(subscription.id.trim());

export function hasBillingReference(subscription) {
  return hasSubscriptionId(subscription) ||
    (typeof subscription?.customerId === "string" && /^cus_[A-Za-z0-9]+$/.test(subscription.customerId.trim()));
}

// This only controls the UI. The API re-checks the account and Stripe state.
export function canStartSubscription(user) {
  return !!user && ["active", "locked", "payment_awaiting"].includes(user.status) &&
    (!user.subscription?.id || ENDED_STATUSES.has(user.subscription.status));
}

export function canManageSubscription(user) {
  return !canStartSubscription(user) && hasBillingReference(user?.subscription);
}

export function billingAction(user, reason) {
  if (!["active", "locked", "payment_awaiting"].includes(user?.status) ||
      ["account_restricted", "account_sync_pending", "unsupported_plan"].includes(reason)) return "support";
  if (canStartSubscription(user) && reason !== "unavailable") return "start";
  return canManageSubscription(user) ? "manage" : "support";
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

export async function requestSubscriptionCheckout(request, priceId, origin) {
  const response = await request("payment/subscription/change", "POST", {
    itemId: priceId,
    origin_url: origin,
  }, {}, true, false);

  // Reconciliation may discover an existing subscription and return the portal.
  let url;
  try { url = new URL(response?.url); } catch { /* Show the recoverable error below. */ }
  if (!url || url.protocol !== "https:" || url.username || url.password || url.port ||
    !["checkout.stripe.com", "billing.stripe.com"].includes(url.hostname)) {
    throw new Error("We could not open the payment page. Please try again or contact support if the problem continues.");
  }
  return url.href;
}
