import React from "react";
import PropTypes from "prop-types";
import SolidBadge from "./SolidBadge";

const birdBadgeStyle = {
  fontFamily: '"LeagueSpartan", sans-serif',
  fontSize: "1.35rem",
  fontWeight: 700,
};

const DynamicTicketBadge = ({ product, isMember }) => {
  const discount = isMember ? product?.member?.discount : product?.guest?.discount;
  const hasDiscount = Number(discount) > 0;
  const lateBird = product?.lateBird === true;
  const earlyBird = !lateBird && product?.earlyBird === true;
  if (!hasDiscount && !earlyBird && !lateBird) return null;

  return <div style={{ display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: ".5rem" }}>
    {earlyBird && <SolidBadge color="#add8e6" text="Early Bird" style={{ ...birdBadgeStyle, color: "#19251f" }} />}
    {lateBird && <SolidBadge color="#ab1c02" text="Late Bird" style={birdBadgeStyle} />}
    {hasDiscount && <SolidBadge color="#017363" text={`- ${discount}% OFF`} />}
  </div>;
};

const discountPropType = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);

DynamicTicketBadge.propTypes = {
  product: PropTypes.shape({
    member: PropTypes.shape({ discount: discountPropType }),
    guest: PropTypes.shape({ discount: discountPropType }),
    earlyBird: PropTypes.bool,
    lateBird: PropTypes.bool,
  }),
  isMember: PropTypes.bool,
};

export default DynamicTicketBadge;
