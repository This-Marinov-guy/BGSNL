let csrfPromise;
let csrfExpires = 0;

export function clearCsrf() { csrfPromise = undefined; csrfExpires = 0; }

export async function csrfHeaders(method = "GET") {
  if (["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase())) return {};
  if (csrfExpires && csrfExpires <= Date.now() + 30000) clearCsrf();
  if (!csrfPromise) {
    csrfPromise = fetch("/api/session/csrf", { credentials: "same-origin", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000) })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || typeof data.csrfToken !== "string") throw new Error("Could not protect your request. Refresh the page and try again.");
        csrfExpires = Number(data.csrfToken.split(".")[0]) * 1000;
        return data.csrfToken;
      }).catch((error) => { clearCsrf(); throw error; });
  }
  return { "X-CSRF-Token": await csrfPromise };
}

export async function browserFetch(url, options = {}) {
  // This helper must never send cookies or a CSRF token to an external URL.
  if (typeof url !== "string" || !url.startsWith("/api/") || url.includes("\\")) throw new Error("Invalid website API request");
  const headers = new Headers(options.headers);
  headers.delete("authorization");
  options.signal?.throwIfAborted();
  for (const [key, value] of Object.entries(await csrfHeaders(options.method))) headers.set(key, value);
  options.signal?.throwIfAborted();
  const response = await fetch(url, { ...options, headers, credentials: "same-origin", cache: "no-store", redirect: "error" });
  // Do not replay mutations: the caller can retry after receiving an explicit error.
  if (response.status === 403 || response.headers.get("X-BGSNL-Session-Changed") === "1") clearCsrf();
  return response;
}

export async function endBrowserSession() {
  const response = await browserFetch("/api/session/logout", { method: "POST" });
  if (!response.ok) throw new Error("Could not sign out. Please retry.");
  clearCsrf();
}
