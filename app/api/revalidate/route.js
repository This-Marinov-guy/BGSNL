import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const validSecret = (provided, expected) => {
  if (typeof provided !== "string" || typeof expected !== "string" || !expected) return false;
  const left = Buffer.from(provided), right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
};

/** Server-to-server public event invalidation endpoint. The secret is never
 * exposed to browsers, and only public event/discovery tags can be expired. */
export async function POST(request) {
  if (!validSecret(request.headers.get("x-bgsnl-revalidate-key"), process.env.SITEMAP_REVALIDATE_TOKEN)) {
    return Response.json({ message: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  let eventId;
  try {
    const body = await request.json();
    if (typeof body?.eventId === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(body.eventId)) eventId = body.eventId;
  } catch { /* The existing sitemap workflow sends no JSON body. */ }
  revalidateTag("public-events", { expire: 0 });
  if (eventId) revalidateTag(`public-event:${eventId}`, { expire: 0 });
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
  return Response.json({ revalidated: true }, { headers: { "Cache-Control": "no-store" } });
}
