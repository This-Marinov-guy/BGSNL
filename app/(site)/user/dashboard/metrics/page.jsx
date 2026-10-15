import { redirect } from "next/navigation";
import { statisticsRedirectPath } from "@/util/administration.mjs";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }) {
  redirect(statisticsRedirectPath("event", await searchParams));
}
