import "server-only";
import { cookies } from "next/headers";
import { API_HEADERS, API_URL } from "@/util/api/server";
import { paymentCookieName, validPaymentToken } from "./return-policy.mjs";

export class PaymentLookupError extends Error {
  constructor(status) {
    super(status === 404 ? "This payment link is invalid or has expired." : "We could not verify your payment right now.");
    this.status = status;
  }
}

export async function getPaymentResult(checkout) {
  const cookieName = paymentCookieName(checkout);
  const token = cookieName ? (await cookies()).get(cookieName)?.value : null;
  if (!validPaymentToken(token)) throw new PaymentLookupError(404);
  let response;
  try {
    response = await fetch(`${API_URL}/payment/result`, {
      method: "POST", headers: { ...API_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ token }), cache: "no-store", signal: AbortSignal.timeout(15000),
    });
  } catch { throw new PaymentLookupError(503); }
  if (!response.ok) throw new PaymentLookupError(response.status === 404 ? 404 : 503);
  const result = await response.json();
  if (result.checkout !== checkout || !["success", "processing", "failed", "cancelled", "expired"].includes(result.status)) throw new PaymentLookupError(404);
  return result;
}

export const paymentPrivacyHeaders = {
  "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive", "X-Content-Type-Options": "nosniff",
};
