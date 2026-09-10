"use client";
import PropTypes from "prop-types";
import PaymentResult from "@/screens/redirects/PaymentResult";

// UI-only fixtures behind the existing development-only route allowlist.
// These never create a payment, grant a receipt cookie or call the database.
export default function PaymentResultPreview({ outcome = "success", free = false }) {
  const status = ["success", "cancelled", "failed", "expired", "processing", "unavailable"].includes(outcome) ? outcome : "success";
  return <PaymentResult key={`${status}-${free}`} checkout={"0".repeat(24)} unavailable={status === "unavailable"}
      result={status === "unavailable" ? undefined : { status, kind: free ? "free" : "ticket", amount: free ? 0 : 1200, currency: "eur", date: "2026-09-10T12:00:00Z",
        items: [{ description: "Bulgarian Dinner — Groningen", quantity: 1, amount: free ? 0 : 1200 }], reference: "BGSNL-PREVIEW",
        transactionId: !free && status === "success" ? "ch_3PreviewTransaction123456789" : null,
        paymentIntentId: !free ? "pi_3PreviewPaymentIntent1234567" : null,
        returnPath: "/groningen/event-details/6a8ecc388e2b1093c9584aa8", hasInvoice: !free, canResume: ["cancelled", "failed"].includes(status) }} />
}

PaymentResultPreview.propTypes = { outcome: PropTypes.string, free: PropTypes.bool };
