import React from "react";
import HeaderTwo from "../../component/header/HeaderTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import EventsAnalyticsList from "../../elements/actions/dashboard/events-analytics/EventsAnalyticsList";

const EventsAnalyticsDashboard = () => {
  return (
    <React.Fragment>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <div className="container mt--200">
        <EventsAnalyticsList />
      </div>

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} style={{ fontSize: "26px" }} />
        </ScrollToTop>
      </div>
    </React.Fragment>
  );
};

export default EventsAnalyticsDashboard;
