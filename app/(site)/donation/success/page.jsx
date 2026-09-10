import SuccessDonation from "@/screens/redirects/SuccessDonation";
import PropTypes from "prop-types";

export const metadata = {
  title: "Thank You",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page({ searchParams }) {
  return (
    <SuccessDonation searchParams={searchParams} />
  );
}
Page.propTypes = { searchParams: PropTypes.object.isRequired };
