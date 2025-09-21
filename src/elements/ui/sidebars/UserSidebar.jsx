import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  FaNewspaper,
  FaTicketAlt,
  FaBriefcase,
  FaTimes,
  FaBars,
  FaUser,
  FaCog,
} from "react-icons/fa";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ACCOUNT_TABS } from "../../../util/defines/enum";
import { formatRole } from "../../../util/defines/common";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";

const UserSidebar = ({
  currentUser,
  activeTab,
  onTabChange,
  isMobile,
  isSidebarOpen,
  toggleSidebar,
}) => {
  const getTabIcon = (tab) => {
    switch (tab) {
      case "news":
        return <FaNewspaper size={22} />;
      case "tickets":
        return <FaTicketAlt size={22} />;
      case "internships":
        return <FaBriefcase size={22} />;
      case "settings":
        return <FaCog size={22} />;
      default:
        return <FaUser size={22} />;
    }
  };

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      {isMobile && (
        <button
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? <FaTimes size={24}/> : <FaBars size={24}/>}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`user-sidebar ${isMobile ? "mobile" : ""} ${
          isSidebarOpen ? "open" : ""
        }`}
      >
        {/* User Profile Overview */}
        <div className="sidebar-user-profile" style={{ fontFamily: "Archive" }}>
          <LazyLoadImage
            src={currentUser.image}
            alt={`${currentUser.name} profile`}
            className="sidebar-profile-image"
          />
          <h2 className="sidebar-user-name">{currentUser.name}</h2>
          <p className="sidebar-user-status">
            <span className="status-active">
              {formatRole(currentUser.roles)}{" "}
            </span>
          </p>
          <p className="sidebar-user-status">
            <span className="status-active">
              {capitalizeFirstLetter(currentUser.region, true)} <br />{" "}
            </span>
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <ul>
            {ACCOUNT_TABS.map((tab, index) => (
              <li
                key={index}
                className={
                  activeTab === tab ||
                  (activeTab === "" && tab === ACCOUNT_TABS[0])
                    ? "active"
                    : ""
                }
              >
                <Link
                  to={`#${tab}`}
                  onClick={() => {
                    onTabChange(tab);
                    if (isMobile) toggleSidebar();
                  }}
                >
                  <span className="sidebar-icon">{getTabIcon(tab)}</span>
                  <span className="sidebar-label">
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

UserSidebar.propTypes = {
  currentUser: PropTypes.object.isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default UserSidebar;
