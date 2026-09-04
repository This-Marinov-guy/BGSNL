import EventDetails from "@/screens/eventActions/EventDetails";
import { getEventDetails } from "@/util/api/server";
import { buildEventMetadata } from "@/util/seo/event-metadata";
import {
  buildBreadcrumbSchema,
  buildEventSchema,
  serializeJsonLd,
} from "@/util/seo/structured-data";
import { humanizeRegion } from "@/util/seo/site";

export async function generateMetadata({ params }) {
  const { region, eventId } = await params;
  return buildEventMetadata(eventId, `/${region}/event-details/${eventId}`);
}

export default async function Page({ params }) {
  const { region, eventId } = await params;
  // Deduped with the generateMetadata call above by Next's fetch cache.
  const event = await getEventDetails(eventId);
  const path = `/${region}/event-details/${eventId}`;
  const eventSchema = buildEventSchema({ event, region, path });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: humanizeRegion(region), path: `/${region}` },
    { name: "Events", path: `/${region}/events/future-events` },
    { name: event?.newTitle || event?.title || "Event", path },
  ]);

  return (
    <>
      {eventSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(eventSchema) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      <EventDetails initialEvent={event} />
    </>
  );
}
