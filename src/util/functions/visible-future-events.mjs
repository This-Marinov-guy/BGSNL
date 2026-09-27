export function visibleFutureEvents(eventsByRegion, regions, isAuthenticated = false) {
  return regions.flatMap(region =>
    (eventsByRegion?.[region] || [])
      .filter(event => event.hidden !== true && (isAuthenticated || !event.memberOnly))
      .map(event => ({ ...event, region: event.region ?? region }))
  );
}
