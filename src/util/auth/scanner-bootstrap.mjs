import { SCANNER_PATH, scannerReturnPath } from "./scanner-return.mjs";

export function parseScannerBootstrap(data, userId) {
  const access = data?.access;
  if (!access || access.userId !== userId || !Array.isArray(access.roles) ||
      !access.roles.every(role => typeof role === "string") ||
      typeof access.status !== "string" || !Array.isArray(data.events) ||
      !data.events.every(event => event && typeof event.id === "string" &&
        typeof event.title === "string" && typeof event.region === "string")) {
    throw new Error("Scanner access could not be verified. Please try again.");
  }
  return { access, events: data.events };
}

export function scannerAccessRedirect(status, path) {
  if (status === 403) return "/user";
  if (status === 401) return `${SCANNER_PATH}/sign-in?returnTo=${encodeURIComponent(scannerReturnPath(path))}`;
  return null;
}

export function authorizedScannerEventId(eventId, events) {
  return typeof eventId === "string" && events.some(event => event.id === eventId) ? eventId : "";
}
