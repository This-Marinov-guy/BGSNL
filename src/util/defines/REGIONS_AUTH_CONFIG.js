import React from "react";
import { FiUser, FiUserPlus } from "react-icons/fi";

export const REGIONS_MEMBERSHIP_SPECIFICS = [
    {
        id: 1,
        title: '6-months Member',
        icon: <FiUser />,
        description: '',
        price: 6,
        itemId: 'price_1OuqmtIOw5UGbAo1V4TqMet4',
        renewItemId: 'price_1OuqmtIOw5UGbAo1V4TqMet4',
        period: 6
    },
    {
        id: 2,
        title: 'Annual Member',
        icon: <FiUserPlus />,
        description: 'Be part of the society. Pay yearly for the journey with benefits such as:',
        price: 10,
        itemId: 'price_1Otbd6IOw5UGbAo1rdJ7wXp3',
        renewItemId: 'price_1Otbd6IOw5UGbAo1rdJ7wXp3',
        period: 12
    }
]

export function findMembershipByProperty(property, value) {
    return REGIONS_MEMBERSHIP_SPECIFICS.find(item => item[property] === value);
}