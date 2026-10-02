// A shared, bounded request: footers, contact links and modals use one directory.
// No hardcoded addresses or page-level dependency on API availability.
export function createRegionEmailStore({ fetcher = (...args) => fetch(...args), now = Date.now } = {}) {
  const initial = { emails: {}, loading: true, error: false };
  let snapshot = initial, pending, loadedAt = 0;
  const listeners = new Set();
  const publish = (value) => { snapshot = value; listeners.forEach((listener) => listener()); };
  const load = (force = false) => {
    if (pending) return pending;
    if (!force && (snapshot.error || (loadedAt && now() - loadedAt < 300000))) return Promise.resolve();
    publish({ ...snapshot, loading: true, error: false });
    pending = Promise.resolve().then(async () => {
      try {
        const response = await fetcher("/api/v1/common/region-emails", { signal: AbortSignal.timeout(6000), cache: "no-store" });
        if (!response.ok) throw new Error("Directory unavailable");
        const body = await response.json();
        const emails = Object.fromEntries(Object.entries(body?.emails || {}).filter(([key, value]) =>
          /^[a-z_]+$/.test(key) && typeof value === "string" && value.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)));
        if (!Object.keys(emails).length) throw new Error("Empty directory");
        loadedAt = now();
        publish({ emails, loading: false, error: false });
      } catch {
        publish({ ...snapshot, loading: false, error: true });
      } finally { pending = undefined; }
    });
    return pending;
  };
  return {
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    getSnapshot: () => snapshot, getServerSnapshot: () => initial,
    load, retry: () => load(true),
  };
}
