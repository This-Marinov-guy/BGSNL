import React from "react";
import { Link, useLocation } from "react-router-dom";
import ImageFb from "../ui/media/ImageFb";

const MembershipBanner = ({ border = 2 }) => {
  const location = useLocation();
  const routePath = location.pathname;

  return (
    <div
      className={`team_member_border_${border} center_section`}
      style={{ margin: "40px auto" }}
    >
      <div className="membership-banner-icon-wrapper">
        <svg
          className="membership-banner-icon-bg"
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M60 5C85.5 5 110 25.5 110 60C110 94.5 85.5 105 60 105C34.5 105 10 94.5 10 60C10 25.5 34.5 5 60 5Z"
            fill="#ECF5FC"
          />
        </svg>
        <ImageFb
          className="membership-banner-icon-image"
          style={{ width: 100, height: 100 }}
          src={"/assets/images/svg/3d/achievement-3d.png"}
          fallback={"/assets/images/svg/information/achievement-3d.png"}
          alt="Calendar"
        />
      </div>
      <p className="information center_text">
        You do not want to miss a discount, fill the info manually or miss a
        ticket for your collection - become a member to enjoy these benefits!
      </p>
      <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3">
        <Link
          className="rn-button-style--2 rn-btn-reverse-green center_text"
          onClick={() => sessionStorage.setItem("prevUrl", routePath)}
          to="/signup"
        >
          <span className="">Become a Member</span>
        </Link>
      </div>
    </div>
  );
};

export default MembershipBanner;
