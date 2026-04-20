import React from "react";
import { Field, ErrorMessage } from "formik";

export const OTHER_EVENTS = [
  {
    region: "",
    memberOnly: false,
    visible: true,
    title: "Gala Festival",
    // newTitle: "Career Day",
    // description: "Deloitte Bulgaria",
    bgImage: "19",
    bgImageExtra: "/assets/images/bg/bg-image-19.webp",
    date: "16th May",
    time: "14 pm",
    // 1 hour earlier than Netherlands / 2 than Bulgaria
    timeStamp: "2026-05-17T13:00:00",
    ticketTimer: "2026-05-17T13:00:00",
    ticketLimit: 100,
    //   Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    correctedDate: "",
    correctedTime: "",
    where: `Scheepsbouwweg 8 - Loft, Rotterdam`,
    isMemberFree: true,
    entry: "Free",
    memberEntry: "Free",
    // ticketLink:
    //   "https://jobs-cee.pwc.com/ce/en/job/687549WD/Offer-in-a-day-Financial-and-Audit-Analyst",
    // including: ["(+ drink and snack)", "(+ drink and snack)"],
    // ticketLink:
    //   "https://www.tickettailor.com/events/hellenicassociationgroningen/1156915",
    // price_id: "price_1P7uhsIOw5UGbAo1fvnUj3yw",
    // memberPrice_id: "price_1P7uhsIOw5UGbAo1fvnUj3yw",
    // activeMemberPrice_id: "price_1P7uhsIOw5UGbAo1fvnUj3yw",
    text: `
  <p>
    Join us for the <strong>Joint Gala Festival</strong>, an inspiring cultural gathering
    that celebrates identity, creativity, and youth through shared artistic expression.
    Under the theme <em>“Cultural Palette &amp; The Power of Youth”</em>, the event brings
    people together for an afternoon of folklore dance, live music, visual art, and
    meaningful connections.
  </p>

  <p>
    This festival highlights the energy of young people and the beauty of cultural
    diversity, creating a space where tradition and contemporary expression meet.
    Guests can expect a vibrant program filled with performances, artistic showcases,
    and opportunities to connect with others in a warm and festive atmosphere.
  </p>

  <p>
    Come celebrate culture in all its colors and experience a unique festival dedicated
    to community, creativity, and the power of youth.
  </p>

  <div class="event-sponsors">
    <p><strong>Sponsors:</strong> Cultuur Concreet, Domakin</p>
  </div>
    `,
    freePass: ["vladislavmarinov3142@gmail.com"],
    marketingInputs: false,
    ticket_img: "/assets/images/events/gala/ticket.png",
    images: [
      // "/assets/images/events/portfolio-2.jpeg",
      "/assets/images/events/gala/poster.png",
    ],
    poster: "/assets/images/events/gala/poster.png",
  },
];
