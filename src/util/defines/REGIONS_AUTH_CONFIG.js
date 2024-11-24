import React from "react";
import { FiUser, FiUserPlus } from "react-icons/fi";

export const REGIONS_MEMBERSHIP_SPECIFICS = [
  {
    id: 1,
    title: "6-months Member",
    icon: <FiUser />,
    description: "",
    price: 6,
    itemId: "price_1QOg1FAShinXgMFZ1dZiQn1P",
    renewItemId: "price_1QOg1FAShinXgMFZ1dZiQn1P",
    period: 6,
  },
  {
    id: 2,
    title: "Annual Member",
    icon: <FiUserPlus />,
    description:
      "Be part of the society. Pay yearly for the journey with benefits such as:",
    price: 10,
    itemId: "price_1QOg1XAShinXgMFZyH0F4P9i",
    renewItemId: "price_1QOg1XAShinXgMFZyH0F4P9i",
    period: 12,
  },
];

export function findMembershipByProperty(property, value) {
    return REGIONS_MEMBERSHIP_SPECIFICS.find(item => item[property] === value);
}