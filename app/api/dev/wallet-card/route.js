import QRCode from "qrcode";
import spec from "@assets/wallet-cards/v1/specifications.json";
import { buildPassDrafts, getTestCard, testCardUrl, walletPreviewEnabled } from "@/util/wallet/test-card.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function GET(request) {
  if (!walletPreviewEnabled()) return Response.json({ error: "Not found" }, { status: 404, headers });
  const url = new URL(request.url);
  const card = getTestCard(url.searchParams.get("card") || "member-active", spec);
  if (!card) return Response.json({ error: "Card unavailable" }, { status: 404, headers });
  let qrUrl;
  try {
    qrUrl = testCardUrl(card.id, process.env.WALLET_TEST_BASE_URL || "http://localhost:3000");
  } catch {
    return Response.json({ error: "Invalid WALLET_TEST_BASE_URL configuration" }, { status: 503, headers });
  }
  const qrImage = await QRCode.toDataURL(qrUrl, {
    width: 384,
    margin: spec.design.layout.qrCode.quietZoneModules,
    errorCorrectionLevel: "M",
    color: { dark: spec.design.colors.qrForeground, light: spec.design.colors.qrBackground },
  });
  return Response.json({
    card, qrUrl, qrImage,
    nativeDrafts: buildPassDrafts(card, qrUrl, {
      applePassTypeId: process.env.APPLE_WALLET_PASS_TYPE_ID,
      appleTeamId: process.env.APPLE_WALLET_TEAM_ID,
      googleIssuerId: process.env.GOOGLE_WALLET_ISSUER_ID,
    }),
  }, { headers });
}
