import { getPaymentResult, paymentPrivacyHeaders } from "@/util/payments/server";
import { paymentPageUrl } from "@/util/payments/return-policy.mjs";

export async function POST(request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ message: "Please retry from your payment page." }, { status: 403, headers: paymentPrivacyHeaders });
  }
  try {
    const { checkout } = await request.json();
    const result = await getPaymentResult(checkout);
    // Another tab or a delayed payment may have completed this checkout.
    // Recheck at click time, and never create another session here.
    const url = ["success", "processing"].includes(result.status) ? paymentPageUrl(result) : result.retryUrl || result.returnPath;
    return Response.json({ url }, { headers: paymentPrivacyHeaders });
  } catch (error) {
    return Response.json({ message: error.status === 404 ? "Your payment link has expired. Please return to your account or the event page." : "We could not check your payment. Please try again shortly." },
      { status: error.status === 404 ? 404 : 503, headers: paymentPrivacyHeaders });
  }
}
