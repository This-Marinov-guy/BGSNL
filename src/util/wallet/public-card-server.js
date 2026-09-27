import "server-only";
import QRCode from "qrcode";
import { isIP } from "node:net";
import { API_URL, API_HEADERS } from "@/util/api/server";
import spec from "@assets/wallet-cards/v1/specifications.json";

// Shared by the initial server render and browser refreshes. Never cache status
// or forward account cookies: the opaque public token is the sole identifier.
export async function loadPublicCard(token, requestHeaders) {
  if (!/^[A-Za-z0-9_-]{22}$/.test(token)) return { status: 404 };
  try {
    const forwarded = { ...API_HEADERS, "x-bgsnl-browser-proxy": "1" };
    const ipHeader = process.env.VERCEL ? "x-forwarded-for" : process.env.BGSNL_TRUSTED_CLIENT_IP_HEADER;
    const ip = ipHeader && requestHeaders.get(ipHeader)?.trim();
    if (ip && isIP(ip)) forwarded["x-bgsnl-client-ip"] = ip;
    const response = await fetch(`${API_URL}/v1/user/wallet/public/${token}`.replace(/\/v1\/v1\//, "/v1/"), {
      headers: forwarded, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return { status: response.status === 404 ? 404 : 503 };
    const { card, ticketImages = [] } = await response.json();
    if (!["active", "locked"].includes(card?.status)) return { status: 503 };
    const qrImage = await QRCode.toDataURL(`https://bulgariansociety.nl/c/${token}`, {
      width: 384, margin: 4, errorCorrectionLevel: "M",
      color: { dark: spec.design.colors.qrForeground, light: spec.design.colors.qrBackground },
    });
    return { status: 200, data: { card, ticketImages, qrImage, verifiedAt: Date.now() } };
  } catch { return { status: 503 }; }
}
