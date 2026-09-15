// Next.js integrates native history updates with useSearchParams. Filters can
// update their URL without a route navigation, server render, or scroll reset.
export function updateFilterSearchParams(next, { replace = false } = {}, browser = window) {
  const { pathname, search, hash } = browser.location;
  const current = new URLSearchParams(search);
  const resolved = typeof next === "function" ? next(current) : next;
  const params = new URLSearchParams(resolved ?? {});
  const query = params.toString();
  const url = `${pathname}${query ? `?${query}` : ""}${hash}`;
  if (url === `${pathname}${search}${hash}`) return;
  browser.history[replace ? "replaceState" : "pushState"](null, "", url);
}
