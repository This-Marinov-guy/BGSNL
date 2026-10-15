import { redirect } from "next/navigation";
import { statisticsRedirectPath } from "@/util/administration.mjs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Event metrics", robots: { index: false, follow: false } };

export default async function Page({ searchParams }) {
  redirect(statisticsRedirectPath("event", await searchParams));
}
