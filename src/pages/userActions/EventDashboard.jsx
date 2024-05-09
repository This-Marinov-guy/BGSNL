import React from "react";
import HeaderTwo from "../../component/header/HeaderTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import EventList from "../../elements/actions/dashboard/open-events/EventList";

const EventDashboard = (props) => {
  return (
    <React.Fragment>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <div className="container mt--200">
        <EventList />
      </div>

      {/* End Footer Style  */}
      {/* Start Back To Top */}
      <div className="backto-top" >
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </React.Fragment>
  )
}

export default EventDashboard