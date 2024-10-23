import React from "react";
import SolidBadge from "./SolidBadge";

const DynamicTicketBadge = ({ product }) => {
  if (product?.earlyBird === true) {
    return <SolidBadge color="#add8e6" text="Early Bird" />;
  } else if (product?.lateBird === true) {
    return <SolidBadge color="#ab1c02" text="Late Bird" />;
  } else {
    return null;
  }
};

export default DynamicTicketBadge;
