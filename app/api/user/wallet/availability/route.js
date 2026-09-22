import { websiteApi } from "@/util/auth/website-api";
import { walletReadiness } from "@/util/wallet/issuance.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request) {
  const response = await websiteApi(request, ["user", "wallet", "availability"]);
  if (!response.ok) return response;
  const data = await response.json();
  return Response.json({ ...data, providers: await walletReadiness() }, { headers: response.headers });
}
