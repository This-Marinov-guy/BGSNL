import React from "react";
import PropTypes from "prop-types";

const SolidBadge = ({ color, text, className, style }) => {
  return (
    <div
      style={{ backgroundColor: color, ...style }}
      className={`badge${className ? ` ${className}` : ""}`}
    >
      <small>{text}</small>
    </div>
  );
};

export default SolidBadge;

SolidBadge.propTypes = {
  color: PropTypes.string,
  text: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
};
