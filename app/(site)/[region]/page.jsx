import Home from "@/screens/Home";
import { getEventsByRegion } from "@/util/api/server";
import { REGIONS } from "@/util/defines/REGIONS_DESIGN";
import { humanizeRegion, toMetadata } from "@/util/seo/site";

export async function generateMetadata({ params }) {
  const { region } = await params;
  const regionName = humanizeRegion(region);

  return toMetadata({
    title: `Bulgarian Community in ${regionName}`,
    description: `Meet the Bulgarian community in ${regionName}. Discover local BGSNL events, initiatives and ways to get involved.`,
    path: `/${region}`,
  });
}

export default async function Page() {
  const initialEvents = await getEventsByRegion(REGIONS);

  return <Home initialEvents={initialEvents} />;
}
