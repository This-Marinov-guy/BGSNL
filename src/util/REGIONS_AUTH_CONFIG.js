import React from "react";
import { FiUser, FiUserPlus } from "react-icons/fi";

export const REGIONS_MEMBERSHIP = ['groningen', 'rotterdam']

export const REGIONS_MEMBERSHIP_SPECIFICS = {
    groningen: [
        {
            title: 'Member',
            icon : <FiUser />,
            description: '',
            price: 10,
            itemId: 'price_1NWLoYIOw5UGbAo1ICuS4KH8',
            renewItemId: 'price_1N0LQAIOw5UGbAo1rbWOq5m1',
            period: 1
        }
    ],
    rotterdam : [
        {
            title: 'Member',
            icon : <FiUser />,
            description: '',
            price: 4,
            itemId: 'price_1OdafpIOw5UGbAo1Y4HuTkNV',
            renewItemId: 'price_1OCHpeIOw5UGbAo1Zvzcw9bK',
            period: 1
        },
        {
            title: 'Long-Term Member',
            icon : <FiUserPlus />,
            description: 'Be part of the society. You get a 3-year journey with benefits such as:',
            price: 10,
            itemId: 'price_1OdzVCIOw5UGbAo1AUlL7CZ1',
            renewItemId: 'price_1OCHs2IOw5UGbAo1MIrF1BFf',
            period: 3
        }
    ]
}  