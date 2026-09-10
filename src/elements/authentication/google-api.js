import { serverEndpoint } from "@/util/defines/common";
import { requestGoogleAuth } from "./google-request.mjs";

// Keep Google credentials out of shared Axios defaults, console logs and URLs.
export async function googleAuthRequest(path, data, session) {
  const result = await requestGoogleAuth(`${serverEndpoint}security/${path}`, data, session);
  if ((path === "connected-accounts" || path === "google/link" || path === "google/disconnect") &&
      (typeof result.google?.enabled !== "boolean" || typeof result.google?.connected !== "boolean" ||
       typeof result.google?.eligible !== "boolean" || typeof result.google?.accountEmail !== "string")) {
    throw new Error("Google account settings are temporarily unavailable. Please refresh the page and try again.");
  }
  return result;
}

export function createBrowserProof() {
  const bytes = window.crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
