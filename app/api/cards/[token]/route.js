import QRCode from "qrcode";
import { isIP } from "node:net";
import { API_URL, API_HEADERS } from "@/util/api/server";
import spec from "@assets/wallet-cards/v1/specifications.json";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };
export async function GET(request, { params }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{22}$/.test(token)) return Response.json({ message: "Card unavailable" }, { status: 404, headers });
  try {
    const forwarded = { ...API_HEADERS, "x-bgsnl-browser-proxy": "1" };
    const ipHeader = process.env.VERCEL ? "x-forwarded-for" : process.env.BGSNL_TRUSTED_CLIENT_IP_HEADER;
    const ip = ipHeader && request.headers.get(ipHeader)?.trim();
    if (ip && isIP(ip)) forwarded["x-bgsnl-client-ip"] = ip;
    const response = await fetch(`${API_URL}/v1/user/wallet/public/${token}`.replace(/\/v1\/v1\//, "/v1/"), {
      headers: forwarded, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return Response.json({ message: response.status === 404 ? "Card unavailable" : "Status unavailable" }, { status: response.status === 404 ? 404 : 503, headers });
    const { card, ticketImages = [] } = await response.json();
    if (!["active", "locked"].includes(card?.status)) throw new Error("Invalid status");
    const qrImage = await QRCode.toDataURL(`https://bulgariansociety.nl/c/${token}`, { width: 384, margin: 4, errorCorrectionLevel: "M",
      color: { dark: spec.design.colors.qrForeground, light: spec.design.colors.qrBackground } });
    return Response.json({ card, ticketImages, qrImage }, { headers });
  } catch { return Response.json({ message: "Status unavailable" }, { status: 503, headers }); }
}
