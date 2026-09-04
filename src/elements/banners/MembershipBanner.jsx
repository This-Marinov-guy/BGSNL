import React from "react";
import PropTypes from "prop-types";
import TicketMotionIcon from "@/elements/ui/icons/TicketMotionIcon";
import { Link, useLocation } from "@/util/navigation";

const formatSaving = (saving) =>
  new globalThis.Intl.NumberFormat("en-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(saving) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(saving);

const MembershipBanner = ({ border = 2, saving = null }) => {
  const location = useLocation();
  const routePath = location.pathname;
  const hasSaving = Number.isFinite(saving) && saving > 0;

  return (
    <div
      className={`team_member_border_${border} center_section`}
      style={{ margin: "40px auto" }}
    >
      <div className="membership-banner-copy">
        <div className="membership-banner-heading">
          <div className="membership-banner-icon-wrapper" aria-hidden="true">
            <TicketMotionIcon className="membership-banner-motion-icon" />
          </div>
          <strong className="membership-banner-title ">
            {hasSaving
              ? `Save ${formatSaving(saving)} by becoming a member`
              : "Keep your ticket as a member"}
          </strong>
        </div>
        <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3">
          <Link
            className="rn-button-style--2 rn-btn-reverse-green center_text type-caption"
            onClick={() => sessionStorage.setItem("prevUrl", routePath)}
            to="/signup"
          >
            <span className="">Become a Member</span>
          </Link>
        </div>
        <p className="information type-caption">
          With your membership you also receive
        </p>
        <ul className="membership-banner-benefits type-caption">
          <li>exclusive access to events and merchandise</li>
          <li>internship opportunities</li>
          <li>ticket collection that lasts</li>
        </ul>
      </div>
    </div>
  );
};

MembershipBanner.propTypes = {
  border: PropTypes.number,
  saving: PropTypes.number,
};

export default MembershipBanner;
