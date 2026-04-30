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
    bgImageExtra: "/assets/images/events/gala/background.jpg",
    date: "16th May",
    time: "13:30 pm",
    // 1 hour earlier than Netherlands / 2 than Bulgaria
    timeStamp: "2026-05-16T12:30:00",
    ticketTimer: "2026-05-16T12:30:00",
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
    text: `<p>
  The <strong>Bulgarian Society Netherlands</strong> and <strong>Het Succes</strong> invite you to this year’s
  <strong>Gala Festival</strong>, organized on the occasion of <strong>24 May</strong> —
  the Day of the Bulgarian Alphabet, Education, and Culture.
</p>

<p>
  This year’s theme is <em>“The Power of Youth”</em>: an evening dedicated to emerging
  voices and the expression of creativity through art, music, and dance. In the spirit
  of the celebration, we will honor Bulgarian education, cultural heritage, and the
  values that connect and inspire us wherever we are in the world.
</p>

<p>
  Guests can look forward to a rich and memorable program, including inspiring art
  exhibitions, live musical performances, a grand dance finale, elegant networking,
  catering and refreshing drinks, and three thematic cultural blocks throughout the
  evening.
</p>

<p>
  Join us for a festive cultural gathering dedicated to community, creativity, and the
  power of youth.
</p>`,
    marketingInputs: false,
    ticket_img: "/assets/images/events/gala/ticket.png",
    images: [
      // "/assets/images/events/portfolio-2.jpeg",
      "/assets/images/events/gala/poster.png",
    ],
    poster: "/assets/images/events/gala/poster.png",
  },
];
