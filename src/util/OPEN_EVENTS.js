// add ticket_link : '*link for the tickets' for outside ticket purchase
export const SOCIETY_EVENTS = {
groningen : [
  {
    membersOnly: false,
    visible: true,
    title: "Bulgarian & Greek Night",
    // newTitle: 'Bulgarian Dinner',
    description: "Get familiar with Greek and Bulgarian Culture",
    bgImage: "22",
    date: "26th February",
    time: "18:00",
    ticketTimer: '2024-02-14T18:00:00',
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
    images: ["/assets/images/portfolio/portfolio-30"],
    thumbnail: "/assets/images/portfolio/portfolio-30",
  },
    // {
  //   membersOnly: false,
  //   visible: true,
  //   title: "Bulgarian Student Party",
  //   // newTitle: 'Bulgarian Dinner',
  //   description: "Balkan tunes for the student holiday",
  //   bgImage: "24",
  //   date: "7th December",
  //   time: "22:00",
  //   ticketTimer: '2023-12-07T10:00:00',
  //   ticketLimit: 115,
  //   //Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
  //   correctedDate: "",
  //   correctedTime: "",
  //   where: `Sunny Beach`,
  //   entry: 6,
  //   memberEntry: 5,
  //   // including: ['(includes a beer or non-alcoholic drink)', '(includes a beer or non-alcoholic drink)'],
  //   price_id: 'price_1OCPOgIOw5UGbAo1HaG36vVy',
  //   memberPrice_id: 'price_1OCPPbIOw5UGbAo1ev6UZRHl',
  //   activeMemberPrice_id: 'price_1OCPPbIOw5UGbAo1cckNspxQ',
  //   freePass: ['vlady1002@abv.bg', 'Marios Lazarou', 'Constantinos Hadjicostis', 'Aggeliki Sideri', 'Kyriakos Panaou', 'Andreas Chitos', 'Sarantos Mourkakos', 'Anna Themistokleous'],
  //   extraInputs: false,
  //   text: [
  //     `Come celebrate Bulgaria’s national student holiday with us on December 7th at Sunny Beach!`,
  //     `In theme with the student holiday, the dress code is: Dress as your major. `,
  //     `Future lawyers, come dressed for court. For the scientists- lab coats. For the business students- suits. This is your chance to put on that cute uni outfit you never get to wear!
  //      `,
  //     `To set the atmosphere, the amazing DJs: @djzander & @saahkoang @balkanifywill be playing your favorite Balkan rhythms. 
  //     `,
  //     `Expect thematic decorations and the best vibes! The event will start at 22:00 and we'll party through the night until 05:00! 
  //     `,
  //     `Dress up and get creative with the outfits!`,
  //     `Tickets are limited so make sure you secure your spot NOW: €5 for members of BGSG & €6 for non-members.
  //     `
  //   ],
  //   ticket_img: '/assets/images/tickets/ticket-9.png',
  //   images: ["/assets/images/portfolio/portfolio-16"],
  //   thumbnail: "/assets/images/portfolio/portfolio-16",
  // },
  // {
  //   membersOnly: true,
  //   visible: true,
  //   title: "Rotterdam Trip",
  //   // newTitle: 'Bulgarian Dinner',
  //   description: "Meet and Greet with BGSR",
  //   bgImage: "25",
  //   date: "2nd December",
  //   time: "TBD",
  //   ticketTimer: '2023-11-30T19:15:00',
  //   ticketLimit: 20,
  //   //Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
  //   correctedDate: "",
  //   correctedTime: "",
  //   where: `Rotterdam`,
  //   entry: 25,
  //   memberEntry: 25,
  //   // including: ['(includes a beer or non-alcoholic drink)', '(includes a beer or non-alcoholic drink)'],
  //   price_id: 'price_1OFsWAIOw5UGbAo1QbwfPhll',
  //   memberPrice_id: 'price_1OFsWAIOw5UGbAo1QbwfPhll',
  //   activeMemberPrice_id: 'price_1OFsWAIOw5UGbAo1QbwfPhll',
  //   freePass: ['vlady1002@abv.bg'],
  //   extraInputs: false,
  //   text: [
  //     `Join us for an exclusive members-only experience in Rotterdam, where we will meet our amazing partners from Bulgarian Society Rotterdam!
  //     `,
  //     `Don't miss out on this unique opportunity to connect with more interesting people, explore the vibrant city of Rotterdam, and create some lasting memories! Make sure you save a spot fast, since we offer only a limited number of places!!!
  //     `,
  //     `More details regarding the start time, the trip organization, and the activities throughout the day will be shared with you in a private WhatsApp group, in which you will be added after purchasing your ticket.
  //      `,
  //   ],
  //   ticket_img: '/assets/images/tickets/ticket-10.jpg',
  //   images: ["/assets/images/events/bgsr/2", "/assets/images/events/bgsr/1"],
  //   thumbnail: "/assets/images/portfolio/portfolio-25",
  // },
  // {
  //   visible: true,
  //   subEvent: {
  //     description: 'You can purchase ONLY the dinner from this event separately - just click below!',
  //     link: '/event-details/Introduction%20Week%20(DINNER%20ONLY)'
  //   },
  //   title: "Introduction Week (FULL PASS)",
  //   description: "Welcome to the new term",
  //   bgImage: "21",
  //   date: "15th-19th September",
  //   time: "Check Program",
  //   ticketTimer: '2023-09-15T04:59:00',
  //   ticketLimit: 60,
  //   //Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
  //   correctedDate: "",
  //   correctedTime: "",
  //   where: `Introduction Lecture - Lust |
  //   City walk - Starting point in front of Lust |
  //   Dinner - Wijkrestaurant De Duindoorn, Duindoornstraat 91, 9741 NP |
  //   Party - Club Sunny Beach`,
  //   entry: 15,
  //   // memberEntry: 5,
  //   including: ['', ''],
  //   price_id: 'price_1NmbxbIOw5UGbAo1SSvjARlW',
  //   memberPrice_id: 'price_1NmbxbIOw5UGbAo1SSvjARlW',
  //   activeMemberPrice_id: 'price_1NmbxbIOw5UGbAo1SSvjARlW',
  //   freePass: ["elenamateva@abv.bg", "vladislavmarinov3142@gmail.com", "z.tsenovska@gmail.com", "mnanova6@gmail.com", "tsvetina.arabadzhieva@gmail.com", 'mariakristi.radeva@gmail.com'],
  //   extraInputs: false,
  //   text: [
  //     `Welcome (back😉) to Groningen!`,
  //     `We are thrilled to announce our Intro week package, including four events spanning three incredible days! Let’s kick off the new academic year together!`,
  //     '...',
  //     `Добре дошли (отново😉) в Грьонинген!`,
  //     `Ние сме въодушевени да обявим нашия пакет за Въведителната седмица, включващ четири събития, простиращи се през три невероятни дни! Да започнем заедно новата учебна година!`,
  //   ],
  //   ticket_img: '/assets/images/tickets/ticket-5.jpg',
  //   images: ["/assets/images/events/intro-week/2", "/assets/images/events/intro-week/3"],
  //   thumbnail: "/assets/images/portfolio/portfolio-12",
  // },
  // {
  //   visible: true,
  //   title: "Social Drinks and Belot",
  //   // newTitle: 'Bulgarian Dinner',
  //   description: "Let's see who is a player",
  //   bgImage: "23",
  //   date: "3rd November",
  //   time: "20:00",
  //   ticketTimer: '2023-11-03T16:00:00',
  //   ticketLimit: 60,
  //   //Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
  //   correctedDate: "",
  //   correctedTime: "",
  //   where: `Café the Crown`,
  //   entry: 7,
  //   memberEntry: 6,
  //   including: ['(includes a beer or non-alcoholic drink)', '(includes a beer or non-alcoholic drink)'],
  //   price_id: 'price_1O5OOwIOw5UGbAo1Xy8rtSKw',
  //   memberPrice_id: 'price_1O5OOIIOw5UGbAo1y3ZaO4Z2',
  //   activeMemberPrice_id: 'price_1O5OOIIOw5UGbAo1lhlGT0R6',
  //   freePass: ['vlady1002@abv.bg'],
  //   extraInputs: false,
  //   text: [
  //     `Join us on Friday November 3rd for Social drinks and Belot at Café the Crown! `,
  //     `The games will take place from 20:00 until 22:00. Everyone who wants to continue having fun can stay at the bar after the event is over.`,
  //     `The tables will be set up for each team of 4. Join alone or with friends- teams will be formed there.`,
  //     `Tickets are limited so don’t wait to get your ticket: €6 for members & €7 for non-members. Each ticket comes with a choice of beer or soda and snacks!`,
  //     `See you November 3rd!`,
  //   ],
  //   ticket_img: '/assets/images/tickets/ticket-8.jpg',
  //   images: ["/assets/images/portfolio/portfolio-15"],
  //   thumbnail: "/assets/images/portfolio/portfolio-15",
  // },]
],
rotterdam: [
  // {
  //   visible: true,
  //   // subEvent: {
  //   //   description: 'You can purchase ONLY the dinner from this event separately - just click below!',
  //   //   link: '/event-details/Introduction%20Week%20(DINNER%20ONLY)'
  //   // },
  //   title: "Bulgarian Dinner",
  //   description: "Join us for our first ever Bulgarian Dinner!",
  //   bgImage: "23",
  //   date: "2nd December",
  //   time: "20:00",
  //   ticketTimer: '2023-12-01T00:59:00',
  //   ticketLimit: 100,
  //   //Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
  //   correctedDate: "",
  //   correctedTime: "",
  //   where: `Stadhuisplein 30`,
  //   entry: 10,
  //   memberEntry: 8,
  //   including: ['menu', 'menu'],
  //   price_id: 'price_1OFhmnIOw5UGbAo1DRdcQMJd',
  //   memberPrice_id: 'price_1OFhnTIOw5UGbAo1jD2b2Eo5',
  //   activeMemberPrice_id: 'price_1OFhnTIOw5UGbAo14E6eyjfE',
  //   freePass: ['vlady1002@abv.bg'],
  //   extraInputs: true,
  //   text: [
  //     `We have prepared for you a delicious home-cooked meal, including Shopska salad, 2 main course options (Wine kebab or Stuffed peppers), a dessert (Biscuit cake), and many different surprise appetizers! 
  //     `,
  //     `The menu also includes vegetarian options, so that everyone can enjoy the delights that Bulgarian cuisine has to offer. Grab your friends and get ready for a night of rich flavors and warm company!
  //     `,
  //     'The doors will open at 20:00 at Stadhuisplein 30 (Milestone Student Apartments).',
  //     `The spots are limited, so mark your calendar and buy your ticket through our website NOW: €8 for members and €10 for non-members.`,
  //   ],
  //   ticket_img: '/assets/images/tickets/ticket-1.jpg',
  //   images: ["/assets/images/portfolio/portfolio-1"],
  //   thumbnail: "/assets/images/portfolio/portfolio-1",
  // },
  // {
  //   visible: false,
  //   title: "Introduction Week (DINNER ONLY)",
  //   newTitle: 'Bulgarian Dinner',
  //   description: "Welcome to the new term",
  //   bgImage: "22",
  //   date: "16th September",
  //   time: "19:00",
  //   ticketTimer: '2023-09-16T04:59:00',
  //   ticketLimit: 70,
  //   //Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
  //   correctedDate: "",
  //   correctedTime: "",
  //   where: `Wijkrestaurant De Duindoorn | Duindoornstraat 91, 9741 NP`,
  //   entry: 12,
  //   memberEntry: 10,
  //   including: ['(discounted including menu)', '(including menu)'],
  //   price_id: 'price_1Nmc1rIOw5UGbAo15v1W2Lt8',
  //   memberPrice_id: 'price_1Nmc00IOw5UGbAo1ZfaT6m4X',
  //   activeMemberPrice_id: 'price_1Nmc00IOw5UGbAo1AqDIkHKa',
  //   freePass: ["elenamateva@abv.bg", "vladislavmarinov3142@gmail.com", "z.tsenovska@gmail.com", "mnanova6@gmail.com", "tsvetina.arabadzhieva@gmail.com", 'mariakristi.radeva@gmail.com'],
  //   extraInputs: false,
  //   text: [
  //     `Calling all the veterans!`,
  //     `At the dinner, you will have the opportunity to meet the new additions to the town and catch up with the old ones after the summer!`,
  //     `In addition, you can enjoy our delicious Bulgarian cuisine!`,
  //     '...',
  //     `До всички ветерани!`,
  //     `На вечерята ще можете да се запознаете с новите попълнения в града и да наваксате след лятото със старите!`,
  //     `Освен това, може да се насладите на вкусната ни българска кухня!`,
  //   ],
  //   ticket_img: '/assets/images/tickets/ticket-6.jpg',
  //   images: ["/assets/images/events/intro-week/3"],
  //   thumbnail: "/assets/images/portfolio/portfolio-13",
  // },
],
leeuwarden : [
  // {
  //   disclaimer: 'Tickets for Belot',
  //   visible: true,
  //   subEvent: {
  //     description: 'You can either play Belot or Uno (both run simultaneously) - Link for the Uno game below',
  //     link: '/event-details/Game Night (Uno)'
  //   },
  //   title: "Game Night (Belot)",
  //   description: "🌟 Kickstart the new year with a bang! 🌟 ",
  //   bgImage: "23",
  //   date: "20th January",
  //   time: "19:30",
  //   ticketTimer: '2024-01-20T19:00:00',
  //   ticketLimit: 64,
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
  //     `👫 Belot Tournament:
  //     `,
  //     '- Limited Spaces: 32 people (16 teams of 2)',
  //     `- Sign up alone? No worries! We'll find you a teammate.
  //     `,
  //     `- Cash Prize: €30 for the winning team!
  //     `,
  //     ` Don't miss the chance to kick off the year with some friendly competition, exciting games, and awesome prizes!
  //     `,
  //     `Let the games begin! 🏆🃏
  //     `,

  //     `* Sign up period: 08.01.2024 until  spots are full 
  //     `,
  //   ],
  //   ticket_img: '/assets/images/tickets/ticket-3.jpg',
  //   images: ["/assets/images/portfolio/portfolio-2"],
  //   thumbnail: "/assets/images/portfolio/portfolio-2",
  // },
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

