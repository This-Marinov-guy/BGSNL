/* eslint-disable react/prop-types */
import EventDetails from "@/screens/eventActions/EventDetails";
import { getEventDetails } from "@/util/api/server";
import { buildEventMetadata } from "@/util/seo/event-metadata";
import {
  buildBreadcrumbSchema,
  buildEventSchema,
  serializeJsonLd,
} from "@/util/seo/structured-data";
import { humanizeRegion } from "@/util/seo/site";
import { notFound, permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { eventId } = await params;
  const event = await getEventDetails(eventId);
  if (!event) return { robots: { index: false, follow: false } };
  const canonicalId = event.slug || event.id;
  return buildEventMetadata(canonicalId, `/${event.region}/event-details/${canonicalId}`, event);
}

export default async function Page({ params }) {
  const { region, eventId } = await params;
  const event = await getEventDetails(eventId);
  if (!event) notFound();

  const canonicalId = event.slug || event.id;
  const path = `/${event.region}/event-details/${canonicalId}`;
  if (region !== event.region || eventId !== canonicalId) permanentRedirect(path);

  const eventSchema = buildEventSchema({ event, region, path });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: humanizeRegion(event.region), path: `/${event.region}` },
    { name: "Events", path: `/${event.region}/events/future-events` },
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
