export const MAX_VISIBLE_TOASTS = 3;

// react-hot-toast stores the newest toast first. Updating an existing ID does
// not need another slot, while dismissed toasts no longer occupy one.
export function newestToastIdsToRemove(toasts, incomingToastId, limit = MAX_VISIBLE_TOASTS) {
  const visible = toasts.filter((item) => item.visible && !item.dismissed);
  const updatesExisting = visible.some((item) => item.id === incomingToastId);
  const excess = Math.max(0, visible.length + (updatesExisting ? 0 : 1) - limit);
  return visible
    .filter((item) => item.id !== incomingToastId)
    .slice(0, excess)
    .map((item) => item.id);
}
