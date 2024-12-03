import React from "react";
import { Field, ErrorMessage } from "formik";

export const OTHER_EVENTS = [
  {
    region: "",
    membersOnly: true,
    visible: true,
    title: "Carrier Day",
    newTitle: "Career Day",
    description: "Deloitte Bulgaria",
    bgImage: "4",
    bgImageExtra: "/assets/images/events/portfolio-1.jpeg",
    date: "16th December",
    time: "14:00",
    timeStamp: "2024-12-16T14:00:00",
    ticketTimer: "2024-12-16T14:00:00",
    ticketLimit: 250,
    //   Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    correctedDate: "",
    correctedTime: "",
    where: `Mihail Tanev 4, Sofia, Bulgaria`,
    isMemberFree: true,
    entry: "Free",
    memberEntry: "Free",
    // including: ["(+ drink and snack)", "(+ drink and snack)"],
    // ticketLink:
    //   "https://www.tickettailor.com/events/hellenicassociationgroningen/1156915",
    // price_id: "price_1P7uhsIOw5UGbAo1fvnUj3yw",
    // memberPrice_id: "price_1P7uhsIOw5UGbAo1fvnUj3yw",
    // activeMemberPrice_id: "price_1P7uhsIOw5UGbAo1fvnUj3yw",
    text: `
    🌌 <strong>Launch Your Career into the Stratosphere!</strong><br><br>

    Ready to take the first step toward an extraordinary future? Want to earn your spot at 
    <strong>Deloitte’s Summer Business Camp</strong>? Join us at the 
    <strong>Career Day @ Deloitte Bulgaria</strong> and prepare to skyrocket your career 🚀<br><br>

    <strong>When?</strong> 16 December 2024 @ 2:00 PM - 6:00 PM<br>
    <strong>Where?</strong> Deloitte Bulgaria HQ (Ul. "Mihail Tenev" 4, Balkan Business Center)<br><br>

    <strong>Why attend?</strong><br>
    <ul>
      <li>🌠 Learn about Deloitte’s mission and values directly from the founder of the Deloitte office in Bulgaria–Silviya Peneva.</li>
      <li>👩‍🚀 Learn from the best: Engage in a panel discussion featuring senior team members sharing their career journeys and expertise.</li>
      <li>🔭 Get insider tips: Dive into a tailored session on internships and job application processes where you can ask all of your burning questions.</li>
      <li>✨ Expand your circle: End the day with informal networking with Deloitte professionals.</li>
    </ul><br>

    NB! This exclusive event is open to members only, and but member can invite a +1 to join the experience.

    Whether you’re looking for career inspiration, guidance, or opportunities, this event is your chance to make it happen! Don’t miss this unique opportunity to meet industry leaders, explore career pathways, and ask all your burning questions.
  `,
    freePass: ["vladislavmarinov3142@gmail.com"],
    marketingInputs: false,
    ticket_img: "/assets/images/events/ticket-1.jpg",
    images: [
      "/assets/images/events/3.jpg",
      "/assets/images/events/4.jpg",
      "/assets/images/events/5.jpg",
      "/assets/images/events/6.jpg",
    ],
    poster: "/assets/images/events/portfolio-1.1.jpeg",
  },
];
