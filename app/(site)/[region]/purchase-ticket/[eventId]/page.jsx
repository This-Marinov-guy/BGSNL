/* eslint-disable react/prop-types */
import PurchaseTicket from "@/screens/eventActions/PurchaseTicket";
import { getEventDetails } from "@/util/api/server";
import { buildEventMetadata } from "@/util/seo/event-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { region, eventId } = await params;
  const metadata = await buildEventMetadata(
    eventId,
    `/${region}/event-details/${eventId}`
  );

  return {
    ...metadata,
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
  };
}

export default async function Page({ params }) {
  const { eventId } = await params;
  // Deduped with the generateMetadata call above by Next's fetch cache.
  const event = await getEventDetails(eventId);

  return <PurchaseTicket initialEvent={event} />;
}
