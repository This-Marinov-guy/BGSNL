import { useState } from "react";
import moment from "moment";
import {
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiPhone,
} from "@/elements/ui/icons/IconlyIcons";
import { capitalizeAfterSpace } from "../../../../util/functions/capitalize";
import { MOMENT_DATE_YEAR } from "../../../../util/functions/date";

const MemberAccordion = ({ member }) => {
  const [expanded, setExpanded] = useState(false);

  const statusColor = member.isPaid ? "#28a745" : "#dc3545";
  const statusText = member.isPaid ? "Active" : "Expired";

  return (
    <div className="member-accordion">
      <div
        className="member-accordion__header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="member-accordion__summary">
          <div className="member-accordion__name">
            {member.name} {member.surname}
          </div>
          <div className="member-accordion__meta">
            <span className="member-accordion__role">
              {capitalizeAfterSpace(member.role?.replace(/_/g, " ") || "Member")}
            </span>
            <span className="member-accordion__tickets">
              {member.ticketsCount} ticket{member.ticketsCount !== 1 ? "s" : ""}
            </span>
            <span
              className="member-accordion__status"
              style={{ color: statusColor }}
            >
              {statusText}
            </span>
            <span className="member-accordion__date">
              Since {moment(member.startDate).format(MOMENT_DATE_YEAR)}
            </span>
            <span className="member-accordion__billing">
              {member.nextBilling
                ? `Next: ${moment(member.nextBilling).format(MOMENT_DATE_YEAR)}`
                : "No billing"}
            </span>
          </div>
        </div>
        <div className="member-accordion__toggle">
          {expanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </div>
      </div>

      {expanded && (
        <div className="member-accordion__details">
          <div className="row">
            <div className="col-md-2 col-4">
              <img
                src={member.image}
                alt={member.name}
                className="member-accordion__image"
              />
            </div>
            <div className="col-md-5 col-8">
              <div className="member-accordion__detail-row">
                <FiMail size={14} />
                <a href={`mailto:${member.email}`}>{member.email}</a>
              </div>
              {member.phone && (
                <div className="member-accordion__detail-row">
                  <FiPhone size={14} />
                  <span>{member.phone}</span>
                </div>
              )}
              {member.university && (
                <div className="member-accordion__detail-row">
                  <strong>
                    {member.university === "working" ? "Profession:" : "University:"}
                  </strong>
                  <span>
                    {member.university === "working"
                      ? member.profession || "Not specified"
                      : member.university === "other"
                        ? member.otherUniversityName || "Other university"
                        : member.university}
                  </span>
                </div>
              )}
            </div>
            <div className="col-md-5 col-12 mt-md-0 mt--10">
              <div className="member-accordion__detail-row">
                <strong>Region:</strong>
                <span>
                  {capitalizeAfterSpace(
                    member.region?.replace(/_/g, " ") || "Unknown"
                  )}
                </span>
              </div>
              <div className="member-accordion__detail-row">
                <strong>Start Date:</strong>
                <span>{moment(member.startDate).format(MOMENT_DATE_YEAR)}</span>
              </div>
              <div className="member-accordion__detail-row">
                <strong>Expire Date:</strong>
                <span
                  style={{ color: member.isPaid ? "inherit" : "#dc3545" }}
                >
                  {moment(member.expireDate).format(MOMENT_DATE_YEAR)}
                </span>
              </div>
              <div className="member-accordion__detail-row">
                <strong>Subscription:</strong>
                <span>
                  {member.hasSubscription ? "Active" : "None"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberAccordion;
