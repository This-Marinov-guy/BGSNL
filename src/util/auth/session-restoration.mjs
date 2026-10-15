import { browserFetch } from "./browser-request.mjs";
import { sessionIsActive } from "./browser-session.mjs";

function waitForRetry(delay, signal) {
  return new Promise((resolve) => {
    if (signal?.aborted) { resolve(false); return; }
    const onAbort = () => { clearTimeout(timer); resolve(false); };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve(true);
    }, delay);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

// Only a confirmed anonymous session or 401 may finish initial auth. Outages
// keep the startup overlay visible and the HttpOnly cookies intact.
export async function restoreInitialSession(path, {
  request = browserFetch, signal, wait = waitForRetry,
} = {}) {
  let failures = 0;
  while (!signal?.aborted) {
    try {
      const response = await request(path, { signal });
      if (signal?.aborted) return null;
      if (response.status === 401) return { kind: "anonymous" };
      if (response.ok) {
        const data = await response.json();
        if (signal?.aborted) return null;
        if (data?.session === null) return { kind: "anonymous" };
        if (sessionIsActive(data?.session)) {
          return { kind: "authenticated", data };
        }
      }
    } catch {
      if (signal?.aborted) return null;
    }
    const delay = Math.min(1000 * 2 ** Math.min(failures++, 4), 15000);
    if (!await wait(delay, signal)) return null;
  }
  return null;
}
