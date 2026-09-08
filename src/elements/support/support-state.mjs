const STORAGE_KEY = "bgsnl_support_guest_v1";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const STATUS_LABELS = { open: "Open", in_progress: "In progress", waiting_for_you: "Waiting for you", resolved: "Resolved", closed: "Closed" };

export function guestReports(storage, now = Date.now()) {
  try {
    storage ??= window.localStorage;
    const values = JSON.parse(storage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(values) ? values.filter((item) => UUID.test(item?.id || "") && /^[a-f0-9]{64}$/i.test(item?.secret || "") && item.expiresAt > now).slice(0, 20) : [];
  } catch { return []; }
}

export function rememberGuestReport(item, storage) {
  const previous = guestReports(storage).filter(({ id }) => id !== item.id);
  if (previous.length >= 20) throw new Error("This browser has 20 saved guest reports. Forget old guest access before creating another report.");
  try { (storage ?? window.localStorage).setItem(STORAGE_KEY, JSON.stringify([item, ...previous])); }
  catch { throw new Error("Allow this website to save browser data so you can return to your private guest report."); }
}

export function forgetGuestReports(storage = window.localStorage) { storage.removeItem(STORAGE_KEY); }
export function forgetGuestReport(id, storage) {
  try { (storage ?? window.localStorage).setItem(STORAGE_KEY, JSON.stringify(guestReports(storage).filter((item) => item.id !== id))); }
  catch { /* A definitely rejected request has no server conversation to expose. */ }
}
export function createGuestAccess() {
  return { id: crypto.randomUUID(), secret: Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join(""), expiresAt: Date.now() + 90 * 86400000 };
}

// This is only a React cache boundary, never an authorization decision. Every
// request is verified by the API. Token refreshes keep an unfinished draft;
// logout or switching accounts destroys the previous account's rendered data.
export function supportScope(token) {
  if (!token) return "guest";
  try {
    const encoded = token.split(".")[1].replaceAll("-", "+").replaceAll("_", "/");
    const payload = JSON.parse(atob(encoded));
    return `account:${payload.userId}`;
  } catch { return "invalid-session"; }
}

export function mergeConversation(previous, incoming) {
  if (!previous || previous.id !== incoming.id) return incoming;
  const messages = new Map(previous.messages.map((message) => [message.id, message]));
  for (const message of incoming.messages) messages.set(message.id, message);
  return { ...(incoming.revision >= previous.revision ? incoming : previous), messages: [...messages.values()].sort((a, b) => a.order - b.order) };
}
