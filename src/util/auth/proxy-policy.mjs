// Explicit website methods/paths, not a general-purpose server-key proxy.
// Integrations, maintenance jobs, payment receipts and signed webhooks remain
// on their existing direct API/server-to-server paths.
const routes = {
  GET: [
    "dashboard/monthly-summary/:month",
    "common/region-emails",
    "event/:id/campaigns/:campaignId",
    "event/guest-signup-prefill",
    "event/feedback/:ticketId",
    "event/:eventId/feedback",
    "event/guest-list/:eventId/guests/:guestId/refund",
    "support/conversations/activity",
    "event/guest-list/:id/stream",
    "user/wallet/availability", "user/wallet/apple", "user/wallet/card",
    "security/passkeys", "security/google/config", "security/connected-accounts",
    "user/current", "user/get-subscription-status", "user/refresh-token", "user/roles", "user/promotions",
    "user/campaigns/:id", "user/active-alumni", "user/tree-layout",
    "common/get-total-member-count", "common/get-member-count", "common/get-active-member-count", "common/get-about-data",
    "event/get-purchase-status/:id", "event/event-details/:id", "event/events-list", "event/sold-ticket-count/:id", "event/check-member/:id/:eventId", "event/guest-list/:id",
    "future-event/full-event-details/:id", "future-event/full-data-events-list", "future-event/scanner-access", "future-event/scanner-events", "future-event/draft-count", "future-event/cancel-event/:eventId/preview",
    "payment/donation/config", "payment/subscription/plans", "payment/subscription/billing-details",
    "internship/list", "internship/admin-list", "dashboard/members", "dashboard/events-analytics", "dashboard/member-statistics", "dashboard/event-statistics", "backoffice/accounts", "backoffice/accounts/bulk-roles/template", "backoffice/accounts/:type/:id/membership",
    "support/profile", "support/conversations", "support/conversations/:id", "support/inbox", "support/inbox/unanswered", "support/inbox/activity", "support/inbox/:id",
    "monitoring/overview", "monitoring/jobs", "monitoring/quotas",
    "wordpress/posts", "wordpress/posts/:id",
  ],
  POST: [
    "event/:id/campaigns/preview", "event/:id/campaigns/confirm",
    "event/feedback/:ticketId",
    "event/guest-list/:eventId/guests/:guestId/refund",
    "event/guest-list/:eventId/guests/:guestId/send-ticket",
    "event/guest-list/:eventId/guests/:guestId/send-receipt",
    "support/live",
    "user/wallet/google", "user/wallet/card",
    "backoffice/access-requests", "backoffice/accounts/bulk-roles/preview", "backoffice/accounts/bulk-roles/apply", "backoffice/accounts/:type/:id/cancel-subscription", "backoffice/accounts/:type/:id/transfer",
    "security/login", "security/profile-change/confirm", "security/check-email", "security/signup", "security/alumni-signup",
    "security/send-password-token", "security/verify-token", "security/encrypt-data",
    "security/google/login/challenge", "security/google/login", "security/google/link/challenge", "security/google/link", "security/google/disconnect",
    "security/passkeys/login/options", "security/passkeys/login", "security/passkeys/register/options", "security/passkeys/register", "security/passkeys/remove",
    "user/active-member", "user/campaigns/:id/seen", "user/verify-calendar-subscription", "user/convert-to-alumni", "user/convert-alumni-to-user", "user/add-document",
    "common/marketing-email", "common/contact/validate", "event/check-ticket-eligibility", "event/purchase-ticket/guest", "event/purchase-ticket/member",
    "event/register/non-society-event", "event/non-society-event/resend-email",
    "future-event/add-event", "future-event/draft/:id/reminder", "future-event/cancel-event/:eventId", "future-event/cancel-event/:eventId/confirm",
    "payment/donation/create-payment-intent", "payment/playground/ticket", "payment/checkout/general", "payment/checkout/member-ticket", "payment/checkout/guest-ticket", "payment/checkout/signup",
    "payment/subscription/general", "payment/subscription/customer-portal", "payment/subscription/change", "payment/subscription/preview",
    "internship/add", "internship/member-apply", "support/conversations", "support/conversations/:id/messages", "support/conversations/:id/status",
    "support/inbox/:id/messages", "support/inbox/:id/status", "contest/register", "special/add-card",
  ],
  PATCH: ["security/change-password", "user/edit-info", "user/alumni-quote", "user/edit-document/:id", "event/check-guest-list", "event/guest-presence", "event/guest-list/:eventId/guests/:guestId",
    "future-event/edit-event/:id", "future-event/sales/:id", "internship/edit/:id", "internship/reorder", "backoffice/accounts/:type/:id"],
  DELETE: ["user/wallet/card", "user/cancel-membership", "user/delete-document/:id", "future-event/delete-event/:id", "internship/delete/:id"],
};
const allowed = Object.fromEntries(Object.entries(routes).map(([method, paths]) => [method,
  paths.map((path) => new RegExp(`^${path.replace(/:[a-zA-Z]+/g, "[a-zA-Z0-9_-]+")}$`))]));

export function browserApiPath(parts, method = "GET") {
  const segments = [...parts];
  if (segments[0] === "v1") segments.shift();
  if (!segments.length || segments.some((part) => !/^[a-zA-Z0-9_-]{1,200}$/.test(part))) return null;
  const path = segments.join("/");
  return allowed[method === "HEAD" ? "GET" : method]?.some((pattern) => pattern.test(path)) ? path : null;
}
export const changesSession = (path) => ["security/login", "security/google/login", "security/google/link", "security/google/disconnect", "security/passkeys/login", "security/passkeys/remove", "security/profile-change/confirm", "user/refresh-token"].includes(path);
export const startsSession = (path) => ["security/login", "security/google/login", "security/passkeys/login"].includes(path);

export async function boundedBody(stream, maximum) {
  if (!stream) return undefined;
  const reader = stream.getReader(), chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) { await reader.cancel(); throw new Error("Request is too large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}
