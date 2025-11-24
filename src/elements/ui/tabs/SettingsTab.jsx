import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  FaCog,
  FaUser,
  FaSignOutAlt,
  FaGraduationCap,
} from "react-icons/fa";
import { showModal } from "../../../redux/modal";
import { useDispatch } from "react-redux";
import { USER_UPDATE_MODAL, ALUMNI } from "../../../util/defines/common";
import SubscriptionManage from "../buttons/SubscriptionManage";
import { isProd } from "../../../util/functions/helpers";
import { logout } from "../../../redux/user";
import AlumniModal from "../modals/AlumniModal";
import { useAlumniRegistration } from "../../../hooks/alumni/use-alumni-registration";
import AlumniRegistrationButton from "../buttons/AlumniRegistrationButton";
import { FiArrowUp } from "react-icons/fi";

const SettingsTab = ({ user }) => {
  const dispatch = useDispatch();
  const [isAlumniModalOpen, setIsAlumniModalOpen] = useState(false);
  const { handleAlumniRegistrationClick } = useAlumniRegistration();

  const isAlumni = user?.isAlumni;
  const isFreeAlumni = isAlumni && user?.tier === 0;

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/";
  };

  return (
    <div className="tab-content-wrapper">
      <div className="tab-header">
        <h2>Account Settings</h2>
        <p>Manage your account preferences and personal information.</p>
      </div>
      <div className="tab-body">
        <div className="settings-grid">
          {/* Profile Settings */}
          <div className="settings-card">
            <div className="settings-card-header">
              <FaUser className="settings-icon" />
              <h3>Profile Information</h3>
            </div>
            <div className="settings-card-body">
              <p>
                Update your personal details, profile picture, and contact
                information.
              </p>
              <button
                className="rn-button-style--2 rn-btn-green"
                onClick={() => dispatch(showModal(USER_UPDATE_MODAL))}
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Alumni Program */}
          {!isAlumni && (
            <div className="settings-card alumni-card">
              <div className="settings-card-header">
                <FaGraduationCap className="settings-icon" />
                <h3>Alumni Program</h3>
              </div>
              <div className="settings-card-body">
                <p>
                  Join our exclusive alumni program to access special benefits,
                  networking opportunities, and exclusive events.
                </p>
                <button
                  className="rn-button-style--2 rn-btn-green alumni-button"
                  onClick={() => setIsAlumniModalOpen(true)}
                >
                  <span className="alumni-icon">🎓</span>
                  Become an Alumni
                </button>
              </div>
            </div>
          )}

          {/* Tier 0 Alumni Upgrade */}
          {isFreeAlumni && (
            <div
              className="settings-card tier-upgrade-card"
              style={{
                border: "2px solid #ff6b35",
                backgroundColor: "#fff5f2",
              }}
            >
              <div className="settings-card-header">
                <FiArrowUp
                  className="settings-icon"
                  style={{ color: "#ff6b35" }}
                />
                <h3 style={{ color: "#ff6b35" }}>Upgrade Your Tier</h3>
              </div>
              <div className="settings-card-body">
                <p>
                  As a tier 0 alumni, you&apos;re missing out on exclusive
                  benefits and features. Upgrade your subscription to unlock
                  premium alumni perks, special events, and more.
                </p>
                <AlumniRegistrationButton
                  className="rn-button-style--2 rn-btn-green"
                  asLink={false}
                  style={{
                    fontSize: "14px",
                    padding: "10px 20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    fontWeight: "bold",
                  }}
                >
                  <FiArrowUp size={16} style={{ marginRight: "8px" }} />
                  Upgrade Tier
                </AlumniRegistrationButton>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {/* <div className="settings-card">
            <div className="settings-card-header">
              <FaBell className="settings-icon" />
              <h3>Notifications</h3>
            </div>
            <div className="settings-card-body">
              <p>
                Manage your notification preferences for events, news, and
                updates.
              </p>
              <button className="rn-button-style--2 rn-btn-green">
                Notification Settings
              </button>
            </div>
          </div> */}

          {/* Privacy & Security */}
          {/* <div className="settings-card">
            <div className="settings-card-header">
              <FaShieldAlt className="settings-icon" />
              <h3>Privacy & Security</h3>
            </div>
            <div className="settings-card-body">
              <p>Control your privacy settings and manage account security.</p>
              <button className="rn-button-style--2 rn-btn-green">
                Privacy Settings
              </button>
            </div>
          </div> */}

          {/* Appearance */}
          {/* <div className="settings-card">
            <div className="settings-card-header">
              <FaPalette className="settings-icon" />
              <h3>Appearance</h3>
            </div>
            <div className="settings-card-body">
              <p>Customize the look and feel of your dashboard and interface.</p>
              <button className="rn-button-style--2 rn-btn-green">
                Theme Settings
              </button>
            </div>
          </div> */}

          {/* Subscription Management */}
          {!isFreeAlumni && <div className="settings-card">
            <div className="settings-card-header">
              <FaCog className="settings-icon" />
              <h3>Subscription Management</h3>
            </div>
            <div className="settings-card-body">
              <p>Manage your membership, payment information and invoices.</p>
              {(!isProd() || user?.subscription) && (
                <div className="subscription-actions">
                  <SubscriptionManage isAlumni={isAlumni}/>
                </div>
              )}
              {/* <button className="rn-button-style--2 rn-btn-green">
                Subscription Settings
              </button> */}
            </div>
          </div>}

          {/* Logout */}
          <div className="settings-card danger-card">
            <div className="settings-card-header">
              <FaSignOutAlt className="settings-icon" />
              <h3>Sign Out</h3>
            </div>
            <div className="settings-card-body">
              <p>Sign out of your account from this device.</p>
              <button
                className="rn-button-style--2 rn-btn-reverse-red"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alumni Program Modal */}
      <AlumniModal
        isOpen={isAlumniModalOpen}
        onClose={() => setIsAlumniModalOpen(false)}
        onJoinNow={handleAlumniRegistrationClick}
      />
    </div>
  );
};

SettingsTab.propTypes = {
  user: PropTypes.object,
};

export default SettingsTab;
