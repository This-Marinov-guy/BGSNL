import React from "react";
import { FiUser, FiUserPlus } from "react-icons/fi";

export const REGIONS_MEMBERSHIP = ['groningen', 'rotterdam', 'amsterdam']

export const REGIONS_MEMBERSHIP_SPECIFICS = [
    {
        title: 'Semi-Annual Member',
        icon: <FiUser />,
        description: '',
        price: 6,
        itemId: 'price_1OuqmtIOw5UGbAo1V4TqMet4',
        renewItemId: 'price_1Otbd6IOw5UGbAo1rdJ7wXp3',
        period: 6
    },
    {
        title: 'Annual Member',
        icon: <FiUserPlus />,
        description: 'Be part of the society. Pay yearly for the journey with benefits such as:',
        price: 10,
        itemId: 'price_1OdzVCIOw5UGbAo1AUlL7CZ1',
        renewItemId: 'price_1Otbd6IOw5UGbAo1rdJ7wXp3',
        period: 12
    }
]
