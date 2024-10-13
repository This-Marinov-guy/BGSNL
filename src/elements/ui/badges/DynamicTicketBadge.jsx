import React from "react";
import SolidBadge from "./SolidBadge";

const DynamicTicketBadge = ({ product }) => {
  if (product?.earlyBird) {
    return <SolidBadge color="#add8e6" text="Early Bird" />;
  } else if (product?.earlyBird) {
    <SolidBadge color="#ab1c02" text="Late Bird" />;
  } else {
    return null;
  }
};

export default DynamicTicketBadge;
