"use client";

import React from "react";
import PropTypes from "prop-types";
import Lottie from "react-lottie-player";
import ticketMotion from "@assets/images/svg/motion/ticket.json";

const TicketMotionIcon = ({ className = "" }) => (
  <Lottie
    animationData={ticketMotion}
    className={`ticket-motion-icon${className ? ` ${className}` : ""}`}
    loop
    play
  />
);

TicketMotionIcon.propTypes = {
  className: PropTypes.string,
};

export default TicketMotionIcon;
