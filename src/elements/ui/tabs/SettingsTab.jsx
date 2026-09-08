import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import {
  FaCog,
  FaSignOutAlt,
  FaUser,
} from "@/elements/ui/icons/IconlyIcons";
import { showModal } from "../../../redux/modal";
import { logout } from "../../../redux/user";
import { USER_UPDATE_MODAL } from "../../../util/defines/common";
import SubscriptionManage from "../buttons/SubscriptionManage";
import ConnectedAccounts from "@/elements/authentication/ConnectedAccounts";
import UserTabHeader from "./UserTabHeader";

const SETTINGS_PRIMARY_ACTION =
  "settings-action rn-button-style--2 rn-btn-reverse-green rn-btn-small";
const SETTINGS_DANGER_ACTION =
  "settings-action rn-button-style--2 rn-btn-reverse-red rn-btn-small";

/**
 * One row of the settings list.
 *
 * These used to be free-standing cards in a grid, which read as six competing
 * panels for what is really a flat list of account actions. The row keeps the
 * icon/title/description/action of the old card, laid out on a single line.
 */
const SettingsRow = ({ action, description, icon, title, variant }) => (
  <li className={`settings-list__item${variant ? ` settings-list__item--${variant}` : ""}`}>
    <span aria-hidden="true" className="settings-list__icon">
      {icon}
    </span>
    <div className="settings-list__text">
      <h3 className="settings-list__title">{title}</h3>
      <p className="settings-list__description">{description}</p>
    </div>
    <div className="settings-list__action">{action}</div>
  </li>
);

SettingsRow.propTypes = {
  action: PropTypes.node,
  description: PropTypes.node,
  icon: PropTypes.node,
  title: PropTypes.node.isRequired,
  variant: PropTypes.string,
};

const SettingsTab = ({ user }) => {
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/";
  };

  return (
    <div className="tab-content-wrapper">
      <UserTabHeader title="Settings" />
      <div className="tab-body">
        <div className="settings-groups">
          <section className="settings-group" aria-labelledby="settings-account">
            <h2 id="settings-account" className="settings-group__title">Account</h2>
            <ul className="settings-list">
              <SettingsRow
                action={
                  <button
                    className={SETTINGS_PRIMARY_ACTION}
                    onClick={() => dispatch(showModal(USER_UPDATE_MODAL))}
                    type="button"
                  >
                    Edit profile
                  </button>
                }
                description="Update your details, contact information and profile photo."
                icon={<FaUser />}
                title="Profile information"
              />
            </ul>
          </section>

          <ConnectedAccounts />

          <section className="settings-group" aria-labelledby="settings-membership">
            <h2 id="settings-membership" className="settings-group__title">Membership</h2>
            <ul className="settings-list">
              <SettingsRow
                action={user?.subscription?.customerId ? <SubscriptionManage canCancel={user.isSubscribed} /> : null}
                description="Review invoices, update your payment method or cancel through Stripe."
                icon={<FaCog />}
                title="Billing"
              />
            </ul>
          </section>

          <section className="settings-group" aria-labelledby="settings-session">
            <h2 id="settings-session" className="settings-group__title">Session</h2>
            <ul className="settings-list">
              <SettingsRow
                action={
                  <button
                    className={SETTINGS_DANGER_ACTION}
                    onClick={handleLogout}
                    type="button"
                  >
                    Sign out
                  </button>
                }
                description="Sign out of your account on this device."
                icon={<FaSignOutAlt />}
                title="Sign out"
                variant="danger"
              />
            </ul>
          </section>
        </div>
      </div>

    </div>
  );
};

SettingsTab.propTypes = {
  user: PropTypes.object,
};

export default SettingsTab;
