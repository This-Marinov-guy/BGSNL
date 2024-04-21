import React from "react";
import { Field, ErrorMessage } from "formik";

// add ticket_link : '*link for the tickets' for outside ticket purchase
export const SOCIETY_EVENTS = {
  groningen: [{
    is_tickets_closed: true,
    subEvent: {
      description: 'Choose your workshop. All can be purchased at one and if you are a member - you pay 3 and get 1 for FREE',
      links: [
        {
          name: 'All',
          href: '/Dancing Bears Workshop Full Access'
        },
        {
          name: 'I',
          href: '/Dancing Bears Workshop I'
        },
        {
          name: 'II',
          href: '/Dancing Bears Workshop II'
        },
        {
          name: 'III',
          href: '/Dancing Bears Workshop III'
        },
        {
          name: 'IV',
          href: '/Dancing Bears Workshop IV'
        }
      ]
    },
    membersOnly: false,
    visible: true,
    title: "Dancing Bears Workshop",
    // newTitle: 'Bulgarian Dinner',
    description: "Level up your dancing and your spirit",
    bgImage: "24",
    date: "20 April - 18 May",
    time: "Check poster",
    ticketTimer: '2025-04-19T19:00:00',
    ticketLimit: 25,
    // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    // correctedDate: "",
    // correctedTime: "",
    where: `ACLO`,
    entry: "3 (12 for all)",
    memberEntry: "3 (9 for all)",
    including: [],
    // ticket_link: '',
    price_id: 'price_1P3LppIOw5UGbAo1JUEg2cGH',
    memberPrice_id: 'price_1P3Lq2IOw5UGbAo1XhNsXDSL',
    activeMemberPrice_id: 'price_1P3LqIIOw5UGbAo1TMYm5nVR',
    freePass: ['vlady1002@abv.bg'],
    marketingInputs: false,
    extraInputs: false,
    text: ['Come learn traditional Bulgarian dances with us throughout this workshop series!',
      `These events are for everyone, whether you have never joined the horo or you lead it. Our teachers will guide the workshops and ensure a good atmosphere for everyone!
  `,
      `We will start from the classics like byala roza and work our way up the skill ladder. `,
      `All the workshops will be hosted at the ACLO in the late afternoon:`,
      `20.04 at 17:00-19:00`,
      `28.04 at 16:00-18:00`,
      `11.05 at 17:00-18:00`,
      `18.05 at 17:00-18:00`,
      `Tickets are €3 and number of participants is limited so make sure you secure your spot on time!
Special offer for members 3+1. Buy your 4 horo workshop tickets for €9.
`,
      `We cannot wait to dance with you!`],
    ticket_img: '/assets/images/tickets/groningen/ticket-37.png',
    images: ["/assets/images/events/groningen/dancing-bears/1"],
    thumbnail: "/assets/images/portfolio/groningen/portfolio-37",
  },
  {
    is_tickets_closed: true,
    membersOnly: false,
    visible: true,
    title: "Spring Gala",
    // newTitle: 'Bulgarian Dinner',
    description: "event for the stars",
    bgImage: "19",
    date: "24th May",
    time: "17:30",
    ticketTimer: '2024-05-24T20:00:00',
    ticketLimit: 0,
    // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    // correctedDate: "",
    // correctedTime: "",
    where: `StadsLab Groningen`,
    entry: "TBD",
    memberEntry: "TBD",
    including: [],
    // ticket_link: '',
    price_id: 'price_1OxDKaIOw5UGbAo11AgKHaOn',
    memberPrice_id: 'price_1OxDKoIOw5UGbAo1rGeyskw9',
    activeMemberPrice_id: 'price_1OxDLCIOw5UGbAo1rfshOiJZ',
    freePass: ['vlady1002@abv.bg'],
    marketingInputs: false,
    extraInputs: false,
    text: [
      `The long awaited moment approaches. We are thrilled to announce the first Spring Gala of BGSG!
        `,
      `Save the date because this year the 24th of May is not only the national holiday of Bulgarian literacy, but a local holiday celebrating the achievements of Bulgarian Society Groningen and Leeuwarden and its growing network and promoting Bulgarian artists and musicians in the Netherlands.

`,
      ` The program consists of 3 key focuses: Art, Music and Networking. We are also preparing some exciting surprises!
`,
      `More info coming soon! ⏳

`,
      `Ticket sale opens in April so stay tuned!
        `,
    ],
    ticket_img: '/assets/images/tickets/leeuwarden/ticket-6.jpg',
    images: ["/assets/images/portfolio/groningen/portfolio-30"],
    thumbnail: "/assets/images/portfolio/groningen/portfolio-30",
  },
  {
    subEvent: {
      description: 'You can purchase a workshop independently as well',
      links: [
        // {
        //   name: 'All',
        //   href: '/Dancing Bears Workshop Full Access'
        // },
        {
          name: 'I',
          href: '/Dancing Bears Workshop I'
        },
        {
          name: 'II',
          href: '/Dancing Bears Workshop II'
        },
        {
          name: 'III',
          href: '/Dancing Bears Workshop III'
        },
        {
          name: 'IV',
          href: '/Dancing Bears Workshop IV'
        }
      ]
    },
    membersOnly: false,
    visible: false,
    title: "Dancing Bears Workshop Full Access",
    // newTitle: 'Bulgarian Dinner',
    description: "Level up your dancing and your spirit",
    bgImage: "24",
    date: "20 April - 18 May",
    time: "Check poster",
    ticketTimer: '2025-04-19T19:00:00',
    ticketLimit: 25,
    // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    // correctedDate: "",
    // correctedTime: "",
    where: `ACLO`,
    entry: "12",
    memberEntry: "9",
    including: [],
    // ticket_link: '',
    price_id: 'price_1P3rxnIOw5UGbAo1RHIb6kll',
    memberPrice_id: 'price_1P3ry2IOw5UGbAo1eDsRKQGE',
    activeMemberPrice_id: 'price_1P3ry2IOw5UGbAo1eDsRKQGE',
    freePass: ['vlady1002@abv.bg'],
    marketingInputs: false,
    extraInputs: false,
    text: ['Come learn traditional Bulgarian dances with us throughout this workshop series!',
      `These events are for everyone, whether you have never joined the horo or you lead it. Our teachers will guide the workshops and ensure a good atmosphere for everyone!
  `,
      `We will start from the classics like byala roza and work our way up the skill ladder. `,
      `All the workshops will be hosted at the ACLO in the late afternoon:`,
      `20.04 at 17:00-19:00`,
      `28.04 at 16:00-18:00`,
      `11.05 at 17:00-18:00`,
      `18.05 at 17:00-18:00`,
      `Tickets are €3 and number of participants is limited so make sure you secure your spot on time by choosing from the selection below!
Special offer for members 3+1. Buy your 4 horo workshop tickets for €9.
`,
      `We cannot wait to dance with you!`],
    ticket_img: '/assets/images/tickets/groningen/ticket-37.png',
    images: ["/assets/images/events/groningen/dancing-bears/1"],
    thumbnail: "/assets/images/portfolio/groningen/portfolio-37",
  },
  {
    subEvent: {
      description: 'You can purchase a workshop independently as well',
      links: [
        {
          name: 'All',
          href: '/Dancing Bears Workshop Full Access'
        },
        // {
        //   name: 'I',
        //   href: '/Dancing Bears Workshop I'
        // },
        {
          name: 'II',
          href: '/Dancing Bears Workshop II'
        },
        {
          name: 'III',
          href: '/Dancing Bears Workshop III'
        },
        {
          name: 'IV',
          href: '/Dancing Bears Workshop IV'
        }
      ]
    },
    membersOnly: false,
    visible: false,
    title: "Dancing Bears Workshop I",
    // newTitle: 'Bulgarian Dinner',
    description: "Level up your dancing and your spirit",
    bgImage: "24",
    date: "20 April",
    time: "17:00",
    ticketTimer: '2025-04-19T19:00:00',
    ticketLimit: 25,
    // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    // correctedDate: "",
    // correctedTime: "",
    where: `ACLO`,
    entry: "3",
    memberEntry: "3",
    including: [],
    // ticket_link: '',
    price_id: 'price_1P3rxVIOw5UGbAo1lIGdbJSE',
    memberPrice_id: 'price_1P3rxVIOw5UGbAo1lIGdbJSE',
    activeMemberPrice_id: 'price_1P3rxVIOw5UGbAo1lIGdbJSE',
    freePass: ['vlady1002@abv.bg'],
    marketingInputs: false,
    extraInputs: false,
    text: ['Come learn traditional Bulgarian dances with us throughout this workshop series!',
      `These events are for everyone, whether you have never joined the horo or you lead it. Our teachers will guide the workshops and ensure a good atmosphere for everyone!
  `,
      `We will start from the classics like byala roza and work our way up the skill ladder. `,
      `All the workshops will be hosted at the ACLO in the late afternoon:`,
      `20.04 at 17:00-19:00`,
      `Tickets are €3 and number of participants is limited so make sure you secure your spot on time!
Special offer for members 3+1. Buy your 4 horo workshop tickets for €9.
`,
      `We cannot wait to dance with you!`],
    ticket_img: '/assets/images/tickets/groningen/ticket-37-1.png',
    images: ["/assets/images/events/groningen/dancing-bears/1"],
    thumbnail: "/assets/images/portfolio/groningen/portfolio-37",
  },
  {
    subEvent: {
      description: 'You can purchase a workshop independently as well',
      links: [
        {
          name: 'All',
          href: '/Dancing Bears Workshop Full Access'
        },
        {
          name: 'I',
          href: '/Dancing Bears Workshop I'
        },
        // {
        //   name: 'II',
        //   href: '/Dancing Bears Workshop II'
        // },
        {
          name: 'III',
          href: '/Dancing Bears Workshop III'
        },
        {
          name: 'IV',
          href: '/Dancing Bears Workshop IV'
        }
      ]
    },
    membersOnly: false,
    visible: false,
    title: "Dancing Bears Workshop II",
    // newTitle: 'Bulgarian Dinner',
    description: "Level up your dancing and your spirit",
    bgImage: "24",
    date: "28 April",
    time: "16:00",
    ticketTimer: '2025-04-19T19:00:00',
    ticketLimit: 25,
    // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    // correctedDate: "",
    // correctedTime: "",
    where: `ACLO`,
    entry: "3",
    memberEntry: "3",
    including: [],
    // ticket_link: '',
    price_id: 'price_1P3rxVIOw5UGbAo1lIGdbJSE',
    memberPrice_id: 'price_1P3rxVIOw5UGbAo1lIGdbJSE',
    activeMemberPrice_id: 'price_1P3rxVIOw5UGbAo1lIGdbJSE',
    freePass: ['vlady1002@abv.bg'],
    marketingInputs: false,
    extraInputs: false,
    text: ['Come learn traditional Bulgarian dances with us throughout this workshop series!',
      `These events are for everyone, whether you have never joined the horo or you lead it. Our teachers will guide the workshops and ensure a good atmosphere for everyone!
  `,
      `We will start from the classics like byala roza and work our way up the skill ladder. `,
      `All the workshops will be hosted at the ACLO in the late afternoon:`,
      `28.04 at 16:00-18:00`,
      `Tickets are €3 and number of participants is limited so make sure you secure your spot on time!
Special offer for members 3+1. Buy your 4 horo workshop tickets for €9.
`,
      `We cannot wait to dance with you!`],
    ticket_img: '/assets/images/tickets/groningen/ticket-37-2.png',
    images: ["/assets/images/events/groningen/dancing-bears/1"],
    thumbnail: "/assets/images/portfolio/groningen/portfolio-37",
  },
  {
    subEvent: {
      description: 'You can purchase a workshop independently as well',
      links: [
        {
          name: 'All',
          href: '/Dancing Bears Workshop Full Access'
        },
        {
          name: 'I',
          href: '/Dancing Bears Workshop I'
        },
        {
          name: 'II',
          href: '/Dancing Bears Workshop II'
        },
        // {
        //   name: 'III',
        //   href: '/Dancing Bears Workshop III'
        // },
        {
          name: 'IV',
          href: '/Dancing Bears Workshop IV'
        }
      ]
    },
    membersOnly: false,
    visible: false,
    title: "Dancing Bears Workshop III",
    // newTitle: 'Bulgarian Dinner',
    description: "Level up your dancing and your spirit",
    bgImage: "24",
    date: "11 May",
    time: "17:00",
    ticketTimer: '2025-04-19T19:00:00',
    ticketLimit: 25,
    // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    // correctedDate: "",
    // correctedTime: "",
    where: `ACLO`,
    entry: "3",
    memberEntry: "3",
    including: [],
    // ticket_link: '',
    price_id: 'price_1P3rxVIOw5UGbAo1lIGdbJSE',
    memberPrice_id: 'price_1P3rxVIOw5UGbAo1lIGdbJSE',
    activeMemberPrice_id: 'price_1P3rxVIOw5UGbAo1lIGdbJSE',
    freePass: ['vlady1002@abv.bg'],
    marketingInputs: false,
    extraInputs: false,
    text: ['Come learn traditional Bulgarian dances with us throughout this workshop series!',
      `These events are for everyone, whether you have never joined the horo or you lead it. Our teachers will guide the workshops and ensure a good atmosphere for everyone!
  `,
      `We will start from the classics like byala roza and work our way up the skill ladder. `,
      `All the workshops will be hosted at the ACLO in the late afternoon:`,
      `11.05 at 17:00-18:00`,
      `Tickets are €3 and number of participants is limited so make sure you secure your spot on time!
Special offer for members 3+1. Buy your 4 horo workshop tickets for €9.
`,
      `We cannot wait to dance with you!`],
    ticket_img: '/assets/images/tickets/groningen/ticket-37-3.png',
    images: ["/assets/images/events/groningen/dancing-bears/1"],
    thumbnail: "/assets/images/portfolio/groningen/portfolio-37",
  },
  {
    subEvent: {
      description: 'You can purchase a workshop independently as well',
      links: [
        {
          name: 'All',
          href: '/Dancing Bears Workshop Full Access'
        },
        {
          name: 'I',
          href: '/Dancing Bears Workshop I'
        },
        {
          name: 'II',
          href: '/Dancing Bears Workshop II'
        },
        {
          name: 'III',
          href: '/Dancing Bears Workshop III'
        },
        // {
        //   name: 'IV',
        //   href: '/Dancing Bears Workshop IV'
        // }
      ]
    },
    membersOnly: false,
    visible: false,
    title: "Dancing Bears Workshop IV",
    // newTitle: 'Bulgarian Dinner',
    description: "Level up your dancing and your spirit",
    bgImage: "24",
    date: "18 May",
    time: "17:00",
    ticketTimer: '2025-04-19T19:00:00',
    ticketLimit: 25,
    // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    // correctedDate: "",
    // correctedTime: "",
    where: `ACLO`,
    entry: "3",
    memberEntry: "3",
    including: [],
    // ticket_link: '',
    price_id: 'price_1P3rxVIOw5UGbAo1lIGdbJSE',
    memberPrice_id: 'price_1P3rxVIOw5UGbAo1lIGdbJSE',
    activeMemberPrice_id: 'price_1P3rxVIOw5UGbAo1lIGdbJSE',
    freePass: ['vlady1002@abv.bg'],
    marketingInputs: false,
    extraInputs: false,
    text: ['Come learn traditional Bulgarian dances with us throughout this workshop series!',
      `These events are for everyone, whether you have never joined the horo or you lead it. Our teachers will guide the workshops and ensure a good atmosphere for everyone!
  `,
      `We will start from the classics like byala roza and work our way up the skill ladder. `,
      `All the workshops will be hosted at the ACLO in the late afternoon:`,
      `18.05 at 17:00-18:00`,
      `Tickets are €3 and number of participants is limited so make sure you secure your spot on time!
Special offer for members 3+1. Buy your 4 horo workshop tickets for €9.
`,
      `We cannot wait to dance with you!`],
    ticket_img: '/assets/images/tickets/groningen/ticket-37-4.png',
    images: ["/assets/images/events/groningen/dancing-bears/1"],
    thumbnail: "/assets/images/portfolio/groningen/portfolio-37",
  },
  ],
  rotterdam: [

  ],
  leeuwarden: [
    {
      is_tickets_closed: true,
      membersOnly: false,
      visible: true,
      title: "Spring Gala",
      // newTitle: 'Bulgarian Dinner',
      description: "event for the stars",
      bgImage: "19",
      date: "24th May",
      time: "17:30",
      ticketTimer: '2024-05-24T20:00:00',
      ticketLimit: 0,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      // correctedDate: "",
      // correctedTime: "",
      where: `StadsLab Groningen`,
      entry: "TBD",
      memberEntry: "TBD",
      including: [],
      // ticket_link: '',
      price_id: 'price_1OxDKaIOw5UGbAo11AgKHaOn',
      memberPrice_id: 'price_1OxDKoIOw5UGbAo1rGeyskw9',
      activeMemberPrice_id: 'price_1OxDLCIOw5UGbAo1rfshOiJZ',
      freePass: ['vlady1002@abv.bg'],
      marketingInputs: false,
      extraInputs: false,
      text: [
        `The long awaited moment approaches. We are thrilled to announce the first Spring Gala of BGSG!
        `,
        `Save the date because this year the 24th of May is not only the national holiday of Bulgarian literacy, but a local holiday celebrating the achievements of Bulgarian Society Groningen and Leeuwarden and its growing network and promoting Bulgarian artists and musicians in the Netherlands.

`,
        ` The program consists of 3 key focuses: Art, Music and Networking. We are also preparing some exciting surprises!
`,
        `More info coming soon! ⏳

`,
        `Ticket sale opens in April so stay tuned!
        `,
      ],
      ticket_img: '/assets/images/tickets/leeuwarden/ticket-6.jpg',
      images: ["/assets/images/portfolio/groningen/portfolio-30"],
      thumbnail: "/assets/images/portfolio/groningen/portfolio-30",
    },
  ],
  breda: [
    {
      membersOnly: false,
      visible: true,
      title: "Movie Night",
      // newTitle: 'Bulgarian Dinner',
      description: "let's enjoy some Bulgarian culture",
      bgImage: "18",
      date: "25th April",
      time: "18:30",
      ticketTimer: '2024-04-25T19:30:00',
      ticketLimit: 250,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      // correctedDate: "",
      // correctedTime: "",
      where: `BUas, Frontier 1.016`,
      isMemberFree: true,
      entry: 2.50,
      memberEntry: 'Free',
      including: ['(+ drink and popcorns)', '(+ drink and popcorns)'],
      // ticket_link: 'https://www.tickettailor.com/events/hellenicassociationgroningen/1156915',
      price_id: 'price_1P7uhsIOw5UGbAo1fvnUj3yw',
      memberPrice_id: 'price_1P7uhsIOw5UGbAo1fvnUj3yw',
      activeMemberPrice_id: 'price_1P7uhsIOw5UGbAo1fvnUj3yw',
      freePass: ['vlady1002@abv.bg'],
      marketingInputs: false,
      extraInputs: false,
      text: [
        `Dive into Bulgarian cinema with us for a special movie night featuring 'Attraction' - a romantic comedy movie with one of the most popular Bulgarian actors!🎞️
        `,
        `❗️English subtitles provided, so everyone is welcome to join us for an evening of cinematic experience and cultural exploration.
        `,
        `The price includes drink and popcorns🍿!
        `
      ],
      ticket_img: '/assets/images/tickets/breda/ticket-7.png',
      images: ["/assets/images/portfolio/breda/portfolio-7"],
      thumbnail: "/assets/images/portfolio/breda/portfolio-7",
    },
  ],
  maastricht: [

  ],
  amsterdam: [

  ]
}