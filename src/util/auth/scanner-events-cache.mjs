// Saved cards are display data, never proof of scanner access.
const KEY = "bgsnl-scanner-event-cards-v2";
export const SCANNER_EVENTS_MAX_AGE_MS = 3 * 60 * 60 * 1000;
const MAX_BYTES = 1024 * 1024;

const accessMatches = (saved, current) =>
  saved?.userId === current?.userId && saved?.status === current?.status &&
  saved?.region === current?.region && Array.isArray(saved?.roles) &&
  Array.isArray(current?.roles) &&
  JSON.stringify([...saved.roles].sort()) === JSON.stringify([...current.roles].sort());

const validCard = (event) => event && typeof event.id === "string" &&
  typeof event.title === "string" && typeof event.region === "string" &&
  !["draft", "archived"].includes(event.status) &&
  (event.poster == null || typeof event.poster === "string");

export function scannerEventsCacheCandidate(session, storage, now = Date.now()) {
  let savedStorage;
  try {
    savedStorage = storage || globalThis.localStorage;
    const raw = savedStorage?.getItem(KEY);
    if (!raw) return null;
    if (raw.length > MAX_BYTES) { savedStorage?.removeItem(KEY); return null; }
    const saved = JSON.parse(raw);
    if (saved?.version !== 2 || saved.userId !== session?.userId ||
        saved.authTime !== session?.auth_time || saved.sessionVersion !== session?.sessionVersion ||
        !Number.isSafeInteger(saved.savedAt) || saved.savedAt > now ||
        now - saved.savedAt >= SCANNER_EVENTS_MAX_AGE_MS ||
        !Array.isArray(saved.events) || !saved.events.every(validCard)) {
      savedStorage?.removeItem(KEY);
      return null;
    }
    return saved;
  } catch {
    try { savedStorage?.removeItem(KEY); } catch { /* Optional browser storage may be disabled. */ }
    return null;
  }
}

export function readScannerEventsCache(session, liveAccess, storage, now = Date.now()) {
  const saved = scannerEventsCacheCandidate(session, storage, now);
  return saved && accessMatches(saved.access, liveAccess) ? saved.events : null;
}

export function writeScannerEventsCache(session, access, events, storage, now = Date.now()) {
  if (typeof session?.userId !== "string" || !Number.isSafeInteger(session.auth_time) ||
      !Number.isSafeInteger(session.sessionVersion) || !accessMatches(access, { ...access, userId: session.userId }) ||
      !Array.isArray(events) || !events.every(validCard)) return;
  const cards = events.map(({ id, title, region, date, correctedDate, poster, status }) =>
    ({ id, title, region, date, correctedDate, poster, status }));
  const raw = JSON.stringify({ version: 2, userId: session.userId, authTime: session.auth_time,
    sessionVersion: session.sessionVersion, savedAt: now, access, events: cards });
  if (raw.length > MAX_BYTES) return;
  try { (storage || globalThis.localStorage)?.setItem(KEY, raw); }
  catch { /* Optional browser storage must not block scanning. */ }
}

export function clearScannerEventsCache(storage) {
  try { (storage || globalThis.localStorage)?.removeItem(KEY); }
  catch { /* Optional browser storage may be disabled. */ }
}
