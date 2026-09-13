// Kept in sync with BILLING_LOCK_EXEMPT / BILLING_LOCKED_STATUSES in
// util/defines/common.js. Inlined (not imported) so this stays a dependency-
// free module that node --test can run directly, like the rest of this file.
const BILLING_LOCK_EXEMPT = ["super_admin", "admin"];
const BILLING_LOCKED_STATUSES = ["locked", "payment_awaiting"];

// Client-side navigation/visibility only. The API authenticates and authorizes
// every private read and mutation independently of this UI decision.
export function accountRouteState(user, access = [], pathname = "/user") {
  if (!user?.authInitialized) return "restoring";
  if (!user.session) return "anonymous";
  const billingExempt = BILLING_LOCKED_STATUSES.includes(user.status) &&
    user.roles?.some((role) => BILLING_LOCK_EXEMPT.includes(role));
  if (user.status && user.status !== "active" && pathname !== "/user" && !billingExempt) return "locked";
  if (access.length && !access.some((role) => user.roles?.includes(role))) return "forbidden";
  return "allowed";
}
