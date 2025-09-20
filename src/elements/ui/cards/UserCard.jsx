import React, { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";
import { REGION_WHATSAPP } from "../../../util/defines/REGIONS_DESIGN";
import {
  ALUMNI,
  formatRole,
} from "../../../util/defines/common";
import moment from "moment";
import AlumniModal from "../modals/AlumniModal";
import PropTypes from "prop-types";

const UserCard = ({ user }) => {
  const [isAlumniModalOpen, setIsAlumniModalOpen] = useState(false);

  const isAlumni = user.roles.includes(ALUMNI);

  return (
    <div className="service gradient-border-2 mt--20">
      {/* <h2 className='archive-title' >Greetings, {user.name}!</h2> */}
      <div className="hor_section mb--10">
        <p className="mt--10" style={{ fontFamily: "Archive" }}>
          {capitalizeFirstLetter(user.region)} <br /> {formatRole(user.roles)}{" "}
        </p>
      </div>
      <div className="pricing-body">
        <ul style={{ textAlign: "start" }} className="list-style--1">
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

          {/* <li style={{ fontWeight: "bold" }}>
                        <FiCircle style={{ fontSize: "14px" }} /> Membership
                        Expires: {user.expireDate}
                      </li> */}
          {REGION_WHATSAPP[user.region] && (
            <li>
              <FiCheckCircle style={{ fontSize: "14px" }} />
              <a
                style={{ color: "#017363" }}
                href={REGION_WHATSAPP[user.region]}
                target="_blank"
                rel="noreferrer"
              >
                Click here to join the Regional Member Chat
              </a>
            </li>
          )}
          {isAlumni ? (
            <li>
              <FiCheckCircle style={{ fontSize: "14px" }} />
              <a
                style={{ color: "#017363" }}
                href={REGION_WHATSAPP["alumni"]}
                target="_blank"
                rel="noreferrer"
              >
                Click here to join the Alumni Chat
              </a>
            </li>
          ) : (
            <li>
              <FiCheckCircle style={{ fontSize: "14px" }} />
              <a
                style={{ color: "#017363" }}
                href={REGION_WHATSAPP["netherlands"]}
                target="_blank"
                rel="noreferrer"
              >
                Click here to join the National Member Chat
              </a>
            </li>
          )}
        </ul>
        
        {/* Become an Alumni Button */}
        {!isAlumni && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              className="alumni-button"
              onClick={() => setIsAlumniModalOpen(true)}
            >
              <span className="alumni-icon">🎓</span>
              Become an Alumni
            </button>
          </div>
        )}
        
      </div>

      {/* Alumni Program Modal */}
      <AlumniModal
        isOpen={isAlumniModalOpen}
        onClose={() => setIsAlumniModalOpen(false)}
        onJoinNow={() => window.location.href = "/alumni/register"}
      />
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
