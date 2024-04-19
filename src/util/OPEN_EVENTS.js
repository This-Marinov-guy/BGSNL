import React from "react";
import { Field, ErrorMessage } from "formik";

// add ticket_link : '*link for the tickets' for outside ticket purchase
export const SOCIETY_EVENTS = {
  groningen: [{
    membersOnly: false,
    visible: true,
    title: "Board Games Part 2",
    // newTitle: 'Bulgarian Dinner',
    description: "Show your gamb... your tactical skills",
    bgImage: "3",
    date: "19th April",
    time: "18:00",
    ticketTimer: '2024-04-19T23:00:00',
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
      `Join us for another epic game night, whether you're a seasoned strategist or a casual player, there's something for everyone at our board games event.`
    ],
    ticket_img: '/assets/images/tickets/groningen/ticket-36.jpg',
    images: ["/assets/images/portfolio/groningen/portfolio-36"],
    thumbnail: "/assets/images/portfolio/groningen/portfolio-36",
  }, {
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
      membersOnly: false,
      visible: true,
      title: "BG Retro Movie Night II",
      // newTitle: 'Bulgarian Dinner',
      description: "Another Bulgarian gem",
      bgImage: "30",
      date: "18th April",
      time: "18:45",
      ticketTimer: '2024-04-18T19:00:00',
      ticketLimit: 250,
      // Use the corrected date and time for changes in the date or time.Do not change the initial ones as it will make a new event in the DB
      //     correctedDate: "",
      // correctedTime: "",
      where: `Auditorium Building 10`,
      entry: 4,
      memberEntry: 2,
      including: [],
      // ticket_link: '',
      price_id: 'price_1P62nBIOw5UGbAo1jSlGhSbj',
      memberPrice_id: 'price_1P62nWIOw5UGbAo1lUSwWgHy',
      activeMemberPrice_id: 'price_1P62nWIOw5UGbAo1lUSwWgHy',
      freePass: ['vlady1002@abv.bg'],
      marketingInputs: false,
      extraInputs: false,
      text: [
        ` 🎉 Rewind with  "Голата истина за група Жигули" 🥁 🎵 
Get ready for an evening of laughter, drama and unforgettable moments!  
`,
        `Don't worry if you don't speak Bulgarian - English subtitles will be provided! 🌟 
`,
        `
🎟 Tickets are only 2 euros for members of BGSL and 4 euros for non-members. The ticket includes a refreshing drink 🥤 and tasty popcorn/nachos and sweet snack🍿 Grab your friends for a cinematic experience you won't forget! 
`,
        `See you there!`
      ],
      ticket_img: '/assets/images/tickets/leeuwarden/ticket-7.jpg',
      images: ["/assets/images/portfolio/leeuwarden/portfolio-7"],
      thumbnail: "/assets/images/portfolio/leeuwarden/portfolio-7",
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
  ],
  breda: [

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