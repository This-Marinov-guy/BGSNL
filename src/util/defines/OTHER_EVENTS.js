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
    ticketTimer: "2026-05-16T13:30:00",
    ticketLimit: 150,
    // Use correctedDate to publish a change to the date/time. Do not change the
    // initial date/time/timeStamp — that's the event's identity.
    // Format: full ISO timestamp with timezone, e.g. "2026-05-17T13:30:00+02:00"
    // (use the +02:00 / +03:00 offset for the timezone you typed the time in).
    // It is rendered in each viewer's local timezone.
    correctedDate: "",
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
  On behalf of the <strong>Bulgarian Society in the Netherlands</strong>, we have the honour of inviting you to attend the Gala Festival
  <strong>“Cultural Palette” &amp; “The Power of Youth”</strong>, organized together with the cultural foundation
  <strong>“Het Succes”</strong>.
</p>

<p>
  <strong>Date:</strong> 16 May 2026<br>
  <strong>Time:</strong> 13:30 – 18:30<br>
  <strong>Venue:</strong> RDM Next – Loft<br>
  <strong>Address:</strong> Scheepsbouwweg 8-Loft, 3089 JW Rotterdam, The Netherlands
  <br/>
  <strong>Formal dress code<br>
</p>

<p>
  The event aims to celebrate the richness of Bulgarian education and culture on the occasion of
  <strong>24 May</strong>, and to highlight the inspiring role of the younger generation in preserving
  and developing Bulgarian cultural identity in an international environment.
</p>

<p>
  The event will bring together representatives of the Bulgarian diaspora in the Netherlands,
  cultural organizations, partners, artists, and young talents.
</p>

<p>
  The program includes performances of Bulgarian folk dances, live music, artistic presentations,
  and opportunities for cultural exchange between the Bulgarian and Dutch communities.
</p>

<p>
  Your presence is valuable to our community, and we hope to see you at the event and celebrate
  this special occasion together.
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
