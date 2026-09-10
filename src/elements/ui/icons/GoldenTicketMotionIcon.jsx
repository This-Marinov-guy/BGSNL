"use client";

import PropTypes from "prop-types";
import Lottie from "react-lottie-player";
import goldenTicketMotion from "@assets/images/svg/motion/golden-star-ticket.json";

const GoldenTicketMotionIcon = ({ className = "" }) => (
  <Lottie
    aria-hidden="true"
    animationData={goldenTicketMotion}
    className={`ticket-motion-icon golden-ticket-motion-icon${
      className ? ` ${className}` : ""
    }`}
    loop
    play
  />
);

GoldenTicketMotionIcon.propTypes = {
  className: PropTypes.string,
};

export default GoldenTicketMotionIcon;
