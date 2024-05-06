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
        <div className="common-border-1">
          <h4>Filter</h4>
          <form className="row">
            <div className="col-lg-6 col-12">
              <select>
                <option value="" disabled>
                  Select Region
                </option>
                {REGIONS.map((val, index) => {
                  return <option value={val} key={index}>{capitalizeFirstLetter(val)}</option>
                })}
              </select>
            </div>
            <div className="col-lg-6 col-12">
              <select>
                <option value="" disabled>
                  What to display
                </option>
                <option value="current">Current Events</option>
              </select>
            </div>
          </form>
        </div>

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