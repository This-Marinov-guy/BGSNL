import React from "react";
import PropTypes from "prop-types";
import UserProfileHeader from "../headers/UserProfileHeader";

const ProfileTab = ({ currentUser, hasBirthday, onUserRefresh }) => {
  return (
    <div className="tab-content-wrapper">
      <div className="tab-header">
        <h2>My Profile Details</h2>
        <p>View and manage your personal information, community links, and professional documents.</p>
      </div>
      <div className="tab-body">
        <UserProfileHeader
          currentUser={currentUser}
          hasBirthday={hasBirthday}
          onUserRefresh={onUserRefresh}
        />
      </div>
    </div>
  );
};

ProfileTab.propTypes = {
  currentUser: PropTypes.object.isRequired,
  hasBirthday: PropTypes.bool,
  onUserRefresh: PropTypes.func,
};

export default ProfileTab;
