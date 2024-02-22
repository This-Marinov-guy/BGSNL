// add ticket_link : '*link for the tickets' for outside ticket purchase
export const SOCIETY_EVENTS = {
groningen : [
  {
    membersOnly: false,
    visible: true,
    title: "Bulgarian Student Party",
    // newTitle: 'Bulgarian Dinner',
    description: "Dance the night away",
    bgImage: "24",
    date: "7th March",
    time: "22:00",
    ticketTimer: '2024-03-07T22:00:00',
    ticketLimit: 100,
    //Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    correctedDate: "",
    correctedTime: "",
    where: `Sunny Beach`,
    entry: 5,
    memberEntry: 4,
    // including: ['(includes a beer or non-alcoholic drink)', '(includes a beer or non-alcoholic drink)'],
    // ticket_link: 'https://www.tickettailor.com/events/hellenicassociationgroningen/1156915',
    price_id: 'price_1OmZVWIOw5UGbAo17Hn9aXxA',
    memberPrice_id: 'price_1OmZVmIOw5UGbAo19UJ43aNo',
    activeMemberPrice_id: 'price_1OmZW0IOw5UGbAo1sYulo8JA',
    freePass: ['vlady1002@abv.bg'],
    extraInputs: false,
    text: [
      `Feeling the urge to party like you're back in Bulgaria?  Then mark your calendars for the ultimate student party on the 7th  of March!
      `,
      `Get ready to dance to the hottest tunes!
      `,
      `Whether you're Bulgarian or just love the Balkan vibe, this is a night you don’t want to miss! 
       `,
       `Tickets are flying off the shelves like confetti, so grab yours now before it's too late!`
    ],
    ticket_img: '/assets/images/tickets/groningen/ticket-31.jpg',
    images: ["/assets/images/portfolio/groningen/portfolio-31"],
    thumbnail: "/assets/images/portfolio/groningen/portfolio-31",
  },
  {
    membersOnly: false,
    visible: true,
    title: "Bulgarian & Greek Night",
    // newTitle: 'Bulgarian Dinner',
    description: "Get familiar with Greek and Bulgarian Culture",
    bgImage: "22",
    date: "26th February",
    time: "18:00",
    // ticketTimer: '2024-02-14T18:00:00',
    ticketLimit: 0,
    //Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    correctedDate: "",
    correctedTime: "",
    where: `Griekse Taverna Doris`,
    entry: 6,
    memberEntry: 4,
    // including: ['(includes a beer or non-alcoholic drink)', '(includes a beer or non-alcoholic drink)'],
    ticket_link: 'https://www.tickettailor.com/events/hellenicassociationgroningen/1156915',
    // price_id: 'price_1OgKdXIOw5UGbAo1xu2ic0ja',
    // memberPrice_id: 'price_1OgKe3IOw5UGbAo1aQhiMrxG',
    // activeMemberPrice_id: 'price_1OgKrIIOw5UGbAo1FlbrNHYZ',
    freePass: ['vlady1002@abv.bg'],
    extraInputs: false,
    text: [
      `An evening of cultural enrichment and exchange at our 'Get Familiar with Greek and Bulgarian Culture' event. `,
      `We invite you to join us and learn more about the difference and similarities of the two cultures through a variety of authentic snacks, drinks and traditional dances.`,
      `Disclaimer: Member tickets are only issued to members of BGSG and HSAG. Invalid tickets will be cancelled with no refund! 
       `,
    ],
    ticket_img: '/assets/images/tickets/ticket-20.png',
    images: ["/assets/images/portfolio/groningen/portfolio-30"],
    thumbnail: "/assets/images/portfolio/groningen/portfolio-30",
  },
],
rotterdam: [

],
leeuwarden : [
  {
    visible: true,
    subEvent: {
      description: 'You can purchase ticket ONLY for the party - Link below',
      link: '/event-details/Bulgarian Party'
    },
    title: "Bulgarian Dinner",
    description: "For the national glory",
    bgImage: "22",
    date: "2nd March",
    time: "19:00",
    ticketTimer: '2024-03-02T19:00:00',
    ticketLimit: 100,
    // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    correctedDate: "",
    correctedTime: "",
    where: `Fizz`,
    entry: 10,
    memberEntry: 10,
    including: ['+ free shot and drink', '+ free shot and drink'],
    price_id: 'price_1OlejBIOw5UGbAo1JBDpdV4q',
    memberPrice_id: 'price_1OlejBIOw5UGbAo1JBDpdV4q',
    activeMemberPrice_id: 'price_1OlejQIOw5UGbAo1R76ENtGI',
    discountPass: [
      'simonatodorova2216@gmail.com',
      'ivandikliev1@abv.bg',
      'nikoltoneva88@gmail.com',
      'dfawal@gmail.bg',
      'deamira.st23@gmail.com',
      'dimitrova04v@abv.bg',
      'melisa_hristova@abv.bg',
      'tonovivailo@gmail.com',
      'alistaneva@gmail.com',
      'danailova97@gmail.com',
      'miryana.b.ivanova@gmail.com',
      'vesi_it@abv.bg',
      'alex_ivanov2002@gmail.com',
      'bulgariansociety.lwd@gmail.com'
    ],
    freePass: ["vlady1002@abv.bg"],
    extraInputs: true,
    text: [
      `Celebrate the Bulgarian Independence Day with an iconic and memorable dinner and party here in Leeuwarden.🎉 
      `,
      `Ditch the boring Saturday evening and join us to welcome the Independence Day ✨and dwell into the Bulgarian spirit 
      `,
      'We will be welcoming you at Fizz at 19:00 with a shot of Rakiya 🥃 , piece of Pitka 🍞 with honey or mixed spices (sharena sol).🧂',
      `What to expect? 
      `,
      `•delicious appetizers 🍢
      `,
      `•heart-warming mea🍛
      `,
      `•soft and chewy dessert 🥧
      `,
      `To set the atmosphere DjZander will be playing your favourite hits with occasional horo breaks 💃
      `,
      `After the delicious meals, fun games and dances, the evening will continue at @lixx starting at 23:30 where the Dj will make you feel at home with Bulgarian hits 🎵`,
      `Not only that but a free shot 🥃 will be waiting for you when you enter the club’s doors 🎉`,
      `Bring your patriotism and party mood and be ready for a memorable night! 🌙 🎉 `,
    ],
    ticket_img: '/assets/images/tickets/leeuwarden/ticket-5.jpg',
    images: ["/assets/images/events/leeuwarden/freedom1/1", "/assets/images/events/leeuwarden/freedom1/2"],
    thumbnail: "/assets/images/portfolio/leeuwarden/portfolio-5",
  },
  {
    visible: false,
    subEvent: {
      description: 'You can purchase combined ticket for dinner and party - Link below',
      link: '/event-details/Bulgarian Dinner'
    },
    title: "Bulgarian Party",
    description: "Liberation party",
    bgImage: "24",
    date: "2nd March",
    time: "23:30",
    ticketTimer: '2024-03-02T23:00:00',
    ticketLimit: 100,
    // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    correctedDate: "",
    correctedTime: "",
    where: `Club Lixx`,
    entry: 5,
    memberEntry: 5,
    including: ['+ free shot', '+ free shot'],
    price_id: 'price_1OlelKIOw5UGbAo1WXW9a1tC',
    memberPrice_id: 'price_1OlelKIOw5UGbAo1WXW9a1tC',
    activeMemberPrice_id: 'price_1OlelnIOw5UGbAo18Jz8wczU',
    discountPass: [
      'simonatodorova2216@gmail.com',
      'ivandikliev1@abv.bg',
      'nikoltoneva88@gmail.com',
      'dfawal@gmail.bg',
      'deamira.st23@gmail.com',
      'dimitrova04v@abv.bg',
      'melisa_hristova@abv.bg',
      'tonovivailo@gmail.com',
      'alistaneva@gmail.com',
      'danailova97@gmail.com',
      'miryana.b.ivanova@gmail.com',
      'vesi_it@abv.bg',
      'alex_ivanov2002@gmail.com',
      'bulgariansociety.lwd@gmail.com'
    ],
    freePass: ["vlady1002@abv.bg"],
    extraInputs: false,
    text: [
      `Celebrate the Bulgarian Independence Day with an iconic and memorable party here in Leeuwarden.🎉 
      `,
      `The evening continues after a great meal at @lixx starting at 23:30 where the Dj will make you feel at home with Bulgarian hits 🎵`,
      `Not only that but a free shot 🥃 will be waiting for you when you enter the club’s doors 🎉`,
      `Bring your patriotism and party mood and be ready for a memorable night! 🌙 🎉 `,
    ],
    ticket_img: '/assets/images/tickets/leeuwarden/ticket-1.jpg',
    images: ["/assets/images/events/leeuwarden/freedom1/1"],
    thumbnail: "/assets/images/portfolio/leeuwarden/portfolio-5",
  },
  // {
  //   disclaimer: 'Tickets For Uno',
  //   visible: true,
  //   subEvent: {
  //     description: 'You can either play Uno or Belot (both run simultaneously) - Link for the Belot game below',
  //     link: '/event-details/Game Night (Belot)'
  //   },
  //   title: "Game Night (Uno)",
  //   description: "🌟 Kickstart the new year with a bang! 🌟 ",
  //   bgImage: "23",
  //   date: "20th January",
  //   time: "19:30",
  //   ticketTimer: '2024-01-20T21:00:00',
  //   ticketLimit: 100,
  //   Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
  //   correctedDate: "",
  //   correctedTime: "",
  //   where: `Grote Keizer Bowling`,
  //   entry: 6,
  //   memberEntry: 5,
  //   including: ['+ drink by choice', '+ drink by choice'],
  //   price_id: 'price_1OVyivIOw5UGbAo1Yuob9lhb',
  //   memberPrice_id: 'price_1OVyivIOw5UGbAo1Yuob9lhb',
  //   activeMemberPrice_id: 'price_1OWBaCIOw5UGbAo1fi6OwKrL',
  //   discountPass: [
  //     'simonatodorova2216@gmail.com',
  //     'ivandikliev1@abv.bg',
  //     'nikoltoneva88@gmail.com',
  //     'dfawal@gmail.bg',
  //     'deamira.st23@gmail.com',
  //     'dimitrova04v@abv.bg',
  //     'melisa_hristova@abv.bg',
  //     'tonovivailo@gmail.com',
  //     'alistaneva@gmail.com',
  //     'danailova97@gmail.com',
  //     'miryana.b.ivanova@gmail.com',
  //     'vesi_it@abv.bg',
  //     'alex_ivanov2002@gmail.com',
  //     'bulgariansociety.lwd@gmail.com'
  //   ],
  //   freePass: ["vlady1002@abv.bg"],
  //   extraInputs: true,
  //   text: [
  //     `Hope you get a good rest during the holidays because BGSL starts strong with the first event for the year.  
  //     `,
  //     `👫 Uno Tournament:
  //     `,
  //     '- Unlimited Spaces!',
  //     `- Cash Prize: €15 for the ultimate Uno champion!
  //     `,
  //     ` Don't miss the chance to kick off the year with some friendly competition, exciting games, and awesome prizes!
  //     `,
  //     `Let the games begin! 🏆🃏
  //     `,

  //     `* Sign up period: 08.01.2024 until game begins 
  //     `,
  //   ],
  //   ticket_img: '/assets/images/tickets/ticket-4.jpg',
  //   images: ["/assets/images/portfolio/portfolio-2"],
  //   thumbnail: "/assets/images/portfolio/portfolio-2",
  // },
]
}

