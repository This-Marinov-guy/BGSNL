import AuthLayout from "@/layouts/authentication/AuthLayout";
import { ACCESS_4 } from "@/util/defines/common";
import EventDashboard from "@/screens/userActions/EventDashboard";
import { redirect } from "next/navigation";
import { statisticsRedirectPath } from "@/util/administration.mjs";
import PropTypes from "prop-types";

// Renders components that read search params, so it must render per request.
export const dynamic = "force-dynamic";


export const metadata = {
  title: "Event Dashboard",
  robots: { index: false, follow: false },
};

export default async function Page({ searchParams }) {
  const query = await searchParams;
  if (query?.view === "analytics") redirect(statisticsRedirectPath("event", query));
  return (
    <AuthLayout access={ACCESS_4}>
      <EventDashboard />
    </AuthLayout>
  );
}

Page.propTypes = { searchParams: PropTypes.object };
