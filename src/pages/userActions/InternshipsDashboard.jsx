import React from "react";
import HeaderTwo from "../../component/header/HeaderTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import InternshipList from "../../elements/actions/dashboard/internships/InternshipList";

const InternshipsDashboard = () => {
  return (
    <React.Fragment>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <div className="container mt--200">
        <InternshipList />
      </div>

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} style={{ fontSize: "26px" }} />
        </ScrollToTop>
      </div>
    </React.Fragment>
  );
};

export default InternshipsDashboard;
