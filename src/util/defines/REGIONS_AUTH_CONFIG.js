import React from "react";
import { FiUser, FiUserPlus } from "react-icons/fi";
import { MEMBERSHIP_PRICES_IDS } from "./PRICES";

export const REGIONS_MEMBERSHIP_SPECIFICS = [
  {
    id: 1,
    title: "6-months Member",
    description: "Support a great cause and enjoy a memorable experience",
    icon: <FiUser />,
    price: 6,
    itemId: MEMBERSHIP_PRICES_IDS["6-months Member"].start,
    renewItemId: MEMBERSHIP_PRICES_IDS["6-months Member"].renewal,
    period: 6,
  },
  {
    id: 2,
    title: "Annual Member",
    description: "Support a great cause and enjoy a memorable experience",
    label: {
      color: "#e5b80b",
      text: "Best Value",
    },
    borderColor: "#e5b80b",
    icon: <FiUserPlus />,
    price: 10,
    itemId: MEMBERSHIP_PRICES_IDS["12-months Member"].start,
    renewItemId: MEMBERSHIP_PRICES_IDS["12-months Member"].renewal,
    period: 12,
  },
];

export function findMembershipByProperty(property, value) {
  return REGIONS_MEMBERSHIP_SPECIFICS.find((item) => item[property] === value);
}
