import {
  IconlyChessKing3D,
  IconlyChessKnight3D,
  IconlyChessQueen3D,
  IconlyChessRook3D,
} from "@/elements/ui/icons/IconlyIcons";

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
        text: "Alumni Tree entry",
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
    icon: <IconlyChessKnight3D className="alumni-tier-chess-icon" />,
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
        text: "Alumni Tree upper entry",
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
    icon: <IconlyChessRook3D className="alumni-tier-chess-icon" />,
    price: 5,
    itemId: "price_1SGEBBAShinXgMFZuC6fiOqf",
    renewItemId: "price_1SGEBBAShinXgMFZuC6fiOqf",
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
        text: "Alumni Tree top entry + personal quote",
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
    icon: <IconlyChessQueen3D className="alumni-tier-chess-icon" />,
    price: 7,
    itemId: "price_1SGEFLAShinXgMFZcWsbLjeE",
    renewItemId: "price_1SGEFLAShinXgMFZcWsbLjeE",
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
        text: "Alumni Tree top entry + personal quote",
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
    icon: <IconlyChessKing3D className="alumni-tier-chess-icon" />,
    price: "10",
    itemId: "price_1SGEFoAShinXgMFZZzo95PeT",
    renewItemId: "price_1SGEFoAShinXgMFZZzo95PeT",
    period: 1,
  },
];
