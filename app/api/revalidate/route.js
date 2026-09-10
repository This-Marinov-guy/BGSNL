import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const validSecret = (provided, expected) => {
  if (typeof provided !== "string" || typeof expected !== "string" || !expected) return false;
  const left = Buffer.from(provided), right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
};

/** Deployment-only cache invalidation endpoint. It accepts no browser origin,
 * requires a server secret, and invalidates only public discovery artifacts. */
export async function POST(request) {
  if (!validSecret(request.headers.get("x-bgsnl-revalidate-key"), process.env.SITEMAP_REVALIDATE_TOKEN)) {
    return Response.json({ message: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  revalidateTag("public-events", "max");
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
  return Response.json({ revalidated: true }, { headers: { "Cache-Control": "no-store" } });
}
