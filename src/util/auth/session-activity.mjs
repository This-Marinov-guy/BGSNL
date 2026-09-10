import { browserFetch } from "./browser-request.mjs";

export const ACTIVITY_INTERVAL_MS = 60_000;
const events = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "touchmove"];

// Only real foreground input produces activity. A trailing, coalesced ping
// records the final interaction too. Polls, focus and refresh never extend idle.
export function trackSessionActivity({ session, onSession, onEnd, request = browserFetch,
  windowTarget = window, documentTarget = document, now = Date.now,
  schedule = setTimeout, cancel = clearTimeout }) {
  let current = session, stopped = false, busy = false, pending = false;
  let lastSent = 0, activityTimer, deadlineTimer;
  const visible = () => documentTarget.visibilityState === "visible";
  function armDeadline(delay = Math.max(0, current.exp * 1000 - now())) {
    cancel(deadlineTimer);
    if (!stopped) deadlineTimer = schedule(() => check(), Math.min(delay, 2 ** 31 - 1));
  }
  async function send(activity) {
    if (stopped || busy) return;
    busy = true;
    if (activity) { pending = false; lastSent = now(); }
    try {
      const response = await request(activity ? "/api/session/activity" : "/api/session/current", {
        method: activity ? "POST" : "GET", signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (stopped) return;
      if (response.status === 401 || (response.ok && !data.session)) {
        stop(); onEnd(); return;
      }
      if (response.ok && data.session?.sid === current.sid && data.session.auth_time === current.auth_time) {
        current = { ...data.session, exp: Math.max(current.exp, data.session.exp) };
        onSession(current);
      }
      // During an outage keep the UI/form in place; the API still denies access.
    } catch { /* Retry verification, never turn a network failure into logout. */ }
    finally {
      busy = false;
      if (!stopped) {
        armDeadline(Math.max(15000, current.exp * 1000 - now()));
        if (pending) queueActivity();
      }
    }
  }
  function queueActivity() {
    cancel(activityTimer);
    if (pending && !stopped) activityTimer = schedule(() => {
      if (pending && visible()) void send(true);
    }, Math.max(0, ACTIVITY_INTERVAL_MS - (now() - lastSent)));
  }
  function input(event) {
    if (!event.isTrusted || !visible() || stopped) return;
    pending = true;
    queueActivity();
  }
  function check() {
    if (stopped) return;
    if (!visible() && pending) {
      // Flush the last real interaction when leaving, not hours later on focus.
      if (!busy) void send(true);
      pending = false;
      return;
    }
    if (now() >= current.exp * 1000) void send(false);
    else armDeadline();
    if (pending && visible()) queueActivity();
  }
  function stop() {
    stopped = true;
    cancel(activityTimer); cancel(deadlineTimer);
    for (const event of events) windowTarget.removeEventListener(event, input);
    for (const event of ["focus", "pageshow", "online"]) windowTarget.removeEventListener(event, check);
    documentTarget.removeEventListener("visibilitychange", check);
  }
  for (const event of events) windowTarget.addEventListener(event, input, { passive: true });
  for (const event of ["focus", "pageshow", "online"]) windowTarget.addEventListener(event, check);
  documentTarget.addEventListener("visibilitychange", check);
  armDeadline();
  return { stop, check };
}
