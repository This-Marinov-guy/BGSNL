import React from "react";
import { Field, ErrorMessage } from "formik";

export const OTHER_EVENTS = [
  {
    region: "",
    membersOnly: true,
    visible: true,
    title: "PwC Career Pathways",
    // newTitle: "Career Day",
    // description: "Deloitte Bulgaria",
    bgImage: "4",
    bgImageExtra: "/assets/images/events/portfolio-2.3.png",
    date: "7-ми Януари",
    time: "15:00",
    timeStamp: "2025-01-07T15:00:00",
    ticketTimer: "2025-01-07T15:00:00",
    ticketLimit: 250,
    //   Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    correctedDate: "",
    correctedTime: "",
    where: `София, бул. Мария Луиза 9-11`,
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
    🌌 <strong>PwC и Българското общество в Нидерландия те канят на специално събитие!</strong><br><br>

    Обмисляш ли възможности за своето професионално развитие след университета? <br>
    Чудиш ли се какви знания и умения са ти необходими?<br><br>


    Научи повече за това как можеш да стартираш успешна кариера в България с PwC – глобална компания с мисия да развива младите таланти.

    В @ PwC Bulgaria вярват, че бъдещето принадлежи на тези, които са амбициозни, мотивирани и готови да разгърнат потенциала си. Затова на 7 януари 2025 г. са подготвили вълнуваща програма, която ще ти помогне да определиш своите силни страни и умения и да ги свържеш с правилния кариерен път. <br><br>

    Програма: <br>
    🌟 Открий своите силни страни: интерактивна сесия с Kameliya Damyanova (HR Leader for PwC SEE)<br><br>


    📢 История, която вдъхновява: Nadya Haralampieva е завършила в Нидерландия и ще разкаже за своето завръщане в България и първите стъпки към успешната кариера в PwC.<br><br>
    
    🤝 Networking: Възможност да се срещнеш с професионалисти от различни екипи на PwC, които също са учили в Нидерландия.  <br><br>
    
    Заповядай, получи ценни съвети и създай нови контакти!<br><br>

    👉  Важна информация: Събитието е с ограничен капацитет и задължителна регистрация за членове на обществото!
    `,
    freePass: ["vladislavmarinov3142@gmail.com"],
    marketingInputs: false,
    ticket_img: "/assets/images/events/ticket-2.png",
    images: [
      "/assets/images/events/portfolio-2.jpeg",
      "/assets/images/events/portfolio-2.2.png",
    ],
    poster: "/assets/images/events/portfolio-2.jpeg",
  },
];
