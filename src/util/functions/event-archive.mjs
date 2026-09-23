export const ARCHIVE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
const normalizedStatus = (event) => String(event?.status || "").trim().toLowerCase();

export const eventDateTime = (event) => {
  const time = new Date(event?.correctedDate || event?.date).getTime();
  return Number.isFinite(time) ? time : null;
};

export const isPastOrArchivedEvent = (event, now = Date.now()) => {
  const status = normalizedStatus(event);
  if (!event || status === "draft") return false;
  if (["archived", "cancelled"].includes(status)) return true;
  const date = eventDateTime(event);
  return date !== null && date < now;
};

export const isActiveEvent = (event, now = Date.now()) =>
  Boolean(event) && normalizedStatus(event) !== "draft" && !isPastOrArchivedEvent(event, now);

export const shouldArchiveEvent = (event, now = Date.now()) => {
  if (!event || ["draft", "archived", "cancelled"].includes(normalizedStatus(event))) return false;
  const date = eventDateTime(event);
  return date !== null && date <= now - ARCHIVE_AFTER_MS;
};
