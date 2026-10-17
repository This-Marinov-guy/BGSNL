// A restored client route must not replay an old server snapshot after logout,
// an account switch, or a security version change. A hard reload repeats the
// live API authorization before scanner content is shown.
export function scannerSessionNeedsReload(currentUser, serverSession) {
  if (!currentUser?.authInitialized) return false;
  const current = currentUser.session;
  return !current || current.sid !== serverSession.sid ||
    current.auth_time !== serverSession.auth_time ||
    current.userId !== serverSession.userId ||
    Number(current.sessionVersion) > Number(serverSession.sessionVersion);
}
