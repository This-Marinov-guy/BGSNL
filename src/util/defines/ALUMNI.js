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
        text: "Exclusive Alumni Events",
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
        text: "Access to private channel",
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
    price: 3,
    itemId: "price_1Rx1XKAShinXgMFZqWsg4V0D",
    renewItemId: "price_1Rx1XKAShinXgMFZqWsg4V0D",
    period: 1,
  },
  {
    id: 2,
    title: "Tier II",
    benefits: [
      {
        text: "Exclusive Alumni Events",
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
        text: "Access to private channel",
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
    price: 5,
    itemId: "price_1Rx1XYAShinXgMFZSTH9nEvo",
    renewItemId: "price_1Rx1XYAShinXgMFZSTH9nEvo",
    period: 1,
  },
  {
    id: 3,
    title: "Tier III",
    benefits: [
      {
        text: "Exclusive Alumni Events",
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
        text: "Access to private channel",
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
    // label: {
    //   color: "#00acee",
    //   text: "Best Price",
    // },
    // borderColor: "#00acee",
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
    price: 7,
    itemId: "price_1Rx1Y7AShinXgMFZzqTEzqHz",
    renewItemId: "price_1Rx1Y7AShinXgMFZzqTEzqHz",
    period: 1,
  },
  {
    id: 4,
    title: "Tier IV",
    benefits: [
      {
        text: "Exclusive Alumni Events",
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
        text: "Access to private channel",
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
    price: "10",
    itemId: "price_1Rx1YOAShinXgMFZITzXRuam",
    renewItemId: "price_1Rx1YOAShinXgMFZITzXRuam",
    period: 1,
  },
];
