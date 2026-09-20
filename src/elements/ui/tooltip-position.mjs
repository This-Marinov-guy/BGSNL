// Put modal tooltips at the modal root so they can overlap its header and footer.
export const getTooltipContainer = (trigger) =>
  trigger?.closest(".bgsnl-modal, [data-modal-root]") ?? document.body;

export const getTooltipPosition = (container, { left, top }) => {
  if (container === document.body) return { left, top };

  const rect = container.getBoundingClientRect();
  const scaleX = rect.width / container.offsetWidth || 1;
  const scaleY = rect.height / container.offsetHeight || 1;
  return {
    position: "absolute",
    zIndex: 3,
    left: (left - rect.left) / scaleX + container.scrollLeft - container.clientLeft,
    top: (top - rect.top) / scaleY + container.scrollTop - container.clientTop,
  };
};
