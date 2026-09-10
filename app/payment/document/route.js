import { NextResponse } from "next/server";
import { getPaymentResult, paymentPrivacyHeaders } from "@/util/payments/server";
import { isStripeDocumentUrl, paymentPageUrl, validCheckout } from "@/util/payments/return-policy.mjs";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const checkout = new URL(request.url).searchParams.get("checkout");
  let result;
  try {
    result = await getPaymentResult(checkout);
    if (result.status !== "success") return NextResponse.redirect(new URL(paymentPageUrl(result), request.url), { status: 303, headers: paymentPrivacyHeaders });
    if (result.invoiceUrl) {
      // Stripe may redirect its invoice endpoint to its document CDN. Follow
      // only a bounded chain of explicitly trusted HTTPS Stripe hosts.
      let document;
      let url = result.invoiceUrl;
      const signal = AbortSignal.timeout(15000);
      for (let redirects = 0; redirects < 4; redirects++) {
        if (!isStripeDocumentUrl(url)) throw new Error("Invalid invoice host");
        document = await fetch(url, { cache: "no-store", redirect: "manual", signal });
        if (![301, 302, 303, 307, 308].includes(document.status)) break;
        const location = document.headers.get("location");
        await document.body?.cancel();
        if (!location) throw new Error("Invoice redirect unavailable");
        url = new URL(location, url).href;
      }
      if (!document.ok || !document.headers.get("content-type")?.includes("application/pdf")) throw new Error("Invoice unavailable");
      return new Response(document.body, { headers: { ...paymentPrivacyHeaders,
        "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="BGSNL-invoice-${checkout}.pdf"` } });
    }
    if (isStripeDocumentUrl(result.receiptUrl)) return NextResponse.redirect(result.receiptUrl, { status: 303, headers: paymentPrivacyHeaders });
    throw new Error("Document unavailable");
  } catch (error) {
    const path = error.status === 404 || !validCheckout(checkout) ? "/" : `${result ? paymentPageUrl(result) : `/success?checkout=${checkout}`}&document=unavailable`;
    return NextResponse.redirect(new URL(path, request.url), { status: 303, headers: paymentPrivacyHeaders });
  }
}
