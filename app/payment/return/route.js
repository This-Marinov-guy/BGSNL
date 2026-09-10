import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { PAYMENT_COOKIE_SECONDS, paymentCookieName, validPaymentToken } from "@/util/payments/return-policy.mjs";
import { paymentPrivacyHeaders } from "@/util/payments/server";

export const dynamic = "force-dynamic";

export function GET(request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!validPaymentToken(token)) return NextResponse.redirect(new URL("/", request.url), { status: 303, headers: paymentPrivacyHeaders });
  const checkout = createHash("sha256").update(token).digest("hex").slice(0, 24);
  // Strip the capability (and Stripe query parameters) before app HTML,
  // analytics or external assets. The destination still verifies this cookie
  // and the current Stripe state via the API; setting it grants no access.
  const response = NextResponse.redirect(new URL(`/success?checkout=${checkout}`, request.url), { status: 303, headers: paymentPrivacyHeaders });
  response.cookies.set(paymentCookieName(checkout), token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: PAYMENT_COOKIE_SECONDS,
  });
  return response;
}
