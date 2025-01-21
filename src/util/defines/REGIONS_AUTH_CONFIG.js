import React from "react";
import { FiUser, FiUserPlus } from "react-icons/fi";
import { MEMBERSHIP_PRICES_IDS } from "./PRICES";

export const REGIONS_MEMBERSHIP_SPECIFICS = [
  {
    id: 1,
    title: "6-months Member",
    icon: <FiUser />,
    description: "",
    price: 6,
    itemId: MEMBERSHIP_PRICES_IDS["6-months Member"].start,
    renewItemId: MEMBERSHIP_PRICES_IDS["6-months Member"].renewal,
    period: 6,
  },
  {
    id: 2,
    title: "Annual Member",
    icon: <FiUserPlus />,
    description:
      "Be part of the society. Pay yearly for the journey with benefits such as:",
    price: 10,
    itemId: MEMBERSHIP_PRICES_IDS["12-months Member"].start,
    renewItemId: MEMBERSHIP_PRICES_IDS["12-months Member"].renewal,
    period: 12,
  },
];

export function findMembershipByProperty(property, value) {
    return REGIONS_MEMBERSHIP_SPECIFICS.find(item => item[property] === value);
}