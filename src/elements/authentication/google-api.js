import { serverEndpoint } from "@/util/defines/common";

// Keep Google credentials out of shared Axios defaults, console logs and URLs.
export async function googleAuthRequest(path, data, token) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${serverEndpoint}security/${path}`, {
      method: data === undefined ? "GET" : "POST",
      credentials: "omit", cache: "no-store", redirect: "error", signal: controller.signal,
      headers: { ...(data === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Google sign-in could not be completed. Please try again.");
    return result;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Google sign-in timed out. Please try again.");
    throw error;
  } finally { clearTimeout(timer); }
}

export function createBrowserProof() {
  const bytes = window.crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
