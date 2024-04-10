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
    membersOnly: false,
    visible: true,
    title: "Board Games Part 2",
    // newTitle: 'Bulgarian Dinner',
    description: "Show your gamb... your tactical skills",
    bgImage: "3",
    date: "19th April",
    time: "18:00",
    ticketTimer: '2024-04-19T14:00:00',
    ticketLimit: 40,
    // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    // correctedDate: "",
    // correctedTime: "",
    where: `Xior Oosterhamrikkade`,
    entry: "5",
    memberEntry: "3",
    including: [],
    // ticket_link: '',
    price_id: 'price_1P3LppIOw5UGbAo1JUEg2cGH',
    memberPrice_id: 'price_1P3Lq2IOw5UGbAo1XhNsXDSL',
    activeMemberPrice_id: 'price_1P3LqIIOw5UGbAo1TMYm5nVR',
    freePass: ['vlady1002@abv.bg'],
    marketingInputs: false,
    extraInputs: false,
    text: [
      `Exciting News! Our highly anticipated Board Games Night is back for round two!  
      Get ready for an evening filled with laughter, competition, and endless fun as we gather once again to roll the dice and make some new memories!`,
      `Join us for another epic game night, whether you're a seasoned strategist or a casual player, there's something for everyone at our board games event.`
    ],
    ticket_img: '/assets/images/tickets/groningen/ticket-36.jpg',
    images: ["/assets/images/portfolio/groningen/portfolio-36"],
    thumbnail: "/assets/images/portfolio/groningen/portfolio-36",
  }, {
    membersOnly: false,
    visible: true,
    title: "A hungry bear doesn't dance",
    // newTitle: 'Bulgarian Dinner',
    description: "(no bears included)",
    bgImage: "21",
    date: "15th April",
    time: "18:30",
    ticketTimer: '2024-04-14T13:00:00',
    ticketLimit: 40,
    // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    // correctedDate: "",
    // correctedTime: "",
    where: `Tavern Doris`,
    entry: "7",
    memberEntry: "5",
    including: [],
    // ticket_link: '',
    price_id: 'price_1P1BA6IOw5UGbAo1Ew9mMR2w',
    memberPrice_id: 'price_1P1BAIIOw5UGbAo1fTUjy2pQ',
    activeMemberPrice_id: 'price_1P1BAWIOw5UGbAo1GKocdqdj',
    freePass: ['vlady1002@abv.bg'],
    marketingInputs: false,
    extraInputs: false,
    text: [
      `Come dance with us on April 15th starting 18:30 at Tavern Doris! 
      `,
      `We have prepared an evening full of Bulgarian dances for you. As you know, a hungry bear doesn’t dance so, we will have your favorite food like banitsa, snezhanka, sweets and more to keep you going through the night. Of course, drinks will also be sold at the venue to keep up the mood!

`,
      ` This event is the first of a series in which we will keep mastering our horo skills in a fun atmosphere!
`,
      `Spots are limited so buy your ticket now! €5 for members and €7 for non-members. 

`,
      `See you all on the 15th!
      `,
    ],
    ticket_img: '/assets/images/tickets/groningen/ticket-35.jpg',
    images: ["/assets/images/portfolio/groningen/portfolio-35"],
    thumbnail: "/assets/images/portfolio/groningen/portfolio-35",
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
    time: "17:00",
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
    {
      membersOnly: false,
      visible: true,
      title: "International Quiz Night",
      // newTitle: 'Bulgarian Dinner',
      description: "Let's see who paid attention in school",
      bgImage: "22",
      date: "12th April",
      time: "20:00",
      ticketTimer: '2024-04-13T00:59:00',
      ticketLimit: 60,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      // correctedDate: "",
      // correctedTime: "",
      where: `Huiskantine`,
      entry: 6,
      memberEntry: 5,
      including: ['+ drink', '+ drink'],
      // ticket_link: 'https://www.tickettailor.com/events/hellenicassociationgroningen/1156915',
      price_id: 'price_1P24QcIOw5UGbAo1VKyg3doi',
      memberPrice_id: 'price_1P24RsIOw5UGbAo1fUGLw6oG',
      activeMemberPrice_id: 'price_1P24S5IOw5UGbAo1Vm1oaadh',
      freePass: ['vlady1002@abv.bg'],
      marketingInputs: false,
      extraInputs: false,
      text: [
        `Get ready for a global trivia showdown like no other at our International Quiz Night! 🌟
`,
        `Join us on April 12th starting at 20:00 at Huiskantine! 
`,
        `Bring your international friends, gather your dream team, and prepare to win the grand prize! After all, many hands make light work. This night of friendly competition will test your knowledge of diverse cultures, history, geography, and more! Keep an eye out for our Instagram stories for a sneak peek at the question themes you might encounter during the Quiz Night. 😉 
`,
        `
There are limited seats available, so buy your ticket now! €5 for members and €6 for non-members.
`,
        `It's your chance to let your brain shine! 🧠
`
      ],
      ticket_img: '/assets/images/tickets/rotterdam/ticket-2.jpg',
      images: ["/assets/images/portfolio/rotterdam/portfolio-2"],
      thumbnail: "/assets/images/portfolio/rotterdam/portfolio-2",
    },
  ],
  leeuwarden: [
    //     {
    //       membersOnly: false,
    //       visible: true,
    //       title: "BG Retro Movie Night",
    //       newTitle: 'Bulgarian Dinner',
    //       description: "Celebrate the National Movie Day",
    //       bgImage: "30",
    //       date: "28th March",
    //       time: "18:30",
    //       ticketTimer: '2024-03-28T20:00:00',
    //       ticketLimit: 250,
    //       Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    //       correctedDate: "",
    //       correctedTime: "",
    //       where: `Auditorium Building 10`,
    //       entry: 3.50,
    //       memberEntry: 2,
    //       including: [],
    //       ticket_link: '',
    //       price_id: 'price_1OyznWIOw5UGbAo1iE4xmWWD',
    //       memberPrice_id: 'price_1OxDKoIOw5UGbAo1rGeyskw9',
    //       activeMemberPrice_id: 'price_1OxDLCIOw5UGbAo1rfshOiJZ',
    //       freePass: ['vlady1002@abv.bg'],
    //       marketingInputs: false,
    //       extraInputs: false,
    //       text: [
    //         `Don't worry if you don't speak Bulgarian - English subtitles will be provided! 🌟 
    //         `,
    //         `🎥✨ Join us for a special Movie Night celebration!
    // `,
    //         ` 🎉 BGSL is proud to honor National Bulgarian Cinema Day with a screening of the heartwarming film "С деца на море" ("With Children at the Seaside") 🌊👨👩👧👦
    // `,
    //         ` Get ready for an evening of laughter, drama and unforgettable moments!  
    // `,
    //         `🎟 Tickets are only 2 euros for members of BGSL and 3,50 euros for non-members. The ticket includes a refreshing drink 🥤 and tasty popcorn/nachos and M&M! 🍿 Grab your friends for a cinematic experience you won't forget`,
    //         `See you there! 🎬 `,
    //       ],
    //       ticket_img: '/assets/images/tickets/leeuwarden/ticket-6.jpg',
    //       images: ["/assets/images/portfolio/leeuwarden/portfolio-6"],
    //       thumbnail: "/assets/images/portfolio/leeuwarden/portfolio-6",
    //     },
    {
      is_tickets_closed: true,
      membersOnly: false,
      visible: true,
      title: "Spring Gala",
      // newTitle: 'Bulgarian Dinner',
      description: "event for the stars",
      bgImage: "19",
      date: "24th May",
      time: "17:00",
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
      title: "Karaoke Night",
      // newTitle: 'Bulgarian Dinner',
      description: "Show up your voice",
      bgImage: "20",
      date: "10th April",
      time: "20:00",
      ticketTimer: '2024-04-10T21:00:00',
      ticketLimit: 60,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      // correctedDate: "",
      // correctedTime: "",
      where: `Café Public Works, Sint Annastraat 12`,
      entry: 5,
      memberEntry: 3,
      including: [],
      // ticket_link: 'https://www.tickettailor.com/events/hellenicassociationgroningen/1156915',
      price_id: 'price_1P1B77IOw5UGbAo1VKFbyfit',
      memberPrice_id: 'price_1P1B7LIOw5UGbAo1cnzTtNcO',
      activeMemberPrice_id: 'price_1P1B7LIOw5UGbAo1cnzTtNcO',
      freePass: ['vlady1002@abv.bg'],
      marketingInputs: false,
      extraInputs: false,
      text: [
        `Calling all music lovers to Galena, Krisko, Lili Ivanova, Azis, Molec and many more to our BULGARIAN KARAOKE: The Voice of Breda!🎶 Choose your favourite Bulgarian or Balkan songs and let your voice shine!`,
        `🙈That's not even all - Gather your friends for our exciting group singing contest, where teamwork could score you a special prize!🌟 
`,
        `Let the show begin! 🎤 !
`
      ],
      ticket_img: '/assets/images/tickets/breda/ticket-6.jpg',
      images: ["/assets/images/portfolio/breda/portfolio-6"],
      thumbnail: "/assets/images/portfolio/breda/portfolio-6",
    },
  ],
  maastricht: [

  ],
  amsterdam: [
    {
      membersOnly: false,
      visible: true,
      title: "Treasure Hunt",
      // newTitle: 'Bulgarian Dinner',
      description: "Awaken your adventure spirit",
      bgImage: "23",
      date: "19th April",
      time: "17:00",
      ticketTimer: '2024-04-19T13:00:00',
      ticketLimit: 30,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      // correctedDate: "",
      // correctedTime: "",
      where: `Vondelpark`,
      isFree: true,
      entry: 6,
      memberEntry: 5,
      including: [],
      // ticket_link: 'https://www.tickettailor.com/events/hellenicassociationgroningen/1156915',
      price_id: 'price_1P24QcIOw5UGbAo1VKyg3doi',
      memberPrice_id: 'price_1P24RsIOw5UGbAo1fUGLw6oG',
      activeMemberPrice_id: 'price_1P24S5IOw5UGbAo1Vm1oaadh',
      freePass: ['vlady1002@abv.bg'],
      marketingInputs: false,
      extraInputs: false,
      text: [
        `Calling all adventurers! Grab your maps and join us in Amsterdam for the ultimate treasure hunt, starting on April 19th at 17:00 in Vondelpark! Solve clues, crack codes, and outsmart the competition as you journey through the city's hidden secrets. But wait, there's a twist! The victorious team will be rewarded with FREE drinks at our borrel at Café Fest at 20:00 (Wibauthof 1, 1091 DD)! Get ready to toast to your triumph and celebrate in style! Get your FREE ticket in our bio, so that you don’t miss out on the thrill!
`,
        `...
`,
        `Призоваваме всички приключенци! Грабвайте картите и се присъединете към нас за най-голямото търсене на съкровища в Амстердам, което започва на 19-ти април от 17:00 във Вонделпарк! Открийте улики, разгадайте кодове и надхитрете конкуренцията, докато се разхождате из скритите улички на града. Но това не е всичко! Отборът победител ще получи БЕЗПЛАТНИ напитки на нашия борел в Café Fest от 20:00ч. (Wibauthof 1, 1091 DD)! Пригответе се да вдигнете тост за своя триумф и да празнувате със стил! Вземете своя БЕЗПЛАТЕН билет в нашето био, за да не пропуснете тръпката!`
      ],
      ticket_img: '/assets/images/tickets/amsterdam/ticket-2.jpg',
      images: ["/assets/images/portfolio/amsterdam/portfolio-2"],
      thumbnail: "/assets/images/portfolio/amsterdam/portfolio-2",
    },
  ]
}