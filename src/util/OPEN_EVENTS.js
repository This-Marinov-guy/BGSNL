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
  leeuwarden: [  ],
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
    {
      membersOnly: false,
      visible: true,
      title: "Bowling",
      // newTitle: 'Bulgarian Dinner',
      description: "Strike Out The Fun!",
      bgImage: "28",
      date: "15th June",
      time: "18:30",
      ticketTimer: '2024-06-15T18:30:00',
      ticketLimit: 60,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      // correctedDate: "",
      // correctedTime: "",
      where: `Knijn Bowling`,
      isMemberFree: false,
      entry: 10,
      memberEntry: 8,
      including: [],
      price_id: 'price_1PQURcIOw5UGbAo1k2uyF365',
      memberPrice_id: 'price_1PP8vyIOw5UGbAo1hj5jjiuD',
      activeMemberPrice_id: 'price_1PP8vyIOw5UGbAo1hj5jjiuD',
      freePass: ['vladislavmarinov3142@gmail.com'],
      marketingInputs: false,
      extraInputs: [{
        element: <div div className="col-12" >
          <Field as="select" name="extraOne">
            <option value="" disabled>
              Coming to the bar?
            </option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Field>
          <ErrorMessage
            className="error"
            name="extraOne"
            component="div"
          />
        </div>,
        required: true
      },],
      text: [
       `Присъединете се към нас за едно епично боулинг събитие в събота, 15-ти юни, в Knijn Bowling! Без значение дали сте опитен професионалист или ще дойдете просто да се забавлявате, това е идеалният шанс да покажете уменията си и да си прекарате повече от добре.
`,
`Но почакайте - забавлението не приключва на боулинг пистата! След боулинга ще се отправим за няколко заслужени питиета и още повече смях. (Скоро ще кажем и точната локация!)
Не пропускайте последното събитие за сезона - запазете датата и ще Ви очакваме с нетърпение! 
`,
`...`,
`Join us for an epic bowling event on Saturday, June 15th at Knijn Bowling! Whether you're a seasoned pro or just in it for the laughs, this is the perfect chance to show off your skills and have a blast.
`,
`But wait, the fun doesn’t stop at the lanes! After the bowling, we'll head over for some well-deserved drinks and even more laughs. (Location to be revealed soon!)
Don't miss out on the last event of the season - lock in the date and we can't wait to see you there!`
      ],
      ticket_img: '/assets/images/tickets/amsterdam/ticket-7.jpg',
      images: ["/assets/images/portfolio/amsterdam/portfolio-6"],
      thumbnail: "/assets/images/portfolio/amsterdam/portfolio-6",
    },
  ]
}
