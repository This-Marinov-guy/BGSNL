"use client";

import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/user";
import { isMember } from "../../util/functions/helpers";
import MemberPurchase from "./MemberPurchase";
import GuestPurchase from "./GuestPurchase";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";

const PurchaseTicket = ({ initialEvent = null }) => {
  const user = useSelector(selectUser);

  // Restore the cookie session before mounting a checkout or starting its requests.
  if (!user.authInitialized) return <HeaderLoadingError />;

  return isMember(user) ? (
    <MemberPurchase initialEvent={initialEvent} />
  ) : (
    <GuestPurchase initialEvent={initialEvent} />
  );
};

PurchaseTicket.propTypes = {
  initialEvent: PropTypes.object,
};

export default PurchaseTicket;
