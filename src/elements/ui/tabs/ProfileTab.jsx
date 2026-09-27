import React from "react";
import PropTypes from "prop-types";
import UserProfileHeader from "../headers/UserProfileHeader";
import UserTabHeader from "./UserTabHeader";
import WalletSettings from "@/elements/wallet/WalletSettings";

const ProfileTab = ({ currentUser, onUserRefresh }) => {
  return (
    <div className="tab-content-wrapper">
      <UserTabHeader title="Profile" />
      <div className="tab-body">
        <UserProfileHeader
          currentUser={currentUser}
          onUserRefresh={onUserRefresh}
        />
        <WalletSettings user={currentUser} preview />
      </div>
    </div>
  );
};

ProfileTab.propTypes = {
  currentUser: PropTypes.object.isRequired,
  onUserRefresh: PropTypes.func,
};

export default ProfileTab;
