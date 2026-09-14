"use client";

import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import HeaderTwo from "@/component/header/HeaderTwo";
import EventList from "@/elements/actions/dashboard/open-events/EventList";
import { selectUser } from "@/redux/user";
import { ACCESS_3 } from "@/util/defines/common";
import styles from "./administration.module.scss";

const EventsAnalyticsList = dynamic(() => import("@/elements/actions/dashboard/events-analytics/EventsAnalyticsList"), {
  loading: () => <p role="status">Loading event analytics…</p>,
});

export default function EventDashboard() {
  const user = useSelector(selectUser);
  const searchParams = useSearchParams();
  const canViewAnalytics = ACCESS_3.some((role) => user.roles?.includes(role));
  const analytics = canViewAnalytics && searchParams.get("view") === "analytics";
  const viewUrl = (view) => {
    const query = new URLSearchParams(searchParams);
    if (view) query.set("view", view); else query.delete("view");
    return `/user/dashboard/events${query.size ? `?${query}` : ""}`;
  };

  return <>
    <HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className="container user-workspace-page event-admin-page">
      <nav className={styles.views} aria-label="Event administration">
        <Link href="/user/dashboard">← Administration</Link>
        {canViewAnalytics && <>
          <Link href={viewUrl("")} aria-current={!analytics ? "page" : undefined} scroll={false}>Manage events</Link>
          <Link href={viewUrl("analytics")} aria-current={analytics ? "page" : undefined} scroll={false}>Event analytics</Link>
        </>}
      </nav>
      {analytics ? <EventsAnalyticsList /> : <EventList />}
    </main>
    <div className="backto-top"><ScrollToTop showUnder={160}><FiChevronUp size={26} /></ScrollToTop></div>
  </>;
}
