import { browserFetch } from "../../util/auth/browser-request.mjs";
export const PASSKEY_REQUEST_TIMEOUT_MS = 20000;

export class PasskeyRequestError extends Error {}

export async function requestPasskey(url, data, _session, signal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) abort();
  const timer = setTimeout(abort, PASSKEY_REQUEST_TIMEOUT_MS);
  try {
    const response = await browserFetch(url, {
      method: data === undefined ? "GET" : "POST", cache: "no-store", redirect: "error",
      signal: controller.signal,
      headers: { ...(data === undefined ? {} : { "Content-Type": "application/json" }) },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
    const result = await response.json().catch(() => null);
    if (controller.signal.aborted) throw new Error("Aborted");
    if (!response.ok) {
      throw new PasskeyRequestError(typeof result?.message === "string" && result.message.trim() ? result.message
        : response.status === 429 ? "Too many passkey attempts. Please wait 15 minutes and try again."
          : response.status === 401 ? "Your sign-in request expired. Please sign in again and retry."
            : "Passkeys are temporarily unavailable. Please try again or use your BGSNL password.");
    }
    if (!result || typeof result !== "object" || Array.isArray(result)) throw new PasskeyRequestError("Passkeys received an unexpected response. Please try again.");
    return result;
  } catch (error) {
    if (controller.signal.aborted) throw new PasskeyRequestError("The passkey request timed out. Check your connection and try again.");
    if (error instanceof PasskeyRequestError) throw error;
    throw new PasskeyRequestError("Could not reach the sign-in service. Check your connection and try again. Your BGSNL password is still available.");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

export function passkeyErrorNotice(error) {
  if (error instanceof PasskeyRequestError) return { severity: "error", detail: error.message };
  // SimpleWebAuthn wraps DOMExceptions and retains the original as cause.
  const name = error?.cause?.name || error?.name;
  if (["NotAllowedError", "AbortError"].includes(name) || error?.code === "ERROR_CEREMONY_ABORTED") {
    return { severity: "warn", detail: "Passkey verification was cancelled or timed out. Try again, choose another device, or use your BGSNL password. To create your first passkey, sign in and open Settings." };
  }
  if (name === "InvalidStateError" || error?.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED") return { severity: "warn", detail: "This device already has a passkey for your account. Try signing in with it or choose another device." };
  if (name === "ConstraintError") return { severity: "warn", detail: "This authenticator does not support the required passkey verification. Choose a device with a screen lock or a compatible security key." };
  if (["SecurityError", "NotSupportedError"].includes(name)) return { severity: "error", detail: "Passkeys are not available in this browser or website context. Open the website directly in an up-to-date browser, or use your BGSNL password." };
  return { severity: "error", detail: "Your device could not complete passkey verification. Please try again or use your BGSNL password." };
}
