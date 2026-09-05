import PropTypes from "prop-types";
import UserCard from "../cards/UserCard";

/*
 * The profile summary panel (avatar + name + role/tier) that used to sit above
 * the card is gone: the sidebar already shows all three, so it was duplicating
 * them on the one tab where the sidebar is guaranteed to be visible. The
 * birthday hat it carried moved onto the sidebar avatar, which is now the only
 * profile image on the page and also hosts the edit affordance.
 */
const UserProfileHeader = ({ currentUser, onUserRefresh }) => {
  return (
    <section className="user-profile-header">
      <div className="profile-header-info">
        <UserCard user={currentUser} onUserRefresh={onUserRefresh} />
      </div>
    </section>
  );
};

UserProfileHeader.propTypes = {
  currentUser: PropTypes.object.isRequired,
  onUserRefresh: PropTypes.func,
};

export default UserProfileHeader;
