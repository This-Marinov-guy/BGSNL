import React from "react";
import { Link } from "react-router-dom";
import HeaderTwo from "../../component/header/HeaderTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp, FiArrowLeft } from "react-icons/fi";
import InternshipForm from "../../elements/actions/form/InternshipForm";

const AddInternship = () => {
  return (
    <React.Fragment>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <div className="container mt--200 mb--60">
        <div className="mb--30">
          <Link
            to="/user/internships-dashboard"
            className="d-inline-flex align-items-center"
            style={{ color: "#6b7280", textDecoration: "none", gap: "6px", fontSize: "15px" }}
          >
            <FiArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>
        <h3 className="mb--40">Add Internship</h3>
        <InternshipForm />
      </div>

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} style={{ fontSize: "26px" }} />
        </ScrollToTop>
      </div>
    </React.Fragment>
  );
};

export default AddInternship;
