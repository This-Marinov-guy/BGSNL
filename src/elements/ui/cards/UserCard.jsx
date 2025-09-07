import React, { useState, useRef } from "react";
import { showModal } from "../../../redux/modal";
import { FiCheckCircle, FiEdit, FiSettings } from "react-icons/fi";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";
import { REGION_WHATSAPP } from "../../../util/defines/REGIONS_DESIGN";
import { useDispatch } from "react-redux";
import {
  ALUMNI,
  USER_UPDATE_MODAL,
  formatRole,
} from "../../../util/defines/common";
import moment from "moment";
import SubscriptionManage from "../buttons/SubscriptionManage";
import AlumniModal from "../modals/AlumniModal";
import { isProd } from "../../../util/functions/helpers";
import PropTypes from "prop-types";

const UserCard = ({ user }) => {
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAlumniModalOpen, setIsAlumniModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAlumni = user.roles.includes(ALUMNI);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="service gradient-border-2 mt--20">
      {/* <h2 className='archive-title' >Greetings, {user.name}!</h2> */}
      <div className="hor_section mb--10">
        <p className="mt--10" style={{ fontFamily: "Archive" }}>
          {capitalizeFirstLetter(user.region)} <br /> {formatRole(user.roles)}{" "}
        </p>
        <div
          className="user-actions-container"
          ref={dropdownRef}
          style={{ position: "relative" }}
        >
          <FiSettings
            className="settings_btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              cursor: "pointer",
              fontSize: "32px",
              color: "#017363",
              transition: "transform 0.2s ease",
              transform: isDropdownOpen ? "rotate(90deg)" : "rotate(0deg)",
            }}
            title="User Settings"
          />
          {isDropdownOpen && (
            <div
              className="user-actions-dropdown"
              style={{
                position: "absolute",
                top: "30px",
                right: "0",
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 1000,
                minWidth: "200px",
                padding: "8px 0",
              }}
            >
              <div
                className="dropdown-item"
                onClick={() => {
                  dispatch(showModal(USER_UPDATE_MODAL));
                  setIsDropdownOpen(false);
                }}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                <div style={{ padding: "8px 16px" }}>
                  <FiEdit style={{ fontSize: "22px", color: "#017363" }} />
                  <span style={{ marginLeft: "8px" }}>Edit Profile</span>
                </div>
              </div>
              {(!isProd() || user.subscription) && (
                <div
                  style={{ borderTop: "1px solid #e0e0e0", margin: "4px 0" }}
                />
              )}
              {(!isProd() || user.subscription) && (
                <div style={{ padding: "8px 16px" }}>
                  <SubscriptionManage
                    onAction={() => setIsDropdownOpen(false)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
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
        
        {(!isProd() || user.subscription) && <div className="mt--60" />}
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
