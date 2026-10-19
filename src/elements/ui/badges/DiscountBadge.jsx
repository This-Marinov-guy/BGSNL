import React from "react";
import PropTypes from "prop-types";

const DiscountBadge = ({ color, text }) => {
  return (
    <div style={{ backgroundColor: color }} className="badge discount-badge">
      <small>{text}</small>
    </div>
  );
};

export default DiscountBadge;

DiscountBadge.propTypes = {
  color: PropTypes.string,
  text: PropTypes.node.isRequired,
};
