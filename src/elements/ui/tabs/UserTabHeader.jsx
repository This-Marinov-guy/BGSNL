import PropTypes from "prop-types";

const UserTabHeader = ({ title, children, className = "" }) => (
  <header className={`tab-header ${className}`}>
    <h1 className="tab-title archive">{title}</h1>
    {children}
  </header>
);

UserTabHeader.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default UserTabHeader;
