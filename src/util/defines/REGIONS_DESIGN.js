import React from "react";
import {
  FaInstagram,
  FaFlickr,
  FaLinkedinIn,
  FaLinkedin,
  FaFacebookF,
  FaMailBulk,
  FaDollarSign,
} from "react-icons/fa";

export const BG_INDEX = 23;

export const REGIONS = [
  "amsterdam",
  "breda",
  "eindhoven",
  "groningen",
  "leiden_hague",
  "leeuwarden",
  "maastricht",
  "rotterdam",
];

export const REGION_MAIN_COLOR = {
  groningen: "#f92820",
  rotterdam: "#f92820",
  leeuwarden: "#ffbd59",
  breda: "#FF8F47",
  amsterdam: "#014CB2",
  maastricht: "#FBBF54",
  eindhoven: "#FF914D",
  leiden_hague: "#9ea703",
};

export const REGION_SECOND_COLOR = {
  groningen: "#017363",
  rotterdam: "#004AB0",
  leeuwarden: "#ff914d",
  breda: "#F64535",
  amsterdam: "#007862",
  maastricht: "#381096",
  eindhoven: "#24632D",
  leiden_hague: "#034189",
};

export const REGION_EMAIL = {
  netherlands: "info@bulgariansociety.nl",
  support: "bgsn.tech.nl@gmail.com",
  groningen: "bulgariansociety.gro@gmail.com",
  rotterdam: "bulgariansociety.rtm@gmail.com",
  leeuwarden: "bulgariansociety.lwd@gmail.com",
  breda: "bulgariansociety.bre@gmail.com",
  amsterdam: "bulgariansociety.ams@gmail.com",
  maastricht: "bulgariansociety.maas@gmail.com",
  eindhoven: "bulgariansociety.eind@gmail.com",
  leiden_hague: "bulgariansociety.leiden.hague@gmail.com",
};

export const REGION_GO_FUND_ME = {
  netherlands: "https://gofund.me/b34f3e36",
};

export const REGION_WHATSAPP = {
  groningen: "https://chat.whatsapp.com/HE2IVMvTTbs88NXWSE3Eqn",
  rotterdam: "https://chat.whatsapp.com/K5cB2MXKRw20H1vY8wwIh0",
  leeuwarden: "https://chat.whatsapp.com/D0FbY8CGCef387MiUkNUYl",
  breda: "https://chat.whatsapp.com/G8js5MarvWb8tTiRzL5RBz",
  amsterdam: "https://chat.whatsapp.com/JVSM61uSkBB61oysBvABUm",
  maastricht: "https://chat.whatsapp.com/LsKBaRLhH9K8m5TiJG1ChR",
  eindhoven: "https://chat.whatsapp.com/LkIMSw3esBECQBftaCc1YW",
  netherlands: "https://chat.whatsapp.com/LBQReQJoAyRDfdjcyV4SQ0",
  alumni: "https://chat.whatsapp.com/LrHWIHDfqX59zNtlQ1dBAR",
  leiden_hague: "https://chat.whatsapp.com/HVUyFx418j40e5rABP1aBH",
};

export const REGION_FLICKER = {
  netherlands: "https://flickr.com",
  groningen: "https://flickr.com/photos/197725983@N03/albums",
  rotterdam: "https://www.flickr.com/people/199586823@N02/",
  leeuwarden: "https://flickr.com",
  breda: "",
  amsterdam: "",
  maastricht: "",
  eindhoven: "",
  leiden_hague: "",
};

export const REGION_INSTAGRAM = {
  netherlands: "https://www.instagram.com/bulgariansociety.netherlands",
  groningen: "https://www.instagram.com/bulgariansociety.gro",
  rotterdam: "https://www.instagram.com/bulgariansociety.rtm",
  leeuwarden: "https://www.instagram.com/bulgariansociety.lwd",
  breda: "https://www.instagram.com/bulgariansociety.bred",
  amsterdam: "https://www.instagram.com/bulgariansociety.ams",
  maastricht: "https://www.instagram.com/bulgariansociety.maas",
  eindhoven: "https://www.instagram.com/bulgariansociety.ein",
  leiden_hague: "https://www.instagram.com/bulgariansociety.leidhag",
};

export const REGION_SOCIALS = {
  netherlands: [
    {
      Social: <FaInstagram />,
      link: "https://www.instagram.com/bulgariansociety.netherlands/",
    },
    {
      Social: <FaLinkedin />,
      link: "https://www.linkedin.com/company/bulgarian-society-netherlands",
    },
    {
      special: true,
      Social: <FaMailBulk />,
      link: "mailto:" + REGION_EMAIL.netherlands,
    },
    {
      special: true,
      Social: <FaDollarSign />,
      link: REGION_GO_FUND_ME.netherlands,
    },
  ],
  groningen: [
    {
      Social: <FaInstagram />,
      link: "https://www.instagram.com/bulgariansociety.gro/",
    },
    {
      Social: <FaFacebookF />,
      link: "https://www.facebook.com/profile.php?id=100090061861023",
    },
    {
      Social: <FaFlickr />,
      link: "https://flickr.com/photos/197725983@N03/albums",
    },
    {
      Social: <FaDollarSign />,
      link: REGION_GO_FUND_ME.netherlands,
    },
  ],
  leiden_hague: [
    {
      Social: <FaInstagram />,
      link: "https://www.instagram.com/bulgariansociety.leidhag",
    },
    {
      Social: <FaDollarSign />,
      link: REGION_GO_FUND_ME.netherlands,
    },
  ],
  rotterdam: [
    {
      Social: <FaInstagram />,
      link: "https://www.instagram.com/bulgariansociety.rtm/",
    },
    {
      Social: <FaLinkedin />,
      link: "  https://www.linkedin.com/company/bulgarian-society-rotterdam",
    },
    {
      Social: <FaFlickr />,
      link: "https://www.flickr.com/people/199586823@N02/",
    },
    {
      Social: <FaDollarSign />,
      link: REGION_GO_FUND_ME.netherlands,
    },
  ],
  leeuwarden: [
    {
      Social: <FaInstagram />,
      link: "https://www.instagram.com/bulgariansociety.lwd/",
    },
    {
      Social: <FaDollarSign />,
      link: REGION_GO_FUND_ME.netherlands,
    },
  ],
  breda: [
    {
      Social: <FaInstagram />,
      link: "https://www.instagram.com/bulgariansociety.bred/",
    },
    {
      Social: <FaDollarSign />,
      link: REGION_GO_FUND_ME.netherlands,
    },
  ],
  amsterdam: [
    {
      Social: <FaInstagram />,
      link: "https://www.instagram.com/bulgariansociety.ams/",
    },
    {
      Social: <FaDollarSign />,
      link: REGION_GO_FUND_ME.netherlands,
    },
  ],
  maastricht: [
    {
      Social: <FaInstagram />,
      link: "https://www.instagram.com/bulgariansociety.maas/",
    },
    {
      Social: <FaDollarSign />,
      link: REGION_GO_FUND_ME.netherlands,
    },
  ],
  eindhoven: [
    {
      Social: <FaInstagram />,
      link: "https://www.instagram.com/bulgariansociety.ein/",
    },
    {
      Social: <FaDollarSign />,
      link: REGION_GO_FUND_ME.netherlands,
    },
  ],
};

export const KVK = {
  netherlands: "95335048",
  groningen: "88233855",
  eindhoven: "95634444",
  leeuwarden: "97572861",
  amsterdam: "93582242",
  rotterdam: "93872992",
};
