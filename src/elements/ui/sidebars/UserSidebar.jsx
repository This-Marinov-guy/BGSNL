import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { LazyLoadImage } from "react-lazy-load-image-component";
import {
  FaBriefcase,
  FaCog,
  FaNewspaper,
  FaTag,
  FaTicketAlt,
  FaUser,
  FiArrowUp,
  FiCalendar,
  FiEdit2,
  FiUsers,
  IconlyClose,
  IconlyMenu,
  IconlyQuestion,
  IconlyMessage,
} from "@/elements/ui/icons/IconlyIcons";
import { Link } from "@/util/navigation";
import { showModal } from "../../../redux/modal";
import {
  ACCESS_1,
  ACCESS_4,
  SUPPORT_ACCESS,
  formatRole,
  USER_UPDATE_MODAL,
} from "../../../util/defines/common";
import { ACCOUNT_TABS } from "../../../util/defines/enum";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";
import AlumniRegistrationButton from "../buttons/AlumniRegistrationButton";

const UserSidebar = ({
  currentUser,
  hasBirthday,
  activeTab,
  onTabChange,
  isMobile,
  isSidebarOpen,
  toggleSidebar,
}) => {
  const dispatch = useDispatch();
  const getTabIcon = (tab) => {
    switch (tab) {
      case "news":
        return <FaNewspaper />;
      case "tickets":
        return <FaTicketAlt />;
      case "internships":
        return <FaBriefcase />;
      case "profile":
        return <FaUser />;
      case "promotions":
        return <FaTag />;
      case "settings":
        return <FaCog />;
      case "help":
        return <IconlyQuestion />;
      default:
        return <FaUser />;
    }
  };

  const hasRole = (access) => currentUser.roles?.some((r) => access.includes(r));
  /*
   * Administration links mirror the role gates the header dropdown already
   * uses: the events dashboard is open to ACCESS_4, internships to ACCESS_1.
   */
  const adminLinks = [
    hasRole(ACCESS_1) && {
      icon: <FiUsers />,
      label: "Accounts",
      to: "/user/accounts",
    },
    currentUser.status === "active" && hasRole(SUPPORT_ACCESS) && {
      icon: <IconlyMessage />,
      label: "Support inbox",
      to: "/user/support",
    },
    hasRole(ACCESS_4) && {
      icon: <FiCalendar />,
      label: "Manage Events",
      to: "/user/dashboard",
    },
    hasRole(ACCESS_1) && {
      icon: <FaBriefcase />,
      label: "Manage Internships",
      to: "/user/internships-dashboard",
    },
  ].filter(Boolean);

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
        <div className="sidebar-user-profile">
          <button
            aria-label="Edit profile information"
            className="sidebar-profile-avatar"
            onClick={() => dispatch(showModal(USER_UPDATE_MODAL))}
            type="button"
          >
            {hasBirthday && (
              <img
                alt=""
                aria-hidden="true"
                className="birthday-hat"
                src="/assets/images/special/birthday-hat.png"
              />
            )}
            <LazyLoadImage
              src={currentUser.image}
              alt={`${currentUser.name} profile`}
              className="sidebar-profile-image"
            />
            <span aria-hidden="true" className="sidebar-profile-avatar__overlay">
              <FiEdit2 size="1.05rem" />
            </span>
          </button>
          <div className="sidebar-profile-copy">
            <h2 className="sidebar-user-name archive">{currentUser.name}</h2>
            <p className="sidebar-user-status">
              <span className="status-active">
                {currentUser.billingLocked || currentUser.status === "locked" ? "Benefits locked" : formatRole(currentUser.roles)}{" "}
                {currentUser?.isAlumni && Number.isInteger(currentUser.tier) && !currentUser.billingLocked && `Tier ${currentUser.tier}`}
              </span>
              {currentUser.region ? (
                <span className="sidebar-user-region">
                  {capitalizeFirstLetter(currentUser.region, true)}
                </span>
              ) : null}
            </p>
          </div>
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
          </ul>

          {/* The heading only exists when at least one link sits under it. */}
          {adminLinks.length > 0 && (
            <>
              <h3 className="sidebar-nav-heading" id="sidebar-administration">
                Administration
              </h3>
              <ul aria-labelledby="sidebar-administration">
                {adminLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={() => {
                        if (isMobile) toggleSidebar();
                      }}
                    >
                      <span className="sidebar-icon">{link.icon}</span>
                      <span className="sidebar-label">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>
      </aside>
    </>
  );
};

UserSidebar.propTypes = {
  currentUser: PropTypes.object.isRequired,
  hasBirthday: PropTypes.bool,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default UserSidebar;
