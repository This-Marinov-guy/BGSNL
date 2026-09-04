"use client";

import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/user";
import { isMember } from "../../util/functions/helpers";
import MemberPurchase from "./MemberPurchase";
import GuestPurchase from "./GuestPurchase";

/**
 * The old router picked the member or guest flow inline:
 *   isMember(user) ? <MemberPurchase /> : <GuestPurchase />
 * Membership is derived from the localStorage JWT, so the choice has to stay
 * on the client.
 */
const PurchaseTicket = ({ initialEvent = null }) => {
  const user = useSelector(selectUser);

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
