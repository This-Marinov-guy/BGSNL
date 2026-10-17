import { createGoogleEventTicketArtwork, eventTicketPosterUrl } from "@/util/wallet/event-ticket.mjs";
import { EVENT_TICKET_REGIONS, eventTicketBrand } from "@/util/wallet/event-ticket-brand.mjs";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const poster = searchParams.get("poster");
  if (!["netherlands", ...EVENT_TICKET_REGIONS].includes(region) || !eventTicketPosterUrl(poster)) {
    return new Response(null, { status: 404 });
  }
  try {
    const artwork = await createGoogleEventTicketArtwork(region, poster);
    return new Response(new Uint8Array(artwork), { headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    } });
  } catch {
    // Keep the chapter identity visible if the public poster is temporarily unavailable.
    const fallback = await readFile(path.join(process.cwd(), "public", eventTicketBrand(region).googleWideLogoUrl));
    return new Response(new Uint8Array(fallback), { headers: {
      "Content-Type": "image/png", "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex",
    } });
  }
}
