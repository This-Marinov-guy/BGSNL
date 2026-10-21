const KEY = "bgsnl-scanner-recent-event";
const MAX_AGE_MS = 3 * 60 * 60 * 1000;

export function recentScannerEventCandidate(session, storage, now = Date.now()) {
  try {
    const raw = (storage || globalThis.localStorage)?.getItem(KEY);
    if (!raw || raw.length > 512) return "";
    const saved = JSON.parse(raw);
    if (saved.userId !== session?.userId || saved.authTime !== session?.auth_time ||
        !Number.isSafeInteger(saved.savedAt) || saved.savedAt > now ||
        now - saved.savedAt > MAX_AGE_MS || typeof saved.eventId !== "string") return "";
    return saved.eventId;
  } catch { return ""; }
}

export function readRecentScannerEvent(session, events, storage, now = Date.now()) {
  const eventId = recentScannerEventCandidate(session, storage, now);
  return eventId && events.some(event => event.id === eventId) ? eventId : "";
}

export function rememberScannerEvent(session, eventId, storage, now = Date.now()) {
  if (typeof session?.userId !== "string" || !Number.isSafeInteger(session.auth_time) ||
      typeof eventId !== "string" || !eventId || eventId.length > 128) return;
  try { (storage || globalThis.localStorage)?.setItem(KEY, JSON.stringify({ userId: session.userId, authTime: session.auth_time, eventId, savedAt: now })); }
  catch { /* Storage is optional; scanning still works. */ }
}

export function clearRecentScannerEvent(storage) {
  try { (storage || globalThis.localStorage)?.removeItem(KEY); } catch { /* Storage is optional. */ }
}
