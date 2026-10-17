const MAX_AGE_MS = 60_000;
const entries = new Map();

export function readScannerEventsCache(userId, now = Date.now()) {
  if (!userId) return null;
  const cached = entries.get(userId);
  if (!cached || cached.savedAt > now || now - cached.savedAt >= MAX_AGE_MS) {
    entries.delete(userId);
    return null;
  }
  return cached.events;
}

export function writeScannerEventsCache(userId, events, now = Date.now()) {
  if (!userId || !Array.isArray(events)) return;
  entries.clear();
  entries.set(userId, { savedAt: now, events });
}

export function clearScannerEventsCache(userId) {
  if (userId) entries.delete(userId);
  else entries.clear();
}
