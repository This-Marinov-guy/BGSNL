// Public reads are optional page content. undefined means unavailable, while
// null means an actual upstream 404; never turn an outage into a missing page.
export function createPublicReader({ baseUrls, headers, enabled = true, fetcher = fetch,
  report = () => {} }) {
  return async function read(endpoint, { revalidate = 300, timeout = 3000, tags = [] } = {}) {
    if (!enabled) {
      report({ endpoint, reason: "configuration" });
      return undefined;
    }
    // One deadline for the entire read, including response parsing/fallbacks.
    const signal = AbortSignal.timeout(timeout);
    for (const base of baseUrls) {
      try {
        const response = await fetcher(`${base}/${endpoint}`, {
          headers, signal, next: { revalidate, tags },
        });
        if (response.status === 404) return null;
        if (response.ok) {
          const data = await response.json();
          if (data && typeof data === "object" && !Array.isArray(data)) return data;
        }
      } catch {
        // Do not log raw exceptions, response bodies, or authenticated headers.
      }
      if (signal.aborted) break;
    }
    report({ endpoint, reason: "unavailable" });
    return undefined;
  };
}
