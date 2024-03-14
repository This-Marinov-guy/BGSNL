import React from "react";
import { Field, ErrorMessage } from "formik";

// add ticket_link : '*link for the tickets' for outside ticket purchase
export const SOCIETY_EVENTS = {
  groningen: [

  ],
  rotterdam: [

  ],
  leeuwarden: [

  ],
  breda: [
    {
      membersOnly: false,
      visible: true,
      title: "Speedfriending & Bonding games night",
      // newTitle: 'Bulgarian Dinner',
      description: "Show up your game",
      bgImage: "3",
      date: "20th March",
      time: "19:00",
      ticketTimer: '2024-03-20T19:00:00',
      ticketLimit: 33,
      //Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      correctedDate: "",
      correctedTime: "",
      where: `Café Public Works, Sint Annastraat 12`,
      entry: 3,
      memberEntry: 3,
      including: [],
      // ticket_link: 'https://www.tickettailor.com/events/hellenicassociationgroningen/1156915',
      price_id: 'price_1Ou6ifIOw5UGbAo10kG6Zfku',
      memberPrice_id: 'price_1Ou6ifIOw5UGbAo10kG6Zfku',
      activeMemberPrice_id: 'price_1Ou6j3IOw5UGbAo1qen4ExqI',
      freePass: ['vlady1002@abv.bg'],
      marketingInputs: true,
      extraInputs: false,
      text: [
        `Join us for our special event - Speedfriending & bonding games night! Break the ice with engaging questions and topics and make new friends, then play in teams Cards against Bulgarshtinata, associations, and character traits bingo. Get ready for an unforgettable evening of connection and fun!
      `,
      ],
      ticket_img: '/assets/images/tickets/breda/ticket-4.jpg',
      images: ["/assets/images/portfolio/breda/portfolio-4"],
      thumbnail: "/assets/images/portfolio/breda/portfolio-4",
    },
  ],
  maastricht: [

  ],
  amsterdam: [
    {
      membersOnly: false,
      visible: true,
      title: "Board Game Night",
      // newTitle: 'Bulgarian Dinner',
      description: "Show up your game",
      bgImage: "3",
      date: "15th March",
      time: "19:00",
      ticketTimer: '2024-03-15T15:00:00',
      ticketLimit: 25,
      //Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      correctedDate: "",
      correctedTime: "",
      where: `The POKE Lab`,
      entry: 5,
      memberEntry: 5,
      including: ['(including free drink)', '(including free drink)'],
      // ticket_link: 'https://www.tickettailor.com/events/hellenicassociationgroningen/1156915',
      price_id: 'price_1OsBLpIOw5UGbAo1Cddu79PH',
      memberPrice_id: 'price_1OsBLpIOw5UGbAo1Cddu79PH',
      activeMemberPrice_id: 'price_1OsBLpIOw5UGbAo1Cddu79PH',
      freePass: ['vlady1002@abv.bg'],
      extraInputs: false,
      text: [
        `Join us for an exciting board games night at THE POKÉ LAB Amsterdam! Whether you’re into more serious games like chess or the well-known entertaining Monopoly, you’ll certainly find something to your taste. With every ticket purchased, you get a beer or a glass of wine of your choice. There’s only 25 tickets available, so don’t hesitate and follow the link in our bio to get yours! You’re welcome from 19:00 onwards. Can’t wait to see you there! 
      `,
        `Присъединете се към нас за вълнуваща вечер на бордните игри в THE POKÉ LAB Amsterdam. Няма значение дали си падате по сериозните игри като шах или предпочитате забавното Монополи, със сигурност ще откриете нещо по Ваш вкус. С всеки закупен билет получавате бира или чаша вино по Ваш избор. Има само 25 налични билета, така че не се колебайте и последвайте линка в биото ни, за да закупите Вашия. Добре дошли сте от 19:00ч. Очакваме Ви!
      `,
      ],
      ticket_img: '/assets/images/tickets/amsterdam/ticket-1.jpg',
      images: ["/assets/images/portfolio/amsterdam/portfolio-1"],
      thumbnail: "/assets/images/portfolio/amsterdam/portfolio-1",
    },
  ]
}