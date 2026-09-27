const STORAGE_KEY = "bgsnl:contact:last-sent";

export const CONTACT_DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

const normalize = (value) => String(value ?? "").trim().replace(/\s+/g, " ");

export const contactPayloadIdentity = (payload) => JSON.stringify([
  normalize(payload?.name).toLocaleLowerCase(),
  normalize(payload?.email).toLocaleLowerCase(),
  normalize(payload?.subject),
  normalize(payload?.message),
  normalize(payload?.region).toLocaleLowerCase(),
]);

export async function contactPayloadFingerprint(identity, cryptoApi = globalThis.crypto) {
  if (!cryptoApi?.subtle || typeof TextEncoder === "undefined") return "";
  const digest = await cryptoApi.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(identity)
  );
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export function wasContactSubmissionSentRecently(
  storage,
  fingerprint,
  now = Date.now(),
  windowMs = CONTACT_DUPLICATE_WINDOW_MS
) {
  if (!storage || !fingerprint) return false;
  try {
    const record = JSON.parse(storage.getItem(STORAGE_KEY));
    return record?.fingerprint === fingerprint &&
      Number.isFinite(record?.sentAt) &&
      now >= record.sentAt &&
      now - record.sentAt < windowMs;
  } catch {
    return false;
  }
}

export function rememberContactSubmission(storage, fingerprint, sentAt = Date.now()) {
  if (!storage || !fingerprint) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ fingerprint, sentAt }));
  } catch {
    // Storage can be unavailable in privacy modes. The in-memory guard remains active.
  }
}
