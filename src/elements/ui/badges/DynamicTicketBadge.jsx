import React from "react";
import PropTypes from "prop-types";
import SolidBadge from "./SolidBadge";

const birdBadgeStyle = {
  fontFamily: '"LeagueSpartan", sans-serif',
  fontSize: "1.35rem",
  fontWeight: 700,
};

const DynamicTicketBadge = ({ product, isMember }) => {
  if (isMember && product?.member?.discount) {
    return (
      <SolidBadge color="#017363" text={`- ${product.member.discount}% OFF`} />
    );
  } else if (!isMember && product?.guest?.discount) {
    return (
      <SolidBadge color="#017363" text={`- ${product.guest.discount}% OFF`} />
    );
  } else if (product?.earlyBird === true) {
    return (
      <SolidBadge
        color="#add8e6"
        text="Early Bird"
        style={{ ...birdBadgeStyle, color: "#19251f" }}
      />
    );
  } else if (product?.lateBird === true) {
    return <SolidBadge color="#ab1c02" text="Late Bird" style={birdBadgeStyle} />;
  } else {
    return null;
  }
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
