// Keep modal tooltips in the same stacking context as their input labels.
export const getTooltipContainer = (trigger) =>
  trigger?.closest(".bgsnl-modal__body, [data-modal-body]") ?? document.body;

export const getTooltipPosition = (container, { left, top }) => {
  if (container === document.body) return { left, top };

  const rect = container.getBoundingClientRect();
  const scaleX = rect.width / container.offsetWidth || 1;
  const scaleY = rect.height / container.offsetHeight || 1;
  return {
    position: "absolute",
    zIndex: 2,
    left: (left - rect.left) / scaleX + container.scrollLeft - container.clientLeft,
    top: (top - rect.top) / scaleY + container.scrollTop - container.clientTop,
  };
};
