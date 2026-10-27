/* eslint-disable react/prop-types */
import Home from "@/screens/Home";
import { getEventsByRegion } from "@/util/api/server";
import { PUBLIC_EVENT_REGIONS } from "@/util/defines/REGIONS_DESIGN";
import { humanizeRegion, toMetadata } from "@/util/seo/site";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { region } = await params;
  const regionName = humanizeRegion(region);

  return toMetadata({
    title: `Bulgarian Community in ${regionName}`,
    description: `Meet the Bulgarian community in ${regionName}. Discover local BGSNL events, initiatives and ways to get involved.`,
    path: `/${region}`,
  });
}

export default async function Page({ params }) {
  const { region } = await params;
  if (region === "national") redirect("/national/events/future-events");
  const initialEvents = await getEventsByRegion(PUBLIC_EVENT_REGIONS);

  return <Home initialEvents={initialEvents} initialNow={Date.now()} />;
}
