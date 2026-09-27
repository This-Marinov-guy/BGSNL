import { websiteApi } from "@/util/auth/website-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request) {
  return websiteApi(request, ["support", "live"]);
}
