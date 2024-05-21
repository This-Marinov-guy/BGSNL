import React from "react";
import { Field, ErrorMessage } from "formik";

// add ticket_link : '*link for the tickets' for outside ticket purchase

let galaPrice, galaMemberPrice, galaPriceId, galaMemberPriceId, galaTicketType;
const currentData = new Date().valueOf();

if (currentData < new Date('2024/05/08').valueOf()) {
  galaPrice = 12
  galaMemberPrice = 10
  galaPriceId = 'price_1P8xAJIOw5UGbAo1dfXlCO2y'
  galaMemberPriceId = 'price_1P8xAYIOw5UGbAo1FXTxKuim'
  galaTicketType = '(Early Bird)'
} else if (currentData < new Date('2024/05/17').valueOf()) {
  galaPrice = 15
  galaMemberPrice = 13
  galaPriceId = 'price_1PA4JeIOw5UGbAo1iXPDNujq'
  galaMemberPriceId = 'price_1PA4JTIOw5UGbAo1K8zje28r'
  galaTicketType = '(Regular Bird)'
} else {
  galaPrice = 19
  galaMemberPrice = 17
  galaPriceId = 'price_1PA4JzIOw5UGbAo1jxJLS12h'
  galaMemberPriceId = 'price_1PA4JrIOw5UGbAo1M3bfUfry'
  galaTicketType = '(Late Bird)'
}

const isEightMay = new Date().valueOf() < new Date('2024/05/08').valueOf();

export const SOCIETY_EVENTS = {
  groningen: [
    {
      isGala: true,
      is_tickets_closed: false,
      membersOnly: false,
      visible: true,
      title: "Spring Gala",
      // newTitle: 'Bulgarian Dinner',
      description: "Event for the stars",
      bgImage: "19",
      date: "24th May",
      time: "17:30",
      ticketTimer: '2024-05-24T20:00:00',
      ticketLimit: 1000,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      // correctedDate: "",
      // correctedTime: "",
      where: `StadsLab Groningen`,
      entry: galaPrice,
      memberEntry: galaMemberPrice,
      including: [galaTicketType, galaTicketType],
      // ticket_link: '',
      price_id: galaPriceId,
      memberPrice_id: galaMemberPriceId,
      activeMemberPrice_id: 'price_1P8xAhIOw5UGbAo1qFGP5uCN',
      freePass: ['vladislavmarinov3142@gmail.com',
        'Arian Adeli Koodehi',
        'Elizaveta Vinogradova',
        'bulgariansocietynetherlands@gmail.com',
        "aleksandar885533@gmail.com",
        "alex.ivanov2002@gmail.com",
        "antoniotodorov@gmail.com",
        "bulgariansociety.gro@gmail.com",
        "dani.denchev@abv.bg",
        "denisalukanova@gmail.com",
        "dimitarstamatovv@gmail.com",
        "edirobertbar@gmail.com",
        "elena@digitalondemand.co.uk",
        "floringiurca10@gmail.com",
        "info@bghub-eindhoven.n",
        "joanna.dragneva@aba.government.bg",
        "k.sonev1@gmail.com",
        "lazarspopov@gmail.com",
        "marinakvassileva@gmail.com",
        "melisa_hristova@abv.bg",
        "naomi.arnaudova@gmail.com",
        "otogramps@gmail.com",
        "rpl.lozanova@gmail.com",
        "savaspopov@gmai.com",
        "Valentinezheleva@gmail.com",
        "ymmominski@gmail.com",
        "zzianimates@gmail.com"
      ],
      marketingInputs: false,
      extraInputs: false,
      text: [
        `The long awaited moment approaches. We are thrilled to announce the first Spring Gala of BGSG!
        `,
        `Save the date because this year the 24th of May is not only the national holiday of Bulgarian literacy, but a local holiday celebrating the achievements of Bulgarian Society Groningen and Leeuwarden and its growing network and promoting Bulgarian artists and musicians in the Netherlands.
`,
        ` The program consists of 3 key focuses: Art, Music and Networking. We are also preparing some exciting surprises!
`,
        `Tickets will be sold in 3 types:`,
        `- Early Bird sale 10 euro for members | 12 euro for non-members`,
        `- Regular Bird sale 13 euro for members | 15 euro for non-members`,
        `- Late Bird sale 17 euro for members | 19 euro for non-members`

      ],
      ticket_img: '/assets/images/tickets/groningen/ticket-38.png',
      images: ["/assets/images/portfolio/groningen/portfolio-30"],
      thumbnail: "/assets/images/portfolio/groningen/portfolio-30",
    },
  ],
  rotterdam: [
    {
      is_tickets_closed: false,
      membersOnly: false,
      visible: true,
      title: "Horoteka - Horo Workshop",
      // newTitle: 'Bulgarian Dinner',
      description: "Master the traditional Bulgarian dance, horo, with our beginner-level class",
      bgImage: "24",
      date: "22nd May",
      time: "19:00",
      ticketTimer: '2024-05-22T20:00:00',
      ticketLimit: 50,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      // correctedDate: "",
      // correctedTime: "",
      where: `Erasmus Sport, Hall 4`,
      including: [],
      // ticket_link: '',
      entry: "5",
      memberEntry: "3",
      price_id: 'price_1PHHWuIOw5UGbAo10DDNIIas',
      memberPrice_id: 'price_1PHHXFIOw5UGbAo1w4KGZREU',
      activeMemberPrice_id: 'price_1PHHbgIOw5UGbAo181SJnKbg',
      freePass: ['vladislavmarinov3142@gmail.com'],
      marketingInputs: false,
      extraInputs: false,
      text: [
        `Step into the rhythm of Bulgaria with our Horo Workshop! Join us for an immersive experience where you'll master the traditional Bulgarian dance, horo, guided by a professional instructor from the Rotterdam Bulgarian Folklore Dance group, Sborenka. Regardless of your dance experience, everyone is welcome to enjoy the lively atmosphere and have fun with us.
        `,
        `Don't miss this opportunity to embrace Bulgarian culture, connect with fellow enthusiasts, and learn a thing or two you didn’t know about hero. This is also the perfect opportunity to teach your foreign friends some moves for your future wedding ;)
        `,
        `Bring your most comfortable shoes and let’s dance together!`
      ],
      ticket_img: '/assets/images/tickets/rotterdam/ticket-3.jpg',
      images: ["/assets/images/portfolio/rotterdam/portfolio-3"],
      thumbnail: "/assets/images/portfolio/rotterdam/portfolio-3",
    },
  ],
  leeuwarden: [
    {
      isGala: true,
      is_tickets_closed: false,
      membersOnly: false,
      visible: true,
      title: "Spring Gala",
      // newTitle: 'Bulgarian Dinner',
      description: "Event for the stars",
      bgImage: "19",
      date: "24th May",
      time: "17:30",
      ticketTimer: '2024-05-24T20:00:00',
      ticketLimit: 1000,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      // correctedDate: "",
      // correctedTime: "",
      where: `StadsLab Groningen`,
      entry: galaPrice,
      memberEntry: galaMemberPrice,
      including: [galaTicketType, galaTicketType],
      // ticket_link: '',
      price_id: galaPriceId,
      memberPrice_id: galaMemberPriceId,
      activeMemberPrice_id: 'price_1P8xAhIOw5UGbAo1qFGP5uCN',
      freePass: ['vladislavmarinov3142@gmail.com', 'Arian Adeli Koodehi', 'Elizaveta Vinogradova'],
      marketingInputs: false,
      extraInputs: false,
      text: [
        `The long awaited moment approaches. We are thrilled to announce the first Spring Gala of BGSG!
          `,
        `Save the date because this year the 24th of May is not only the national holiday of Bulgarian literacy, but a local holiday celebrating the achievements of Bulgarian Society Groningen and Leeuwarden and its growing network and promoting Bulgarian artists and musicians in the Netherlands.
  `,
        ` The program consists of 3 key focuses: Art, Music and Networking. We are also preparing some exciting surprises!
  `,
        `Tickets will be sold in 3 types:`,
        `- Early Bird sale 10 euro for members | 12 euro for non-members`,
        `- Regular Bird sale 13 euro for members | 15 euro for non-members`,
        `- Late Bird sale 17 euro for members | 19 euro for non-members`

      ],
      ticket_img: '/assets/images/tickets/groningen/ticket-38.png',
      images: ["/assets/images/portfolio/groningen/portfolio-30"],
      thumbnail: "/assets/images/portfolio/groningen/portfolio-30",
    },
  ],
  breda: [

    // {
    //   membersOnly: false,
    //   visible: true,
    //   title: "Movie Night",
    //   newTitle: 'Bulgarian Dinner',
    //   description: "let's enjoy some Bulgarian culture",
    //   bgImage: "18",
    //   date: "25th April",
    //   time: "18:30",
    //   ticketTimer: '2024-04-25T19:30:00',
    //   ticketLimit: 250,
    //   Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    //   correctedDate: "",
    //   correctedTime: "",
    //   where: `BUas, Frontier 1.016`,
    //   isMemberFree: true,
    //   entry: 2.50,
    //   memberEntry: 'Free',
    //   including: ['(+ drink and snack)', '(+ drink and snack)'],
    //   ticket_link: 'https://www.tickettailor.com/events/hellenicassociationgroningen/1156915',
    //   price_id: 'price_1P7uhsIOw5UGbAo1fvnUj3yw',
    //   memberPrice_id: 'price_1P7uhsIOw5UGbAo1fvnUj3yw',
    //   activeMemberPrice_id: 'price_1P7uhsIOw5UGbAo1fvnUj3yw',
    //   freePass: ['vladislavmarinov3142@gmail.com'],
    //   marketingInputs: false,
    //   extraInputs: [
    //     {
    //       element: <div div className="col-12" >
    //         <Field as="select" name="extraOne">
    //           <option value="" disabled>
    //             Select your drink
    //           </option>
    //           <option value="water">water</option>
    //           <option value="cola">cola</option>
    //           <option value="ice tea">ice tea</option>
    //         </Field>
    //         <ErrorMessage
    //           className="error"
    //           name="extraOne"
    //           component="div"
    //         />
    //       </div>,
    //       required: true
    //     },
    //     {
    //       element: <div div className="col-12" >
    //         <Field as="select" name="extraTwo">
    //           <option value="" disabled>
    //             Select your snack
    //           </option>
    //           <option value="popcorns">popcorns</option>
    //           <option value="nachos">nachos</option>
    //         </Field>
    //         <ErrorMessage
    //           className="error"
    //           name="extraTwo"
    //           component="div"
    //         />
    //       </div>,
    //       required: true
    //     }
    //   ],
    //   text: [
    //     `Dive into Bulgarian cinema with us for a special movie night featuring 'Attraction' - a romantic comedy movie with one of the most popular Bulgarian actors!🎞️
    //     `,
    //     `❗️English subtitles provided, so everyone is welcome to join us for an evening of cinematic experience and cultural exploration.
    //     `,
    //     `The price includes drink and popcorns🍿!
    //     `
    //   ],
    //   ticket_img: '/assets/images/tickets/breda/ticket-7.png',
    //   images: ["/assets/images/portfolio/breda/portfolio-7"],
    //   thumbnail: "/assets/images/portfolio/breda/portfolio-7",
    // },
  ],
  maastricht: [

  ],
  amsterdam: [

  ]
}
