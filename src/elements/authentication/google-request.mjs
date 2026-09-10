import { browserFetch } from "../../util/auth/browser-request.mjs";
export const GOOGLE_REQUEST_TIMEOUT_MS = 20000;

// Do not expose raw browser/network errors, HTML proxy responses or credentials
// to the UI. Requests are never automatically retried: linking is a mutation.
export async function requestGoogleAuth(url, data) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GOOGLE_REQUEST_TIMEOUT_MS);
  try {
    const response = await browserFetch(url, {
      method: data === undefined ? "GET" : "POST",
      cache: "no-store", redirect: "error", signal: controller.signal,
      headers: { ...(data === undefined ? {} : { "Content-Type": "application/json" }) },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
    const result = await response.json().catch(() => null);
    if (controller.signal.aborted) throw new Error("Google sign-in timed out. Please check your connection and try again.");
    if (!response.ok) {
      const fallback = response.status === 401 ? "Your session or Google authorization expired. Please sign in again and retry."
        : response.status === 403 ? "Google authorization was denied. Check your account and try again."
          : response.status === 429 ? "Too many Google sign-in attempts. Please wait 15 minutes and try again."
            : "Google sign-in is temporarily unavailable. Please try again later. Your BGSNL password still works.";
      throw new Error(typeof result?.message === "string" && result.message.trim() ? result.message : fallback);
    }
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      throw new Error("Google sign-in received an unexpected server response. Please refresh the page and try again.");
    }
    return result;
  } catch (error) {
    if (controller.signal.aborted || error.name === "AbortError") {
      throw new Error("Google sign-in timed out. Please check your connection and try again.");
    }
    if (error instanceof TypeError) {
      throw new Error("Could not reach the sign-in service. Check your internet connection and browser privacy or content-blocker settings, then try again.");
    }
    throw error;
  } finally { clearTimeout(timer); }
}
