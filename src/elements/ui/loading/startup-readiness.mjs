export function startupContentReady(root, documentState, viewportHeight, { publicPage = false, homePage = false } = {}) {
  const page = publicPage ? root?.querySelector(".site-page-transition") : null;
  const target = homePage ? page?.querySelector(".slider-activation")
    : publicPage ? page || root?.querySelector(".global-site-content") || root : root;
  if (!target || documentState.readyState === "loading" || documentState.fonts?.status === "loading") return false;
  if (publicPage) {
    // A streamed fallback must give way to real page content first. Session
    // checks and loading states inside individual sections can finish later.
    if ((!page && target.querySelector(".page-loading")) ||
      (page && target.querySelector(":scope > .page-loading")) ||
      !target.querySelector("main, h1, h2, article, form, [role='alert']")) return false;
  } else if (target.querySelector('[data-startup-pending="true"], .page-loading, [aria-busy="true"]')) return false;
  // Only the homepage hero and explicitly eager public images hold the cover.
  // Other public images can arrive progressively after readable content appears.
  const imageSelector = publicPage && !homePage ? 'img[loading="eager"], img[fetchpriority="high"]' : "img";
  return ![...target.querySelectorAll(imageSelector)].some(img => {
    const bounds = img.getBoundingClientRect();
    return bounds.width > 0 && bounds.height > 0 && bounds.top < viewportHeight && bounds.bottom > 0 && !img.complete;
  });
}
