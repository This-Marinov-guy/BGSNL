import React from "react";
import { FiCheckCircle } from "react-icons/fi";
import { REGION_WHATSAPP } from "../../../util/defines/REGIONS_DESIGN";
import {
  ALUMNI,
} from "../../../util/defines/common";
import moment from "moment";
import PropTypes from "prop-types";

const UserCard = ({ user }) => {
  const isAlumni = user.roles.includes(ALUMNI);

  return (
    <div className="service gradient-border-2 mt--20">
      {/* <h2 className='archive-title' >Greetings, {user.name}!</h2> */}
      {/* <div className="hor_section mb--10">
        <p className="mt--10" style={{ fontFamily: "Archive" }}>
          {capitalizeFirstLetter(user.region, true)} <br />{" "}
          {formatRole(user.roles)}{" "}
        </p>
      </div> */}
      <div className="pricing-body">
        <div className="user-info-grid">
          {/* Personal Information Column */}
          <div className="user-info-column">
            <h4 className="column-title">Personal Information</h4>
            <ul className="list-style--1">
              <li>
                <span className="bold">Full Name: </span>
                {user.name + " " + user.surname}
              </li>
              {user?.birth && (
                <li>
                  <span className="bold">Date of Birth: </span>
                  {moment(user.birth).format("D MMM YYYY")}
                </li>
              )}
              <li>
                <span className="bold">Email: </span>
                {user.email}
              </li>
              {user?.phone && (
                <li>
                  <span className="bold">Phone: </span>
                  {user.phone}
                </li>
              )}
              {user?.university && (
                <li>
                  <span className="bold">University: </span>
                  {user.university === "other"
                    ? user.otherUniversityName
                    : user.university}
                </li>
              )}
            </ul>
          </div>

          {/* Community Links Column */}
          <div className="user-info-column">
            <h4 className="column-title">Community</h4>
            <ul className="list-style--1">
              {REGION_WHATSAPP[user.region] && (
                <li className="d-flex align-items-center">
                  <FiCheckCircle className="link-icon" />
                  <a
                    className="community-link"
                    href={REGION_WHATSAPP[user.region]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Regional Member Chat
                  </a>
                </li>
              )}
              {isAlumni ? (
                <li className="d-flex align-items-center">
                  <FiCheckCircle className="link-icon" />
                  <a
                    className="community-link"
                    href={REGION_WHATSAPP["alumni"]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Alumni Chat
                  </a>
                </li>
              ) : (
                <li>
                  <FiCheckCircle className="link-icon" />
                  <a
                    className="community-link"
                    href={REGION_WHATSAPP["netherlands"]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    National Member Chat
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    surname: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    birth: PropTypes.string,
    university: PropTypes.string,
    otherUniversityName: PropTypes.string,
    region: PropTypes.string,
    roles: PropTypes.array,
    subscription: PropTypes.object,
  }).isRequired,
};

export default UserCard;
