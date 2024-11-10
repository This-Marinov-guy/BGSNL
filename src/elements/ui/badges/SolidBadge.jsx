import React from "react";

const SolidBadge = ({ color, text, className, style }) => {
  return (
    <div
      style={{ backgroundColor: color, border: color, ...style }}
      className={"badge " + className}
    >
      <small>{text}</small>
    </div>
  );
};

export default SolidBadge;