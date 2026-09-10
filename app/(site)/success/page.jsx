import Success from "@/screens/redirects/Success";
import PropTypes from "prop-types";

export const metadata = {
  title: "Payment confirmation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page({ searchParams }) {
  return (
    <Success searchParams={searchParams} />
  );
}
Page.propTypes = { searchParams: PropTypes.object.isRequired };
