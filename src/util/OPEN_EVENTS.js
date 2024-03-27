import React from "react";
import { Field, ErrorMessage } from "formik";

// add ticket_link : '*link for the tickets' for outside ticket purchase
export const SOCIETY_EVENTS = {
  groningen: [
    {
      is_tickets_closed: true,
      membersOnly: false,
      visible: true,
      title: "Spring Gala",
      // newTitle: 'Bulgarian Dinner',
      description: "event for the stars",
      bgImage: "31",
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
  rotterdam: [

  ],
  leeuwarden: [
    {
      membersOnly: false,
      visible: true,
      title: "BG Retro Movie Night",
      // newTitle: 'Bulgarian Dinner',
      description: "Celebrate the National Movie Day",
      bgImage: "30",
      date: "28th March",
      time: "18:30",
      ticketTimer: '2024-03-28T20:00:00',
      ticketLimit: 250,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      // correctedDate: "",
      // correctedTime: "",
      where: `Auditorium Building 10`,
      entry: 3.50,
      memberEntry: 2,
      including: [],
      // ticket_link: '',
      price_id: 'price_1OyznWIOw5UGbAo1iE4xmWWD',
      memberPrice_id: 'price_1OxDKoIOw5UGbAo1rGeyskw9',
      activeMemberPrice_id: 'price_1OxDLCIOw5UGbAo1rfshOiJZ',
      freePass: ['vlady1002@abv.bg'],
      marketingInputs: false,
      extraInputs: false,
      text: [
        `Don't worry if you don't speak Bulgarian - English subtitles will be provided! 🌟 
        `,
        `🎥✨ Join us for a special Movie Night celebration!
`,
        ` 🎉 BGSL is proud to honor National Bulgarian Cinema Day with a screening of the heartwarming film "С деца на море" ("With Children at the Seaside") 🌊👨👩👧👦
`,
        ` Get ready for an evening of laughter, drama and unforgettable moments!  
`,
        `🎟 Tickets are only 2 euros for members of BGSL and 3,50 euros for non-members. The ticket includes a refreshing drink 🥤 and tasty popcorn/nachos and M&M! 🍿 Grab your friends for a cinematic experience you won't forget`,
        `See you there! 🎬 `,
      ],
      ticket_img: '/assets/images/tickets/leeuwarden/ticket-6.jpg',
      images: ["/assets/images/portfolio/leeuwarden/portfolio-6"],
      thumbnail: "/assets/images/portfolio/leeuwarden/portfolio-6",
    },
    {
      is_tickets_closed: true,
      membersOnly: false,
      visible: true,
      title: "Spring Gala",
      // newTitle: 'Bulgarian Dinner',
      description: "event for the stars",
      bgImage: "31",
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
    // {
    //   membersOnly: false,
    //   visible: true,
    //   title: "Speedfriending & Bonding games night",
    //   newTitle: 'Bulgarian Dinner',
    //   description: "Show up your game",
    //   bgImage: "3",
    //   date: "20th March",
    //   time: "19:00",
    //   ticketTimer: '2024-03-20T19:00:00',
    //   ticketLimit: 33,
    //   Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    //   correctedDate: "",
    //   correctedTime: "",
    //   where: `Café Public Works, Sint Annastraat 12`,
    //   entry: 3,
    //   memberEntry: 3,
    //   including: [],
    //   ticket_link: 'https://www.tickettailor.com/events/hellenicassociationgroningen/1156915',
    //   price_id: 'price_1Ou6ifIOw5UGbAo10kG6Zfku',
    //   memberPrice_id: 'price_1Ou6ifIOw5UGbAo10kG6Zfku',
    //   activeMemberPrice_id: 'price_1Ou6j3IOw5UGbAo1qen4ExqI',
    //   freePass: ['vlady1002@abv.bg'],
    //   marketingInputs: true,
    //   extraInputs: false,
    //   text: [
    //     `Join us for our special event - Speedfriending & bonding games night! Break the ice with engaging questions and topics and make new friends, then play in teams Cards against Bulgarshtinata, associations, and character traits bingo. Get ready for an unforgettable evening of connection and fun!
    //   `,
    //   ],
    //   ticket_img: '/assets/images/tickets/breda/ticket-4.jpg',
    //   images: ["/assets/images/portfolio/breda/portfolio-4"],
    //   thumbnail: "/assets/images/portfolio/breda/portfolio-4",
    // },
  ],
  maastricht: [

  ],
  amsterdam: [
    // {
    //   membersOnly: false,
    //   visible: true,
    //   title: "Board Game Night",
    //   // newTitle: 'Bulgarian Dinner',
    //   description: "Show up your game",
    //   bgImage: "3",
    //   date: "15th March",
    //   time: "19:00",
    //   ticketTimer: '2024-03-15T15:00:00',
    //   ticketLimit: 25,
    //   //Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    //   correctedDate: "",
    //   correctedTime: "",
    //   where: `The POKE Lab`,
    //   entry: 5,
    //   memberEntry: 5,
    //   including: ['(including free drink)', '(including free drink)'],
    //   // ticket_link: 'https://www.tickettailor.com/events/hellenicassociationgroningen/1156915',
    //   price_id: 'price_1OsBLpIOw5UGbAo1Cddu79PH',
    //   memberPrice_id: 'price_1OsBLpIOw5UGbAo1Cddu79PH',
    //   activeMemberPrice_id: 'price_1OsBLpIOw5UGbAo1Cddu79PH',
    //   freePass: ['vlady1002@abv.bg'],
    //   extraInputs: false,
    //   text: [
    //     `Join us for an exciting board games night at THE POKÉ LAB Amsterdam! Whether you’re into more serious games like chess or the well-known entertaining Monopoly, you’ll certainly find something to your taste. With every ticket purchased, you get a beer or a glass of wine of your choice. There’s only 25 tickets available, so don’t hesitate and follow the link in our bio to get yours! You’re welcome from 19:00 onwards. Can’t wait to see you there! 
    //   `,
    //     `Присъединете се към нас за вълнуваща вечер на бордните игри в THE POKÉ LAB Amsterdam. Няма значение дали си падате по сериозните игри като шах или предпочитате забавното Монополи, със сигурност ще откриете нещо по Ваш вкус. С всеки закупен билет получавате бира или чаша вино по Ваш избор. Има само 25 налични билета, така че не се колебайте и последвайте линка в биото ни, за да закупите Вашия. Добре дошли сте от 19:00ч. Очакваме Ви!
    //   `,
    //   ],
    //   ticket_img: '/assets/images/tickets/amsterdam/ticket-1.jpg',
    //   images: ["/assets/images/portfolio/amsterdam/portfolio-1"],
    //   thumbnail: "/assets/images/portfolio/amsterdam/portfolio-1",
    // },
  ]
}