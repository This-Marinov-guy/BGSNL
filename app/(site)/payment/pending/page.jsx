import GuardedPaymentResult from "@/screens/redirects/GuardedPaymentResult";
import PropTypes from "prop-types";
export const dynamic = "force-dynamic";
export const metadata = { title: "Confirming your payment", robots: { index: false, follow: false } };
export default function Page({ searchParams }) { return <GuardedPaymentResult searchParams={searchParams} page="/payment/pending" />; }
Page.propTypes = { searchParams: PropTypes.object.isRequired };
