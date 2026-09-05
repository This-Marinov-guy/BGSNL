import PropTypes from "prop-types";

const UserTabHeader = ({ title }) => (
  <header className="tab-header">
    <h1 className="tab-title archive">{title}</h1>
  </header>
);

UserTabHeader.propTypes = {
  title: PropTypes.string.isRequired,
};

export default UserTabHeader;
