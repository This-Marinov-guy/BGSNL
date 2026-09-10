export const SLOW_LOADING_DELAY_MS = 7000;

// Ignore same-page/hash links and never allow a retry to leave this origin.
export function getLoadingDestination(href, currentHref) {
  if (typeof href !== "string" || !href) return null;
  try {
    const current = new URL(currentHref);
    const destination = new URL(href, current);
    if (destination.origin !== current.origin || !["http:", "https:"].includes(destination.protocol)) return null;
    if (destination.pathname === current.pathname && destination.search === current.search) return null;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch { return null; }
}

export function scheduleLoadingRecovery(onSlow) {
  const timer = setTimeout(onSlow, SLOW_LOADING_DELAY_MS);
  return () => clearTimeout(timer);
}
