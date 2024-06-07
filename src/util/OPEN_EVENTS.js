import React from "react";
import { Field, ErrorMessage } from "formik";

export const SOCIETY_EVENTS = {
  groningen: [

  ],
  rotterdam: [
    // {
    //   is_tickets_closed: false,
    //   membersOnly: false,
    //   visible: true,
    //   title: "Picnic",
    //   // newTitle: 'Bulgarian Dinner',
    //   description: "Join Us for a picnic and BBQ by the lake!",
    //   bgImage: "27",
    //   date: "2nd June",
    //   time: "14:00",
    //   ticketTimer: '2024-06-02T14:00:00',
    //   ticketLimit: 100,
    //   // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    //   // correctedDate: "",
    //   // correctedTime: "",
    //   where: `Kralingse Bos`,
    //   entry: 6,
    //   memberEntry: 5,
    //   including: [],
    //   // ticket_link: '',
    //   price_id: 'price_1PKEmRIOw5UGbAo1zH2agXGl',
    //   memberPrice_id: 'price_1PKEmdIOw5UGbAo1karBC9jr',
    //   activeMemberPrice_id: 'price_1PKEmnIOw5UGbAo1GP1WLmUI',
    //   freePass: ['vladislavmarinov3142@gmail.com'],
    //   marketingInputs: false,
    //   extraInputs: false,
    //   text: [
    //     `Relax and unwind with us at our picnic by the lake at Kralingse Bos. Enjoy Bulgarian BBQ, partake in fun activities, and connect with great company. Whether you're looking to make new friends or just enjoy a lovely day outdoors, this picnic is the perfect opportunity!
    //     `,
    //     `
    //     Bring your friends, drinks (BYOB), and good vibes for a perfect picnic day! You can also expect some surprises from us 😉
    //     `,
    //     `You are welcome to join the picnic for free. However, if you would like to enjoy our BBQ, you must purchase a ticket. Each ticket includes one kebapche, one kyufte, one additional piece of meat of your choice, and a serving of Snezhanka salad. Please note, we cannot sell alcohol at the park, so feel free to bring your own drinks.`
    //   ],
    //   ticket_img: '/assets/images/tickets/rotterdam/ticket-4.jpg',
    //   images: ["/assets/images/portfolio/rotterdam/portfolio-4"],
    //   thumbnail: "/assets/images/portfolio/rotterdam/portfolio-4",
    // },
  ],
  leeuwarden: [

  ],
  breda: [
    {
      membersOnly: false,
      visible: true,
      title: "Picnic",
      // newTitle: 'Bulgarian Dinner',
      description: "Join Us for a picnic and BBQ!",
      bgImage: "27",
      date: "15th June",
      time: "16:00",
      ticketTimer: '2024-06-15T16:00:00',
      ticketLimit: 40,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      // correctedDate: "",
      // correctedTime: "",
      where: `Park Valkenberg`,
      isMemberFree: false,
      entry: 6,
      memberEntry: 5,
      including: [],
      price_id: 'price_1PP8xyIOw5UGbAo1ZPg0a8rG',
      memberPrice_id: 'price_1PP8y8IOw5UGbAo1NCG7TpIU',
      activeMemberPrice_id: 'price_1PP8y8IOw5UGbAo1NCG7TpIU',
      freePass: ['vladislavmarinov3142@gmail.com'],
      marketingInputs: false,
      text: [
        `Гладна мечка хоро не играе, както е казал народът! `,
        `Join our Saturday BBQ enjoying your favorite Bulgarian songs and traditional Bulgarian food! Our menu features kebapche or kyufte, lyutenitsa, pitka, and ayran to feel the true Bulgarian spirit!`,
        ` After the feast, you can play childhood games like народна топка, Ludo (не се сърди човече), and volleyball.`
      ],
      ticket_img: '/assets/images/tickets/breda/ticket-8.jpg',
      images: ["/assets/images/portfolio/breda/portfolio-8"],
      thumbnail: "/assets/images/portfolio/breda/portfolio-8",
    },
  ],
  maastricht: [

  ],
  amsterdam: [
    // {
    //   membersOnly: false,
    //   visible: true,
    //   title: "Football Match",
    //   label: 'Football Match',
    //   // newTitle: 'Bulgarian Dinner',
    //   description: "let's show some lion spirit",
    //   bgImage: "25",
    //   date: "1st June",
    //   time: "14:00",
    //   ticketTimer: '2024-05-31T23:59:00',
    //   ticketLimit: 20,
    //   // Use the corrected date and time for changes in the date or time.Do not change the initial ones as it will make a new event in the DB
    //   // correctedDate: "",
    //   // correctedTime: "",
    //   where: `SC Overamstel (Radioweg 96, 1098 NJ)`,
    //   isFree: true,
    //   isMemberFree: false,
    //   freePass: ['vladislavmarinov3142@gmail.com'],
    //   marketingInputs: false,
    //   extraInputs: false,
    //   subEvent: {
    //     description: 'Join is for the UEFA Champions League Final',
    //     links: [
    //       { name: 'Buy your spot', href: '/UEFA%20Champions%20League%20Finale' }
    //     ]
    //   },
    //   text: [
    //     `Join us for an unforgettable day of football and celebration on June 1st at our Kick off & Finale Event! We're kicking things off with a friendly match at SC Overamstel, where players of all levels are welcome to show their skills and enjoy the game. Whether you're playing or cheering from the sidelines, it's going to be a fantastic time! 
    //     `,
    //     `If you wish to join us for the UEFA Finale as well, make sure to buy your ticket from the other link. See you there!
    //     `,
    //     `...
    //     `,
    //     `Присъединете се към нас за един незабравим ден, изпълнен с футбол и празненства на нашето Kick off & Finale събитие на 1-ви юни! Ще започнем с приятелски мач в SC Overamstel, където всеки е добре дошъл да покаже уменията си и да се наслади на играта. Независимо дали ще играете или ще бъдете там за подкрепа, обещаваме, че ще си прекарате супер! 
    //     `,
    //     `Ако искате да се присъедините и към финала на Шампионска Лига, не забравяйте да купите своя билет от другия линк. Очакваме Ви!`,
    //   ],
    //   ticket_img: '/assets/images/tickets/amsterdam/ticket-5.jpg',
    //   images: ["/assets/images/portfolio/amsterdam/portfolio-5"],
    //   thumbnail: "/assets/images/portfolio/amsterdam/portfolio-5",
    // },
    // {
    //   membersOnly: false,
    //   visible: false,
    //   title: "UEFA Champions League Finale",
    //   label: 'Champions League',
    //   // newTitle: 'Bulgarian Dinner',
    //   description: "support your team",
    //   bgImage: "25",
    //   date: "1st June",
    //   time: "20:30",
    //   ticketTimer: '2024-06-01T20:30:00',
    //   ticketLimit: 25,
    //   // Use the corrected date and time for changes in the date or time.Do not change the initial ones as it will make a new event in the DB
    //   // correctedDate: "",
    //   // correctedTime: "",
    //   where: `THE POKÉ LAB (Albert Cuypstraat 136)`,
    //   entry: 5,
    //   including: ['(+ drink)', '(+ drink)'],
    //   price_id: 'price_1PJrZUIOw5UGbAo1lUbyYgAQ',
    //   memberPrice_id: 'price_1PJrZUIOw5UGbAo1lUbyYgAQ',
    //   activeMemberPrice_id: 'price_1PJrZUIOw5UGbAo1lUbyYgAQ',
    //   freePass: ['vladislavmarinov3142@gmail.com'],
    //   marketingInputs: false,
    //   extraInputs: false,
    //   subEvent: {
    //     description: 'Join is for our friendly match at 14:00',
    //     links: [
    //       { name: 'Reserve your spot', href: '/Football%20Match' }
    //     ]
    //   },
    //   text: [
    //     `After the friendly match at SC Overamstel, we're heading over to THE POKÉ LAB to watch the UEFA Champions League finale together. Get ready for an evening of intense football action great company. Let's witness the crowning of the European champions in style! 
    //     `,
    //     `If you wish to join us for the football match as well, make sure to get your free ticket from the other link. See you there!
    //     `,
    //     `...`,
    //     `След мача в SC Overamstel се отправяме към THE POKÉ LAB, за да гледаме заедно финала на Шампионската лига на УЕФА. Пригответе се за вечер на интензивен футболен екшън и страхотна компания. Нека станем свидетели на коронясването на европейските шампиони със стил!
    //     `,
    //     `Ако искате да се присъедините и към футболния мач, не забравяйте да вземете своя безплатен билет и другия линк. Очакваме Ви!`
    //   ],
    //   ticket_img: '/assets/images/tickets/amsterdam/ticket-6.jpg',
    //   images: ["/assets/images/portfolio/amsterdam/portfolio-5"],
    //   thumbnail: "/assets/images/portfolio/amsterdam/portfolio-5",
    // },
  ]
}
