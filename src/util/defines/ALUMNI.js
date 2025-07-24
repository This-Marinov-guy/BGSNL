import React from "react";
import { MEMBERSHIP_PRICES_IDS } from "./PRICES";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChessRook,
  faHome,
  faUser,
  faChessPawn,
  faChessBishop,
  faChessKing,
} from "@fortawesome/free-solid-svg-icons";

export const ALUMNI_MEMBERSHIP_SPECIFICS = [
  {
    id: 1,
    title: "Tier I",
    benefits: [
      {
        text: "Access to events",
        strike: false,
      },
      {
        text: "Account Tickets Collection",
        strike: false,
      },
      {
        text: "Hall of Fame entry",
        strike: false,
      },
      {
        text: "Discounts and Promotions",
        strike: true,
      },
      {
        text: "First Access to News and Events",
        strike: true,
      },
      {
        text: "Voting Rights in the community",
        strike: true,
      },
      {
        text: "Personalized Merchandise",
        strike: true,
      },
    ],
    icon: (
      <FontAwesomeIcon
        style={{
          fontSize: "26px",
          color: "black",
          height: "75px",
          marginLeft: "20px",
        }}
        icon={faChessPawn}
      />
    ),
    price: 5,
    itemId: MEMBERSHIP_PRICES_IDS["6-months Member"].start,
    renewItemId: MEMBERSHIP_PRICES_IDS["6-months Member"].renewal,
    period: 1,
  },
  {
    id: 2,
    title: "Tier II",
    benefits: [
      {
        text: "Access to events",
        strike: false,
      },
      {
        text: "Account Tickets Collection",
        strike: false,
      },
      {
        text: "Hall of Fame upper entry",
        strike: false,
      },
      {
        text: "Discounts and Promotions",
        strike: false,
      },
      {
        text: "First Access to News and Events",
        strike: true,
      },
      {
        text: "Voting Rights in the community",
        strike: true,
      },
      {
        text: "Personalized Merchandise",
        strike: true,
      },
    ],
    icon: (
      <FontAwesomeIcon
        style={{
          fontSize: "24px",
          color: "black",
          height: "75px",
          marginLeft: "20px",
        }}
        icon={faChessBishop}
      />
    ),
    price: 14,
    itemId: MEMBERSHIP_PRICES_IDS["12-months Member"].start,
    renewItemId: MEMBERSHIP_PRICES_IDS["12-months Member"].renewal,
    period: 3,
  },
  {
    id: 3,
    title: "Tier III",
    benefits: [
      {
        text: "Access to EXCLUSIVE events",
        strike: false,
      },
      {
        text: "Account Tickets Collection",
        strike: false,
      },
      {
        text: "Hall of Fame top entry + personal quote",
        strike: false,
      },
      {
        text: "Discounts and Promotions",
        strike: false,
      },
      {
        text: "First Access to News and Events",
        strike: false,
      },
      {
        text: "Voting Rights in the community",
        strike: true,
      },
      {
        text: "Personalized Merchandise",
        strike: true,
      },
    ],
    label: {
      color: "#00acee",
      text: "Best Price",
    },
    borderColor: "#00acee",
    icon: (
      <FontAwesomeIcon
        style={{
          fontSize: "27px",
          color: "black",
          height: "75px",
          marginLeft: "20px",
        }}
        icon={faChessRook}
      />
    ),
    price: 25,
    itemId: MEMBERSHIP_PRICES_IDS["12-months Member"].start,
    renewItemId: MEMBERSHIP_PRICES_IDS["12-months Member"].renewal,
    period: 6,
  },
  {
    id: 4,
    title: "Tier IV",
    benefits: [
      {
        text: "Access to EXCLUSIVE events",
        strike: false,
      },
      {
        text: "Account Tickets Collection",
        strike: false,
      },
      {
        text: "Hall of Fame top entry + personal quote",
        strike: false,
      },
      {
        text: "Discounts and Promotions",
        strike: false,
      },
      {
        text: "First Access to News and Events",
        strike: false,
      },
      {
        text: "Voting Rights in the community",
        strike: false,
      },
      {
        text: "Personalized Merchandise",
        strike: false,
      },
    ],
    label: {
      color: "#e5b80b",
      text: "Best Value",
    },
    borderColor: "#e5b80b",
    icon: (
      <FontAwesomeIcon
        style={{
          fontSize: "30px",
          color: "black",
          height: "75px",
          marginLeft: "20px",
        }}
        icon={faChessKing}
        className="icon-chess"
      />
    ),
    price: "above 10",
    itemId: MEMBERSHIP_PRICES_IDS["12-months Member"].start,
    renewItemId: MEMBERSHIP_PRICES_IDS["12-months Member"].renewal,
    period: 1,
  },
];
