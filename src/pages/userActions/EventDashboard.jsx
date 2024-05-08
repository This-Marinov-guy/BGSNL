import React, { Fragment, useEffect, useState } from "react";
import HeaderTwo from "../../component/header/HeaderTwo";
import { useHttpClient } from "../../hooks/http-hook";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Link, useParams } from "react-router-dom";
import RegionOptions from "../../elements/ui/RegionOptions";
import { REGIONS_MEMBERSHIP_SPECIFICS } from "../../util/REGIONS_AUTH_CONFIG";
import { REGIONS } from "../../util/REGIONS_DESIGN";
import capitalizeFirstLetter from "../../util/capitalize";
import Filter from "../../elements/actions/dashboard/Filter";
import EventList from "../../elements/actions/dashboard/open-events/EventList";

const EventDashboard = (props) => {
  const { loading, sendRequest } = useHttpClient();

  const { region } = useParams();

  const navigate = useNavigate();

  return (
    <React.Fragment>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <div className="container mt--200">
        <Filter />
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