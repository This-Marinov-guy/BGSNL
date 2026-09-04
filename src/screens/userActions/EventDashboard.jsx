"use client";

import React from "react";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import HeaderTwo from "../../component/header/HeaderTwo";
import EventList from "../../elements/actions/dashboard/open-events/EventList";

const EventDashboard = () => {
  return (
    <React.Fragment>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <main className="container user-workspace-page mt--200">
        <EventList />
      </main>

      {/* End Footer Style  */}
      {/* Start Back To Top */}
      <div className="backto-top" >
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </React.Fragment>
  )
}

export default EventDashboard
