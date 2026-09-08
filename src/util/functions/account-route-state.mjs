// Client-side navigation/visibility only. The API authenticates and authorizes
// every private read and mutation independently of this UI decision.
export function accountRouteState(user, access = [], pathname = "/user") {
  if (!user?.authInitialized) return "restoring";
  if (!user.token) return "anonymous";
  if (user.status && user.status !== "active" && pathname !== "/user") return "locked";
  if (access.length && !access.some((role) => user.roles?.includes(role))) return "forbidden";
  return "allowed";
}
