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
  ACCESS_2,
  MEMBER_ADMIN_ACCESS,
  ACCESS_4,
  BILLING_LOCKED_STATUSES,
  BILLING_LOCK_EXEMPT,
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
    if (!currentUser.hasBenefits && ["tickets", "internships", "promotions"].includes(tab)) {
      return (
        <img
          alt=""
          aria-hidden="true"
          className="sidebar-restricted-icon"
          src="/assets/images/svg/3d/lock.png"
        />
      );
    }

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
  // Mirrors accountRouteState's "locked" redirect: any status other than
  // active bounces admin routes back to Settings, unless a billing hold
  // (locked/payment_awaiting) is waived for admin/super admin.
  const billingExempt = BILLING_LOCKED_STATUSES.includes(currentUser.status) && hasRole(BILLING_LOCK_EXEMPT);
  const adminNavLocked = !!currentUser.status && currentUser.status !== "active" && !billingExempt;
  const restrictedIcon = (
    <img
      alt=""
      aria-hidden="true"
      className="sidebar-restricted-icon"
      src="/assets/images/svg/3d/lock.png"
    />
  );
  /*
   * Administration links mirror the role gates the header dropdown and each
   * panel's own page/API access already use: super admin and admin reach
   * every panel; society board members manage members/events/internships
   * (not support); board members manage only members and events, and
   * committee members only events — both scoped server-side to their own
   * region; support only reaches the ticket inbox.
   */
  const adminLinks = [
    { icon: <FiCalendar />, label: "Administration", to: "/user/dashboard" },
    hasRole(MEMBER_ADMIN_ACCESS) && {
      icon: adminNavLocked ? restrictedIcon : <FiUsers />,
      label: "Manage Members",
      to: "/user/dashboard/members",
    },
    (currentUser.status === "active" || billingExempt) && hasRole(SUPPORT_ACCESS) && {
      icon: adminNavLocked ? restrictedIcon : <IconlyMessage />,
      label: "Support Tickets",
      to: "/user/dashboard/support",
    },
    hasRole(ACCESS_4) && {
      icon: adminNavLocked ? restrictedIcon : <FiCalendar />,
      label: "Manage Events",
      to: "/user/dashboard/events",
    },
    hasRole(ACCESS_2) && {
      icon: adminNavLocked ? restrictedIcon : <FaBriefcase />,
      label: "Manage Internships",
      to: "/user/dashboard/internships",
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
          <span className="sidebar-toggle-label">
            {isSidebarOpen ? "Close" : "Menu"}
          </span>
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
                {formatRole(currentUser.roles)}{" "}
                {currentUser?.isAlumni &&
                  Number.isInteger(currentUser.tier) &&
                  `Tier ${currentUser.tier}`}
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
