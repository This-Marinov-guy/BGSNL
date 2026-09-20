export function eventLinkRegion(href) {
  try {
    return decodeURIComponent(new URL(href).pathname.match(/^\/([^/]+)\/event-details\//)?.[1] ?? "");
  } catch { return ""; }
}

export function eventLinkIdentifier(href) {
  try {
    return decodeURIComponent(new URL(href).pathname.match(/\/event-details\/([^/]+)/)?.[1] ?? "");
  } catch { return ""; }
}

export function relatedEventOptions(events, currentEventId) {
  const unique = new Map();
  for (const event of events) {
    const id = String(event.id ?? event._id ?? "");
    if (!id || !event.region || !event.title || ["draft", "archived"].includes(event.status) || id === currentEventId || event.slug === currentEventId) continue;
    unique.set(id, { ...event, id });
  }
  return [...unique.values()].sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
}

export function isRelatedEventSelected(event, links) {
  return links.some(link => {
    const identifier = eventLinkIdentifier(link.href);
    return Boolean(identifier && (identifier === event.id ||
      (identifier === event.slug && eventLinkRegion(link.href) === event.region)));
  });
}

export function relatedEventPoster(event) {
  return event?.poster || event?.images?.[0] || "";
}

export function relatedEventLink(event, origin) {
  return { name: event.title, href: new URL(`/${encodeURIComponent(event.region)}/event-details/${encodeURIComponent(event.id)}`, origin).href, poster: relatedEventPoster(event) };
}

// Filter before limiting so searching can still reach every available event.
export function visibleRelatedEvents(events, region, search = "") {
  const query = search.trim().toLowerCase();
  return events
    .filter(event => `${event.title} ${event.region.replaceAll("_", " ")}`.toLowerCase().includes(query))
    .sort((a, b) => Number(b.region === region) - Number(a.region === region))
    .slice(0, 3);
}
