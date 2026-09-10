import { redirect } from "next/navigation";
import PropTypes from "prop-types";
import { getPaymentResult } from "@/util/payments/server";
import { paymentPage, paymentPageUrl, publicPaymentResult } from "@/util/payments/return-policy.mjs";
import PaymentResult from "./PaymentResult";

export default async function GuardedPaymentResult({ searchParams, page }) {
  const { checkout, document } = await searchParams;
  let result;
  try { result = await getPaymentResult(checkout); }
  catch (error) {
    if (error.status === 404) redirect("/");
    // Fail closed, without claiming a declined payment during an API outage.
    return <PaymentResult unavailable checkout={checkout} />;
  }
  if (paymentPage(result.status) !== page) redirect(paymentPageUrl(result));
  return <PaymentResult result={publicPaymentResult(result)} checkout={checkout} documentUnavailable={document === "unavailable"} />;
}

GuardedPaymentResult.propTypes = { searchParams: PropTypes.object.isRequired, page: PropTypes.string.isRequired };
