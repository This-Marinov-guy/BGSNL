"use client";

import PropTypes from "prop-types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import HeaderTwo from "@/component/header/HeaderTwo";
import DashboardNavigation from "@/screens/userActions/DashboardNavigation";
import EventsAnalyticsList from "@/elements/actions/dashboard/events-analytics/EventsAnalyticsList";
import MembersList from "@/elements/actions/dashboard/members/MembersList";
import workspace from "@/screens/userActions/dashboard-workspace.module.scss";

export default function StatisticsDashboard({ kind }) {
  const searchParams = useSearchParams();
  const sharedFilters = new URLSearchParams();
  for (const key of ["region", "from", "to"]) {
    const value = searchParams.get(key);
    if (value) sharedFilters.set(key, value);
  }
  const tabHref = (tab) => {
    const query = sharedFilters.toString();
    return `/user/dashboard/metrics/${tab}${query ? `?${query}` : ""}`;
  };
  const tabs = <nav className={workspace.metricTabs} aria-label="Metrics views">
    <Link href={tabHref("events")} aria-current={kind === "events" ? "page" : undefined}>Events</Link>
    <Link href={tabHref("members")} aria-current={kind === "members" ? "page" : undefined}>Members</Link>
  </nav>;
  return <>
    <HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className={`container user-workspace-page event-admin-page ${workspace.page}`}>
      <DashboardNavigation />
      <h1 className="visually-hidden">{kind === "events" ? "Event metrics" : "Member metrics"}</h1>
      {tabs}
      {kind === "events" ? <EventsAnalyticsList /> : <MembersList />}
    </main>
  </>;
}

StatisticsDashboard.propTypes = { kind: PropTypes.oneOf(["events", "members"]).isRequired };
