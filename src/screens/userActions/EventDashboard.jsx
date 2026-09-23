"use client";

import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiArrowLeft, FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import HeaderTwo from "@/component/header/HeaderTwo";
import EventList from "@/elements/actions/dashboard/open-events/EventList";
import { selectUser } from "@/redux/user";
import { EVENT_MANAGEMENT_ACCESS } from "@/util/defines/common";
import styles from "./administration.module.scss";
import AnalyticsAvailability from "@/elements/actions/dashboard/AnalyticsAvailability";
import { EVENT_MODAL_QUERY_KEYS } from "@/util/event-dashboard-query.mjs";

const EventsAnalyticsList = dynamic(() => import("@/elements/actions/dashboard/events-analytics/EventsAnalyticsList"), {
  loading: () => <p role="status">Loading event analytics…</p>,
});

export default function EventDashboard() {
  const user = useSelector(selectUser);
  const searchParams = useSearchParams();
  const canViewAnalytics = EVENT_MANAGEMENT_ACCESS.some((role) => user.roles?.includes(role));
  const analytics = canViewAnalytics && searchParams.get("view") === "analytics";
  const viewUrl = (view) => {
    const query = new URLSearchParams(searchParams);
    EVENT_MODAL_QUERY_KEYS.forEach(key => query.delete(key));
    if (view) query.set("view", view); else query.delete("view");
    return `/user/dashboard/events${query.size ? `?${query}` : ""}`;
  };

  return <>
    <HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className="container user-workspace-page event-admin-page">
      <nav className={styles.views} aria-label="Event administration">
        <Link className={styles.backLink} href="/user/dashboard" aria-label="Back to administration">
          <FiArrowLeft size={24} aria-hidden />
          <span>Administration</span>
        </Link>
        <div className={styles.viewTabs}>
            <Link href={viewUrl("")} aria-current={!analytics ? "page" : undefined} scroll={false}>Manage events</Link>
            {canViewAnalytics &&
            <Link href={viewUrl("analytics")} aria-current={analytics ? "page" : undefined} scroll={false}>Event analytics</Link>
            }
          </div>
      </nav>
      {analytics ? <AnalyticsAvailability title="Event analytics"><EventsAnalyticsList /></AnalyticsAvailability> : <EventList />}
    </main>
    <div className="backto-top"><ScrollToTop showUnder={160}><FiChevronUp size={26} /></ScrollToTop></div>
  </>;
}
