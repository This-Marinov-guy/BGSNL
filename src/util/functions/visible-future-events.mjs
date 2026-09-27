import { eventDateTime } from "./event-archive.mjs";

const FUTURE_EVENT_GRACE_MS = 2 * 24 * 60 * 60 * 1000;

export function visibleFutureEvents(eventsByRegion, regions, isAuthenticated = false, now = Date.now()) {
  const cutoff = now - FUTURE_EVENT_GRACE_MS;
  return regions.flatMap(region =>
    (eventsByRegion?.[region] || [])
      .filter(event => event.hidden !== true && (isAuthenticated || !event.memberOnly))
      .filter(event => {
        const date = eventDateTime(event);
        return date === null || date > cutoff;
      })
      .map(event => ({ ...event, region: event.region ?? region }))
  );
}
