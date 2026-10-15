"use client";

import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import DashboardNavigation from "@/screens/userActions/DashboardNavigation";
import workspace from "@/screens/userActions/dashboard-workspace.module.scss";
import HeaderTwo from "@/component/header/HeaderTwo";
import EventList from "@/elements/actions/dashboard/open-events/EventList";

export default function EventDashboard() {
  return <>
    <HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className={`container user-workspace-page event-admin-page ${workspace.page}`}>
      <DashboardNavigation />
      <EventList />
    </main>
    <div className="backto-top"><ScrollToTop showUnder={160}><FiChevronUp size={26} /></ScrollToTop></div>
  </>;
}
