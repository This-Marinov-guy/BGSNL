import React from "react";

const DiscountBadge = ({ color, text }) => {
  return (
    <div style={{ backgroundColor: color, border: color }} className="discount-badge">
      <small>{text}</small>
    </div>
  );
};

export default DiscountBadge;
