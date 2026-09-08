import { serverEndpoint } from "@/util/defines/common";

export async function supportRequest(path, { token, secret, data, signal } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) abort();
  const formData = typeof FormData !== "undefined" && data instanceof FormData;
  const timer = setTimeout(abort, formData ? 60000 : 20000);
  try {
    const response = await fetch(`${serverEndpoint}support/${path}`, {
      method: data === undefined ? "GET" : "POST", cache: "no-store", credentials: "omit",
      redirect: "error", referrerPolicy: "no-referrer", signal: controller.signal,
      headers: { ...(data === undefined || formData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : secret ? { "X-Support-Token": secret } : {}) },
      ...(data === undefined ? {} : { body: formData ? data : JSON.stringify(data) }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(result?.message || "We could not load support. Please try again.");
      error.status = response.status;
      throw error;
    }
    if (!result || typeof result !== "object") throw new Error("Support returned an unexpected response. Please try again; your submission will not be duplicated.");
    return result;
  } catch (error) {
    if (error.name === "AbortError" && !signal?.aborted) throw new Error("The request timed out. Your message is not confirmed yet; retrying is safe.");
    if (error instanceof TypeError) throw new Error("We couldn’t reach support. Check your connection and retry; your submission will not be duplicated.");
    throw error;
  } finally { clearTimeout(timer); signal?.removeEventListener("abort", abort); }
}
