import { FutureEvents } from "@/screens/information/FutureEvents";
import { getEventsByRegion } from "@/util/api/server";
import { PUBLIC_EVENT_REGIONS } from "@/util/defines/REGIONS_DESIGN";
import { humanizeRegion, toMetadata } from "@/util/seo/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { region } = await params;
  const regionName = humanizeRegion(region);

  if (region === "national") return toMetadata({
    title: "Upcoming National Events",
    description: "See upcoming BGSNL events beyond our city chapters.",
    path: "/national/events/future-events",
  });

  return toMetadata({
    title: `Upcoming Bulgarian Events in ${regionName}`,
    description: `See upcoming cultural, social and community events organised by BGSNL in ${regionName}.`,
    path: `/${region}/events/future-events`,
  });
}

export default async function Page() {
  const initialEvents = await getEventsByRegion(PUBLIC_EVENT_REGIONS);

  return <FutureEvents initialEvents={initialEvents} />;
}
