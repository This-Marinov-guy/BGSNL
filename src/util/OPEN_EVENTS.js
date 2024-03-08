import React from "react";
import { Field, ErrorMessage } from "formik";

// add ticket_link : '*link for the tickets' for outside ticket purchase
export const SOCIETY_EVENTS = {
  groningen: [
    {
      membersOnly: false,
      visible: true,
      title: "Entrepreneurship Series III",
      // newTitle: 'Bulgarian Dinner',
      description: "The awaited return",
      bgImage: "4",
      date: "9th March",
      time: "14:00",
      ticketTimer: '2024-03-09T10:00:00',
      ticketLimit: 25,
      //Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      correctedDate: "",
      correctedTime: "",
      where: `Cafe Lust / 2nd floor`,
      entry: 3,
      memberEntry: 3,
      // including: ['(includes a beer or non-alcoholic drink)', '(includes a beer or non-alcoholic drink)'],
      // ticket_link: 'https://www.tickettailor.com/events/hellenicassociationgroningen/1156915',
      price_id: 'price_1OofTLIOw5UGbAo1YQZNA9yg',
      memberPrice_id: 'price_1OofTLIOw5UGbAo1YQZNA9yg',
      activeMemberPrice_id: 'price_1OofTLIOw5UGbAo1YQZNA9yg',
      freePass: ['vlady1002@abv.bg'],
      extraInputs: false,
      text: [
        `Entrepreneurship Series are back!!! На 9ти март от 14:00 ч, в кафе Lust ще имате възможността да се срещнете с Елица Йорданова.
      `,
        `Чрез дейността си Елица доказва, че българската общност, традиции и култура са силно поддържани и извън границите на България. В Амстердам тя основава "Първо българско училище АБВ" и открива Българският културен и информационен център за Амстердам. Елица, подобно на BGSG, окуражава българите в Холандия да бъдат сплотени и да популяризират нашите традиции и култура.
      `,
        `Заповядайте да чуете повече за премеждията, през които Елица е преминала по пътя към своите постижения!
       `,
      ],
      ticket_img: '/assets/images/tickets/groningen/ticket-32.jpg',
      images: ["/assets/images/portfolio/groningen/portfolio-32", "/assets/images/events/groningen/entr3/1"],
      thumbnail: "/assets/images/portfolio/groningen/portfolio-32",
    },
    {
      membersOnly: false,
      visible: true,
      title: "Bulgarian Student Party",
      // newTitle: 'Bulgarian Dinner',
      description: "Dance the night away",
      bgImage: "24",
      date: "7th March",
      time: "22:00",
      ticketTimer: '2024-03-07T20:00:00',
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
        `Tickets are flying off the shelves like confetti, so grab yours now before it's too late!`,
        `Let's get this party started!`
      ],
      ticket_img: '/assets/images/tickets/groningen/ticket-31.jpg',
      images: ["/assets/images/portfolio/groningen/portfolio-31"],
      thumbnail: "/assets/images/portfolio/groningen/portfolio-31",
    },
  ],
  rotterdam: [

  ],
  leeuwarden: [
    
  ],
  breda: [
    
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

