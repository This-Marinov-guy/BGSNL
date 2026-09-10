export const PAYMENT_COOKIE_PREFIX = "bgsnl-payment-";
export const PAYMENT_COOKIE_SECONDS = 7 * 24 * 60 * 60;
export const validCheckout = (value) => typeof value === "string" && /^[a-f0-9]{24}$/.test(value);
export const validPaymentToken = (value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
export const paymentCookieName = (checkout) => validCheckout(checkout) ? `${PAYMENT_COOKIE_PREFIX}${checkout}` : null;
export const paymentPage = (status) => status === "success" ? "/success" : status === "processing" ? "/payment/pending" : "/fail";
export const paymentPageUrl = (result) => `${paymentPage(result.status)}?checkout=${result.checkout}`;
export function isStripeDocumentUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password &&
      ["pay.stripe.com", "invoice.stripe.com", "invoice.stripecdn.com", "files.stripe.com", "dashboard.stripe.com"].includes(url.hostname);
  } catch { return false; }
}
export function publicPaymentResult(result) {
  return { status: result.status, kind: result.kind, amount: result.amount, currency: result.currency,
    date: result.date, items: result.items, reference: result.reference, returnPath: result.returnPath, refunded: result.refunded,
    transactionId: result.transactionId, paymentIntentId: result.paymentIntentId,
    hasInvoice: Boolean(result.invoiceUrl), hasReceipt: Boolean(result.receiptUrl), canResume: Boolean(result.retryUrl) };
}
