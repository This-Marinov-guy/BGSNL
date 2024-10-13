import React from "react";

const SolidBadge = ({ color, text }) => {
  return (
    <div
      style={{ backgroundColor: color, border: color }}
      className="badge"
    >
      <small>{text}</small>
    </div>
  );
};

export default SolidBadge;