// Public UI state only. This object is never an authentication credential.
export const SESSION_CHANGED_EVENT = "bgsnl-session-changed";
export const SESSION_NOTICE_KEY = "bgsnl-profile-notice";
// The server confirms expiry: another tab may have extended this login's idle
// deadline. Never destroy an active form based on stale local token metadata.
export const sessionIsActive = (session) => !!session &&
  typeof session.userId === "string" && Array.isArray(session.roles) &&
  Number.isSafeInteger(session.exp) && session.exp > 0;

export function watchSessionDeadline(session, onExpire, { now = Date.now, schedule = setTimeout, cancel = clearTimeout } = {}) {
  let timer, stopped = false;
  function check() {
    cancel(timer);
    if (stopped) return;
    const remaining = (session?.exp || 0) * 1000 - now();
    if (remaining <= 0) { stopped = true; onExpire(); return; }
    timer = schedule(check, Math.min(remaining, 2 ** 31 - 1));
  }
  check();
  return { check, stop() { stopped = true; cancel(timer); } };
}

export function announceSessionChange() {
  if (typeof window === "undefined") return;
  // Only a random event marker is stored, never credentials or profile data.
  try { localStorage.setItem(SESSION_CHANGED_EVENT, crypto.randomUUID()); } catch { /* Storage may be disabled. */ }
}
