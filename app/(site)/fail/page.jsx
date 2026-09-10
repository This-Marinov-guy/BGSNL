import Fail from "@/screens/redirects/Fail";
import PropTypes from "prop-types";

export const metadata = {
  title: "Checkout not completed",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page({ searchParams }) {
  return (
    <Fail searchParams={searchParams} />
  );
}
Page.propTypes = { searchParams: PropTypes.object.isRequired };
