import { loadPublicCard } from "@/util/wallet/public-card-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };
export async function GET(request, { params }) {
  const { token } = await params;
  const result = await loadPublicCard(token, request.headers);
  return Response.json(result.data || { message: result.status === 404 ? "Card unavailable" : "Status unavailable" }, { status: result.status, headers });
}
