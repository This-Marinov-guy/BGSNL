import { FutureEvents } from "@/screens/information/FutureEvents";
import { getEventsByRegion } from "@/util/api/server";
import { REGIONS } from "@/util/defines/REGIONS_DESIGN";
import { toMetadata } from "@/util/seo/site";

export const metadata = toMetadata({
  title: "Future Events",
  description: "Upcoming events organised by the Bulgarian Society Netherlands.",
  path: "/events/future-events",
});

export default async function Page() {
  const initialEvents = await getEventsByRegion(REGIONS);

  return <FutureEvents initialEvents={initialEvents} />;
}
