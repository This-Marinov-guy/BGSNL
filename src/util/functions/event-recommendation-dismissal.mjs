export const DISMISSAL_KEY = "bgsnl:event-recommendations:dismissed:v1";
export const DISMISSAL_TTL = 14 * 24 * 60 * 60 * 1000;

function activeDismissals(storage, now) {
  const raw = storage.getItem(DISMISSAL_KEY);
  let entries;
  try { entries = JSON.parse(raw || "{}"); } catch { entries = {}; }
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) entries = {};
  const active = Object.fromEntries(Object.entries(entries).filter(([, expiresAt]) => Number.isFinite(expiresAt) && expiresAt > now && expiresAt <= now + DISMISSAL_TTL));
  const serialized = JSON.stringify(active);
  if (!Object.keys(active).length) storage.removeItem(DISMISSAL_KEY);
  else if (serialized !== raw) storage.setItem(DISMISSAL_KEY, serialized);
  return active;
}

export function isRecommendationDismissed(storage, eventId, now = Date.now()) {
  try { return Boolean(activeDismissals(storage, now)[eventId]); } catch { return false; }
}

export function dismissRecommendations(storage, eventId, now = Date.now()) {
  if (!eventId) return;
  try {
    const entries = activeDismissals(storage, now);
    storage.setItem(DISMISSAL_KEY, JSON.stringify({ ...entries, [eventId]: now + DISMISSAL_TTL }));
  } catch { /* Closing still works when browser storage is unavailable. */ }
}

export function restoreRecommendations(storage, eventId, now = Date.now()) {
  try {
    const entries = activeDismissals(storage, now);
    delete entries[eventId];
    if (Object.keys(entries).length) storage.setItem(DISMISSAL_KEY, JSON.stringify(entries));
    else storage.removeItem(DISMISSAL_KEY);
  } catch { /* Manual reopening still works when browser storage is unavailable. */ }
}
