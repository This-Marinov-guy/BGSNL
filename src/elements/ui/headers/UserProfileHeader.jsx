import React from "react";
import PropTypes from "prop-types";
import { LazyLoadImage } from "react-lazy-load-image-component";
import UserCard from "../cards/UserCard";

const UserProfileHeader = ({ currentUser, hasBirthday }) => {
  return (
    <div className="user-profile-header">
      <div>
        {hasBirthday && (
          <img
            src="/assets/images/special/birthday-hat.png"
            alt="hat"
            className="birthday-hat"
          />
        )}
        <LazyLoadImage
          src={currentUser.image}
          alt="profile"
          className="profile-image"
        />
      </div>
      <div className="profile-header-info">
        <UserCard user={currentUser} />
      </div>
    </div>
  );
};

UserProfileHeader.propTypes = {
  currentUser: PropTypes.object.isRequired,
  hasBirthday: PropTypes.bool,
};

export default UserProfileHeader;
