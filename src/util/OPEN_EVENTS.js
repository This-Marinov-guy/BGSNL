import React from "react";
import { Field, ErrorMessage } from "formik";

export const SOCIETY_EVENTS = {
  groningen: [
    {
      is_tickets_closed: false,
      membersOnly: false,
      visible: true,
      title: "Bulgarian Student Party",
      // newTitle: 'Bulgarian Dinner',
      description: "Let's wrap the student year",
      bgImage: "16",
      date: "27th June",
      time: "22:00",
      ticketTimer: '2024-09-27T22:00:00',
      ticketLimit: 100,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      // correctedDate: "",
      // correctedTime: "",
      where: `Sunny Beach`,
      entry: 5,
      memberEntry: 4,
      including: [],
      // ticket_link: '',
      price_id: 'price_1PSi6aIOw5UGbAo1EZ762u3s',
      memberPrice_id: 'price_1PSi6kIOw5UGbAo1TFquLoce',
      activeMemberPrice_id: 'price_1PSi6uIOw5UGbAo1OUbvNXqr',
      freePass: ['vladislavmarinov3142@gmail.com'],
      marketingInputs: false,
      extraInputs: false,
      text: [
        `Come join us on the 27th of June at @sunnybeachgroningen to celebrate the end of exam season and warm up for the summer.🥳🏖
`,
        `Time to throw those textbooks, put on your best outfits and celebrate the end of the school year.❌📚
`,
        `Tickets are limited for purchase on the platform - we will be selling at the door for 6 euro given that the capacity allows it!
`,

      ],
      ticket_img: '/assets/images/tickets/groningen/ticket-40.jpg',
      images: ["/assets/images/portfolio/groningen/portfolio-40"],
      thumbnail: "/assets/images/portfolio/groningen/portfolio-40",
    },
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
  leeuwarden: [],
  breda: [
  ],
  maastricht: [

  ],
  amsterdam: [

  ]
}
