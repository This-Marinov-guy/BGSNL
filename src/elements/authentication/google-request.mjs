import { browserFetch } from "../../util/auth/browser-request.mjs";
export const GOOGLE_REQUEST_TIMEOUT_MS = 20000;
export class GoogleRequestError extends Error {
  constructor(message, status = null) {
    super(message);
    this.status = status;
    this.systemFailure = !status || status === 404 || status === 408 || status === 429 || status >= 500;
  }
}

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
    if (controller.signal.aborted) throw new GoogleRequestError("Google sign-in timed out. Please check your connection and try again.");
    if (!response.ok) {
      const fallback = response.status === 401 ? "Your session or Google authorization expired. Please sign in again and retry."
        : response.status === 403 ? "Google authorization was denied. Check your account and try again."
          : response.status === 429 ? "Please wait a moment and try again."
            : "Google sign-in is temporarily unavailable. Please try again later. Your BGSNL password still works.";
      const systemFailure = response.status === 404 || response.status === 408 || response.status === 429 || response.status >= 500;
      throw new GoogleRequestError(!systemFailure && typeof result?.message === "string" && result.message.trim() ? result.message : fallback, response.status);
    }
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      throw new GoogleRequestError("Google sign-in received an unexpected server response. Please refresh the page and try again.");
    }
    return result;
  } catch (error) {
    if (controller.signal.aborted || error.name === "AbortError") {
      throw new GoogleRequestError("Google sign-in timed out. Please check your connection and try again.");
    }
    if (error instanceof TypeError) {
      throw new GoogleRequestError("Could not reach the sign-in service. Check your internet connection and browser privacy or content-blocker settings, then try again.");
    }
    if (error instanceof GoogleRequestError) throw error;
    throw new GoogleRequestError("Google sign-in could not be completed. Please try again or use your BGSNL password.");
  } finally { clearTimeout(timer); }
}
