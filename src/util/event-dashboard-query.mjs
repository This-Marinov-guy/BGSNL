export const EVENT_MODAL_QUERY_KEYS = Object.freeze([
  "event",
  "modal",
  "fullscreen",
  "extended",
  "guestSearch",
]);

const EVENT_VIEWS = ["active", "past", "drafts"];
export const EVENT_PAGE_SIZES = Object.freeze([8, 16, 24]);

const positiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export function clearEventModalQuery(params) {
  EVENT_MODAL_QUERY_KEYS.forEach(key => params.delete(key));
  return params;
}

export function readEventDashboardQuery(params) {
  const requestedView = params.get("eventView");
  const eventView = EVENT_VIEWS.includes(requestedView) ? requestedView : "active";
  const modalView = params.get("modal") === "guest-list" ? "guest-list" : "event";
  const requestedPageSize = positiveInteger(params.get("pageSize"), EVENT_PAGE_SIZES[0]);

  return {
    eventPage: positiveInteger(params.get("page"), 1),
    eventPageSize: EVENT_PAGE_SIZES.includes(requestedPageSize)
      ? requestedPageSize
      : EVENT_PAGE_SIZES[0],
    eventView,
    fullscreen: params.get("fullscreen") === "1",
    guestSearch: modalView === "guest-list" ? params.get("guestSearch") || "" : "",
    guestListExtended: modalView === "guest-list" && params.get("extended") === "1",
    modalView,
    openEventId: params.get("event") || "",
  };
}
