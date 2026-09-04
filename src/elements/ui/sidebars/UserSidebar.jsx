import PropTypes from "prop-types";
import { LazyLoadImage } from "react-lazy-load-image-component";
import {
  FaBriefcase,
  FaCog,
  FaNewspaper,
  FaTag,
  FaTicketAlt,
  FaUser,
  FiArrowUp,
  IconlyClose,
  IconlyMenu,
} from "@/elements/ui/icons/IconlyIcons";
import { Link } from "@/util/navigation";
import {
  ACCESS_1,
  formatRole,
} from "../../../util/defines/common";
import { ACCOUNT_TABS } from "../../../util/defines/enum";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";
import AlumniRegistrationButton from "../buttons/AlumniRegistrationButton";

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
      case "profile":
        return <FaUser size={22} />;
      case "promotions":
        return <FaTag size={22} />;
      case "settings":
        return <FaCog size={22} />;
      default:
        return <FaUser size={22} />;
    }
  };

  const isAccess1 = currentUser.roles?.some((r) => ACCESS_1.includes(r));

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      {isMobile && (
        <button
          aria-controls="user-account-navigation"
          aria-expanded={isSidebarOpen}
          aria-label={
            isSidebarOpen
              ? "Close account navigation"
              : "Open account navigation"
          }
          className={`sidebar-toggle-btn ${
            isSidebarOpen ? "sidebar-open" : ""
          }`}
          onClick={toggleSidebar}
          type="button"
        >
          {isSidebarOpen ? (
            <IconlyClose size={24} aria-hidden />
          ) : (
            <IconlyMenu size={24} aria-hidden />
          )}
        </button>
      )}

      {isMobile && isSidebarOpen ? (
        <button
          aria-hidden="true"
          className="user-sidebar-backdrop"
          onClick={toggleSidebar}
          tabIndex={-1}
          type="button"
        />
      ) : null}

      {/* Sidebar */}
      <aside
        aria-label="Account navigation"
        className={`user-sidebar ${isMobile ? "mobile" : ""} ${
          isSidebarOpen ? "open" : ""
        }`}
        id="user-account-navigation"
      >
        {/* User Profile Overview */}
        <div className="sidebar-user-profile archive">
          <LazyLoadImage
            src={currentUser.image}
            alt={`${currentUser.name} profile`}
            className="sidebar-profile-image"
          />
          <h2 className="sidebar-user-name">{currentUser.name}</h2>
          <p className="sidebar-user-status">
            <span className="status-active">
              {formatRole(currentUser.roles)}{" "}
              {currentUser?.tier !== undefined && `Tier ${currentUser.tier}`}
            </span>
          </p>
          {currentUser?.tier === 0 && (
            <div className="sidebar-tier-action">
              <AlumniRegistrationButton
                className="rn-button-style--2 rn-btn-green sidebar-tier-button"
                asLink={false}
              >
                <FiArrowUp size={16} aria-hidden />
                Update tier
              </AlumniRegistrationButton>
            </div>
          )}
          <p className="sidebar-user-status">
            <span className="status-active">
              {capitalizeFirstLetter(currentUser.region || "", true)}
            </span>
          </p>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Account sections" className="sidebar-nav">
          <ul>
            {ACCOUNT_TABS.map((tab) => {
              const isActive =
                activeTab === tab ||
                (activeTab === "" && tab === ACCOUNT_TABS[0]);

              return (
                <li key={tab} className={isActive ? "active" : ""}>
                  <Link
                    aria-current={isActive ? "page" : undefined}
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
              );
            })}
            {isAccess1 && (
              <>
                <li className="sidebar-divider" />
                <li>
                  <Link
                    to="/user/internships-dashboard"
                    onClick={() => {
                      if (isMobile) toggleSidebar();
                    }}
                  >
                    <span className="sidebar-icon">
                      <FaBriefcase size={22} />
                    </span>
                    <span className="sidebar-label">Manage Internships</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </aside>
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
