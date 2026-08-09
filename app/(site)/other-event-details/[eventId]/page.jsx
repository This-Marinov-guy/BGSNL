import NonSocietyEvent from "@/screens/eventActions/NonSocietyEvent";
import { OTHER_EVENTS } from "@/util/defines/OTHER_EVENTS";
import { stripHtml, toMetadata } from "@/util/seo/event-metadata";

/**
 * Non-society events are defined in code, not fetched from the API, so metadata
 * comes straight from OTHER_EVENTS. The old middleware.js hardcoded a single
 * entry for /other-event-details/pwc-career-pathways, which then went stale
 * when that event was removed; driving it off the defines keeps them in sync.
 *
 * The param allow-list matters for more than SEO: NonSocietyEvent falls back to
 * `OTHER_EVENTS[0]` for an unknown id and then reads `.ticketTimer` off it, so
 * any unrecognised id used to throw (and OTHER_EVENTS is currently empty).
 * Rejecting at the routing layer turns that 500 into a real 404.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return OTHER_EVENTS.map((event) => ({ eventId: event.id }));
}

export async function generateMetadata({ params }) {
  const { eventId } = await params;
  const event = OTHER_EVENTS.find((e) => e.id === eventId);
  const path = `/other-event-details/${eventId}`;

  if (!event) {
    return toMetadata({ path });
  }

  return toMetadata({
    title: event.title,
    description: event.description || stripHtml(event.text),
    image: event.poster,
    path,
  });
}

export default function Page() {
  return <NonSocietyEvent />;
}
