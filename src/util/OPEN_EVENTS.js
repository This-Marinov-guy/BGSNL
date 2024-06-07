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
      bgImage: "7",
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
    //   title: "Picnic",
    //   newTitle: 'Bulgarian Dinner',
    //   description: "Join Us for a picnic and BBQ!",
    //   bgImage: "7",
    //   date: "15th June",
    //   time: "14:00",
    //   ticketTimer: '2024-06-15T14:00:00',
    //   ticketLimit: 40,
    //   Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    //   correctedDate: "",
    //   correctedTime: "",
    //   where: `Westerpark Park`,
    //   isMemberFree: false,
    //   entry: 10,
    //   memberEntry: 8,
    //   including: [],
    //   price_id: 'price_1PP8vlIOw5UGbAo1GBLeepV1',
    //   memberPrice_id: 'price_1PP8vyIOw5UGbAo1hj5jjiuD',
    //   activeMemberPrice_id: 'price_1PP8vyIOw5UGbAo1hj5jjiuD',
    //   freePass: ['vladislavmarinov3142@gmail.com'],
    //   marketingInputs: false,
    //   extraInputs: [{
    //     element: <div div className="col-12" >
    //       <Field as="select" name="extraOne">
    //         <option value="" disabled>
    //           Select menu
    //         </option>
    //         <option value="Meat">Meat</option>
    //         <option value="vegetarian">Vegetarian</option>
    //       </Field>
    //       <ErrorMessage
    //         className="error"
    //         name="extraOne"
    //         component="div"
    //       />
    //     </div>,
    //     required: true
    //   },],
    //   text: [
    //     `Присъеди се към нас за вкусно барбекю в парка на 15.06 от 14.00 в Westerpark! Ние ти предлагаме скара, напитка и добра компания, а от теб очакваме да вземеш само доброто си настроение! С това събитие ще закрием сезона за тази учебна година и ще се видим отново с пълна сила от септември! Очакваме те!`,
    //     `...`,
    //     `Join us for a delicious barbecue in the park on 15.06 from 14.00 at Westerpark! We offer you a bite, a drink and good company, and we expect you to take your best mood! With this event, we will close the season for this school year and will see you again in for new exiting events from September! We are waiting for you!`
    //   ],
    //   ticket_img: '/assets/images/tickets/amsterdam/ticket-6.jpg',
    //   images: ["/assets/images/portfolio/amsterdam/portfolio-6"],
    //   thumbnail: "/assets/images/portfolio/amsterdam/portfolio-6",
    // },
  ]
}
