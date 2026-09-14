export const eventSalesClosed = (event, now = Date.now()) =>
  event.status !== "draft" && Boolean(
    event.status === "closed" || event.isSaleClosed ||
    (event.ticketTimer && new Date(event.ticketTimer).valueOf() <= now)
  );

export const eventStatusLabel = (event, now = Date.now()) => {
  if (event.status === "draft") return "Draft";
  if (event.status === "archived") return "Archived";
  if (event.status === "cancelled") return "Cancelled";
  if (event.date && new Date(event.date).valueOf() < now) return "Past";
  return eventSalesClosed(event, now) ? "Sales closed" : "Opened";
};
