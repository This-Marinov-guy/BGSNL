export function startupContentReady(root, documentState, viewportHeight) {
  if (!root || documentState.readyState === "loading" || documentState.fonts?.status === "loading") return false;
  if (root.querySelector('[data-startup-pending="true"], .page-loading, [aria-busy="true"]')) return false;
  return ![...root.querySelectorAll("img")].some(img => {
    const bounds = img.getBoundingClientRect();
    return bounds.width > 0 && bounds.height > 0 && bounds.top < viewportHeight && bounds.bottom > 0 && !img.complete;
  });
}
