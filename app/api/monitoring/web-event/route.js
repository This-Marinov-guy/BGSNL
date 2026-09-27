import { allowedWebsiteOrigin } from "@/util/auth/cookie-policy.mjs";
import { boundedBody } from "@/util/auth/proxy-policy.mjs";
import { reportWebEvent } from "@/util/monitoring/server-report";

export const runtime = "nodejs";
const reply = (status) => new Response(null, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request) {
  const origin = new URL(request.url).origin;
  if (!allowedWebsiteOrigin(origin, process.env.NODE_ENV === "production") ||
      request.headers.get("origin") !== origin ||
      request.headers.get("sec-fetch-site") === "cross-site" ||
      !request.headers.get("content-type")?.startsWith("application/json")) return reply(403);
  let event;
  try { event = JSON.parse((await boundedBody(request.body, 2000)).toString("utf8")); }
  catch { return reply(400); }
  if (!event || typeof event !== "object" || !["page_view", "client_error"].includes(event.type)) return reply(422);
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return reply(await reportWebEvent(event, address) ? 202 : 503);
}
