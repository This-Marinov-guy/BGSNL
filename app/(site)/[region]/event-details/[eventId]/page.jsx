import EventDetails from "@/screens/eventActions/EventDetails";
import { getEventDetails } from "@/util/api/server";
import { buildEventMetadata } from "@/util/seo/event-metadata";

export async function generateMetadata({ params }) {
  const { region, eventId } = await params;
  return buildEventMetadata(eventId, `/${region}/event-details/${eventId}`);
}

export default async function Page({ params }) {
  const { eventId } = await params;
  // Deduped with the generateMetadata call above by Next's fetch cache.
  const event = await getEventDetails(eventId);

  return <EventDetails initialEvent={event} />;
}
