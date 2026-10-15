export function scrollToListStart(target) {
  const element = target?.current !== undefined ? target.current : target;
  if (!element || typeof element.getBoundingClientRect !== "function" || typeof window === "undefined") return;

  const behavior = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  let container = element.parentElement;
  while (container && container !== document.body) {
    const overflow = window.getComputedStyle(container).overflowY;
    if (/(auto|scroll)/.test(overflow) && container.scrollHeight > container.clientHeight) {
      const top = container.scrollTop + element.getBoundingClientRect().top - container.getBoundingClientRect().top - 16;
      container.scrollTo({ top: Math.max(0, top), behavior });
      return;
    }
    container = container.parentElement;
  }

  const top = window.scrollY + element.getBoundingClientRect().top - 96;
  window.scrollTo({ top: Math.max(0, top), behavior });
}
