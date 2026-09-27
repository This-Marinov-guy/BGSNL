/* eslint-disable react/prop-types */
import PurchaseTicket from "@/screens/eventActions/PurchaseTicket";
import RecoveryScreen from "@/component/common/RecoveryScreen";
import { permanentRedirect } from "next/navigation";
import { getEventDetails } from "@/util/api/server";
import { buildEventMetadata } from "@/util/seo/event-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { region, eventId } = await params;
  const event = await getEventDetails(eventId, region);
  const canonicalId = event?.slug || event?.id || eventId;
  const metadata = await buildEventMetadata(
    canonicalId,
    `/${event?.region || region}/event-details/${encodeURIComponent(canonicalId)}`,
    event,
    region
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
  const { region, eventId } = await params;
  // Request-scoped caching shares this slug-or-ID lookup with metadata.
  const event = await getEventDetails(eventId, region);
  if (!event) return <RecoveryScreen kind={event === undefined ? "unavailable" : "not-found"} />;

  // Legacy ID links remain valid and lead to the preferred slug URL.
  const canonicalId = event.slug || event.id;
  if (region !== event.region || eventId !== canonicalId) {
    permanentRedirect(`/${event.region}/purchase-ticket/${encodeURIComponent(canonicalId)}`);
  }

  return <PurchaseTicket initialEvent={event} />;
}
