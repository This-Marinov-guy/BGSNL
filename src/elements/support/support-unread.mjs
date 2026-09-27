export const SUPPORT_SEEN_CHANGED = "bgsnl:support-seen";
const key = scope => `bgsnl_support_seen_v1:${scope}`;
const memory = new Map();

export function readSupportSeen(scope, storage) {
  try {
    storage ??= window.localStorage;
    const saved = JSON.parse(storage.getItem(key(scope)) || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    const result = Object.fromEntries(Object.entries(saved).filter(([, revision]) => Number.isSafeInteger(revision) && revision >= 0));
    for (const [id, revision] of Object.entries(memory.get(scope) || {})) result[id] = Math.max(result[id] ?? -1, revision);
    return result;
  } catch { return memory.get(scope) || {}; }
}

export function supportTicketUnread(ticket, seen, staff = false) {
  return ticket.lastAuthor === (staff ? "requester" : "staff") && ticket.revision > (seen[ticket.id] ?? -1);
}

export function markSupportSeen(scope, ticket) {
  if (!ticket || !Number.isSafeInteger(ticket.revision)) return;
  const seen = readSupportSeen(scope);
  if ((seen[ticket.id] ?? -1) >= ticket.revision) return;
  seen[ticket.id] = ticket.revision;
  memory.set(scope, seen);
  try { window.localStorage.setItem(key(scope), JSON.stringify(seen)); } catch { /* Keep read state for this session when storage is blocked. */ }
  window.dispatchEvent(new Event(SUPPORT_SEEN_CHANGED));
}
