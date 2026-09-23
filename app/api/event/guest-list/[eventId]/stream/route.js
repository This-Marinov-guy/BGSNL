import { websiteApi } from "@/util/auth/website-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request, { params }) {
  return websiteApi(request, ["event", "guest-list", (await params).eventId, "stream"]);
}
