import React from "react";
import { Field, ErrorMessage } from "formik";

// add ticket_link : '*link for the tickets' for outside ticket purchase
export const SOCIETY_EVENTS = {
  groningen: [
    // {
    //   membersOnly: false,
    //   visible: true,
    //   title: "Entrepreneurship Series III",
    //   // newTitle: 'Bulgarian Dinner',
    //   description: "The awaited return",
    //   bgImage: "4",
    //   date: "9th March",
    //   time: "14:00",
    //   ticketTimer: '2024-03-09T10:00:00',
    //   ticketLimit: 25,
    //   //Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
    //   correctedDate: "",
    //   correctedTime: "",
    //   where: `Cafe Lust / 2nd floor`,
    //   entry: 5,
    //   memberEntry: 4,
    //   // including: ['(includes a beer or non-alcoholic drink)', '(includes a beer or non-alcoholic drink)'],
    //   // ticket_link: 'https://www.tickettailor.com/events/hellenicassociationgroningen/1156915',
    //   price_id: 'price_1OmZVWIOw5UGbAo17Hn9aXxA',
    //   memberPrice_id: 'price_1OmZVmIOw5UGbAo19UJ43aNo',
    //   activeMemberPrice_id: 'price_1OmZW0IOw5UGbAo1sYulo8JA',
    //   freePass: ['vlady1002@abv.bg'],
    //   extraInputs: false,
    //   text: [
    //     `Feeling the urge to party like you're back in Bulgaria?  Then mark your calendars for the ultimate student party on the 7th  of March!
    //   `,
    //     `Get ready to dance to the hottest tunes!
    //   `,
    //     `Whether you're Bulgarian or just love the Balkan vibe, this is a night you don’t want to miss! 
    //    `,
    //     `Tickets are flying off the shelves like confetti, so grab yours now before it's too late!`,
    //     `Let's get this party started!`
    //   ],
    //   ticket_img: '/assets/images/tickets/groningen/ticket-32.jpg',
    //   images: ["/assets/images/portfolio/groningen/portfolio-32"],
    //   thumbnail: "/assets/images/portfolio/groningen/portfolio-32",
    // },
    {
      membersOnly: false,
      visible: true,
      title: "Bulgarian Student Party",
      // newTitle: 'Bulgarian Dinner',
      description: "Dance the night away",
      bgImage: "24",
      date: "7th March",
      time: "22:00",
      ticketTimer: '2024-03-07T22:00:00',
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
    {
      visible: true,
      subEvent: {
        description: 'You can purchase ticket ONLY for the party - Link below',
        links: [{ name: 'Click here', href: '/event-details/Bulgarian Party' }]
      },
      title: "Bulgarian Dinner",
      description: "For the national glory",
      bgImage: "22",
      date: "2nd March",
      time: "19:00",
      ticketTimer: '2024-03-02T19:00:00',
      ticketLimit: 100,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      correctedDate: "",
      correctedTime: "",
      where: `Fizz`,
      entry: 10,
      memberEntry: 10,
      including: ['+ free shot and drink', '+ free shot and drink'],
      price_id: 'price_1OlejBIOw5UGbAo1JBDpdV4q',
      memberPrice_id: 'price_1OlejBIOw5UGbAo1JBDpdV4q',
      activeMemberPrice_id: 'price_1OlejQIOw5UGbAo1R76ENtGI',
      discountPass: [
        'simonatodorova2216@gmail.com',
        'ivandikliev1@abv.bg',
        'nikoltoneva88@gmail.com',
        'dfawal@gmail.bg',
        'deamira.st23@gmail.com',
        'dimitrova04v@abv.bg',
        'melisa_hristova@abv.bg',
        'tonovivailo@gmail.com',
        'alistaneva@gmail.com',
        'danailova97@gmail.com',
        'miryana.b.ivanova@gmail.com',
        'vesi_it@abv.bg',
        'alex_ivanov2002@gmail.com',
        'bulgariansociety.lwd@gmail.com'
      ],
      freePass: ["vlady1002@abv.bg"],
      extraInputs: [
        {
          required: true,
          element: <div className="col-lg-12 col-md-12 col-12">
            <h3>Preferences</h3>
            <div className="rnform-group">
              <Field as="select" name="extraOne">
                <option value="" disabled>
                  Select your menu
                </option>
                <option value="meat">With meat</option>
                <option value="vegetarian">Vegetarian</option>

              </Field>
              <ErrorMessage
                className="error"
                name="extraOne"
                component="div"
              />
            </div>
          </div>
        },
        {
          required: true,
          element: <div className="col-lg-12 col-md-12 col-12">
            <div className="rnform-group">
              <Field as="select" name="extraTwo">
                <option value="" disabled>
                  Select your type
                </option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
              </Field>
              <small>*Only for vegetarians</small>
            </div>
          </div>
        }
      ],
      text: [
        `Celebrate the Bulgarian Independence Day with an iconic and memorable dinner and party here in Leeuwarden.🎉 
      `,
        `Ditch the boring Saturday evening and join us to welcome the Independence Day ✨and dwell into the Bulgarian spirit 
      `,
        'We will be welcoming you at Fizz at 19:00 with a shot of Rakiya 🥃 , piece of Pitka 🍞 with honey or mixed spices (sharena sol).🧂',
        `What to expect? 
      `,
        `•delicious appetizers 🍢
      `,
        `•heart-warming mea🍛
      `,
        `•soft and chewy dessert 🥧
      `,
        `To set the atmosphere DjZander will be playing your favourite hits with occasional horo breaks 💃
      `,
        `After the delicious meals, fun games and dances, the evening will continue at @lixx starting at 23:30 where the Dj will make you feel at home with Bulgarian hits 🎵`,
        `Not only that but a free shot 🥃 will be waiting for you when you enter the club’s doors 🎉`,
        `Bring your patriotism and party mood and be ready for a memorable night! 🌙 🎉 `,
      ],
      ticket_img: '/assets/images/tickets/leeuwarden/ticket-5.jpg',
      images: ["/assets/images/events/leeuwarden/freedom1/1", "/assets/images/events/leeuwarden/freedom1/2"],
      thumbnail: "/assets/images/portfolio/leeuwarden/portfolio-5",
    },
    {
      visible: false,
      subEvent: {
        description: 'You can purchase combined ticket for dinner and party - Link below',
        links: [
          { name: 'Click Here', href: '/event-details/Bulgarian Dinner' }
        ]
      },
      title: "Bulgarian Party",
      description: "Liberation party",
      bgImage: "24",
      date: "2nd March",
      time: "23:30",
      ticketTimer: '2024-03-02T23:00:00',
      ticketLimit: 100,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      correctedDate: "",
      correctedTime: "",
      where: `Club Lixx`,
      entry: 5,
      memberEntry: 5,
      including: ['+ free shot', '+ free shot'],
      price_id: 'price_1OlelKIOw5UGbAo1WXW9a1tC',
      memberPrice_id: 'price_1OlelKIOw5UGbAo1WXW9a1tC',
      activeMemberPrice_id: 'price_1OlelnIOw5UGbAo18Jz8wczU',
      discountPass: [
        'simonatodorova2216@gmail.com',
        'ivandikliev1@abv.bg',
        'nikoltoneva88@gmail.com',
        'dfawal@gmail.bg',
        'deamira.st23@gmail.com',
        'dimitrova04v@abv.bg',
        'melisa_hristova@abv.bg',
        'tonovivailo@gmail.com',
        'alistaneva@gmail.com',
        'danailova97@gmail.com',
        'miryana.b.ivanova@gmail.com',
        'vesi_it@abv.bg',
        'alex_ivanov2002@gmail.com',
        'bulgariansociety.lwd@gmail.com'
      ],
      freePass: ["vlady1002@abv.bg"],
      extraInputs: false,
      text: [
        `Celebrate the Bulgarian Independence Day with an iconic and memorable party here in Leeuwarden.🎉 
      `,
        `The evening continues after a great meal at @lixx starting at 23:30 where the Dj will make you feel at home with Bulgarian hits 🎵`,
        `Not only that but a free shot 🥃 will be waiting for you when you enter the club’s doors 🎉`,
        `Bring your patriotism and party mood and be ready for a memorable night! 🌙 🎉 `,
      ],
      ticket_img: '/assets/images/tickets/leeuwarden/ticket-1.jpg',
      images: ["/assets/images/events/leeuwarden/freedom1/1"],
      thumbnail: "/assets/images/portfolio/leeuwarden/portfolio-5",
    },
  ],
  breda: [
    {
      visible: true,
      subEvent: {
        description: 'You can purchase ticket ONLY for either the dinner or the party - Link below',
        links: [{ name: 'Dinner Only', href: '/event-details/Bulgarian Dinner' }, { name: 'Party Only', href: '/event-details/Bulgarian Party' }]
      },
      title: "Bulgarian Dinner & Party",
      description: `Let’s celebrate 1st of March (Baba Marta) together!🤍❤`,
      bgImage: "12",
      date: "1st March",
      time: "18:00",
      ticketTimer: '2024-02-01T18:00:00',
      ticketLimit: 0,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      correctedDate: "",
      correctedTime: "",
      where: ` Easystreet (Vijfhagen, 4812 XT Breda)`,
      entry: 10,
      memberEntry: 10,
      including: ['', ''],
      price_id: 'price_1OmrEUIOw5UGbAo1zQmfkHRd',
      memberPrice_id: 'price_1OmrEUIOw5UGbAo1zQmfkHRd',
      activeMemberPrice_id: 'price_1OmrEUIOw5UGbAo1zQmfkHRd',
      discountPass: [
      ],
      freePass: ["vlady1002@abv.bg"],
      extraInputs: [
        {
          required: true,
          element: <div className="col-lg-12 col-md-12 col-12">
            <h3>Preferences</h3>
            <div className="rnform-group">
              <Field as="select" name="extraOne">
                <option value="" disabled>
                  Select your main course
                </option>
                <option value="musaka">Musaka</option>
                <option value="pepers">Stuffed peppers</option>

              </Field>
              <ErrorMessage
                className="error"
                name="extraOne"
                component="div"
              />
            </div>
          </div>
        },
        {
          required: true,
          element: <div className="col-lg-12 col-md-12 col-12">
            <div className="rnform-group">
              <Field as="select" name="extraTwo">
                <option value="" disabled>
                  Select your drink
                </option>
                <option value="beer">Beer</option>
                <option value="wine">Wine</option>
                <option value="fanta">Fanta</option>
                <option value="cola">Cola</option>
                <option value="ice tea">Ice Tea</option>

              </Field>
              <ErrorMessage
                className="error"
                name="extraTwo"
                component="div"
              />
            </div>
          </div>
        }
      ],
      text: [
        `We are delighted to invite you to our very first event — a dinner and party to celebrate Baba Marta, the cherished Bulgarian holiday marking the arrival of spring!🌸
      `,
        `Indulge in the flavors of Bulgaria with a traditional dinner including 3-course meal starting with a piece of banitsa, continuing with moussaka (or stuffed peppers 🫑 ) and finishing with buscuit cake 🍰 . Let's gather together to savor these delicious tastes and celebrate the warmth of springtime!
        We’ll be welcoming you with a shot of Rakiya and martenitsa!🥃
        
      `,
        `Following dinner, the festivities will continue at Proost starting at 22:30 with the best Bulgarian hits secured by DjZander. 🪩
        Get ready to immerse yourself in Bulgarian culture as we dance the night away and create unforgettable memories together.
      `,
        `Come dressed in your best red and white outfits to honor the spirit of Baba Marta and embrace our traditions.
        We can't wait to share this special evening with you and kick off a year filled with joy, friendship, and Bulgarian culture        
      `,
        `❗TICKETS ARE VERY LIMITED SO MAKE SURE TO SECURE YOURS BEFORE THEY SELL OUT❗
      `,
      ],
      ticket_img: '/assets/images/tickets/breda/ticket-3.jpg',
      images: ["/assets/images/portfolio/breda/portfolio-1"],
      thumbnail: "/assets/images/portfolio/breda/portfolio-1",
    },
    {
      visible: false,
      subEvent: {
        description: 'You can purchase ticket for the Party and Dinner',
        links: [{ name: 'Click Here', href: '/event-details/Bulgarian Dinner & Party' }]
      },
      title: "Bulgarian Dinner",
      description: `Let’s celebrate 1st of March (Baba Marta) together!🤍❤`,
      bgImage: "22",
      date: "1st March",
      time: "18:00",
      ticketTimer: '2024-02-01T18:00:00',
      ticketLimit: 0,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      correctedDate: "",
      correctedTime: "",
      where: ` Easystreet (Vijfhagen, 4812 XT Breda)`,
      entry: 7,
      memberEntry: 7,
      including: ['', ''],
      price_id: 'price_1OmrF5IOw5UGbAo1iuzvw5rC',
      memberPrice_id: 'price_1OmrF5IOw5UGbAo1iuzvw5rC',
      activeMemberPrice_id: 'price_1OmrF5IOw5UGbAo1iuzvw5rC',
      discountPass: [
      ],
      freePass: ["vlady1002@abv.bg"],
      extraInputs: [
        {
          required: true,
          element: <div className="col-lg-12 col-md-12 col-12">
            <h3>Preferences</h3>
            <div className="rnform-group">
              <Field as="select" name="extraOne">
                <option value="" disabled>
                  Select your main course
                </option>
                <option value="musaka">Musaka</option>
                <option value="pepers">Stuffed peppers</option>

              </Field>
              <ErrorMessage
                className="error"
                name="extraOne"
                component="div"
              />
            </div>
          </div>
        },
        {
          required: true,
          element: <div className="col-lg-12 col-md-12 col-12">
            <div className="rnform-group">
              <Field as="select" name="extraTwo">
                <option value="" disabled>
                  Select your drink
                </option>
                <option value="beer">Beer</option>
                <option value="wine">Wine</option>
                <option value="fanta">Fanta</option>
                <option value="cola">Cola</option>
                <option value="ice tea">Ice Tea</option>
              </Field>
              <ErrorMessage
                className="error"
                name="extraOne"
                component="div"
              />
            </div>
          </div>
        }
      ],
      text: [
        `We are delighted to invite you to our very first event — a dinner and party to celebrate Baba Marta, the cherished Bulgarian holiday marking the arrival of spring!🌸
      `,
        `Indulge in the flavors of Bulgaria with a traditional dinner including 3-course meal starting with a piece of banitsa, continuing with moussaka (or stuffed peppers 🫑 ) and finishing with buscuit cake 🍰 . Let's gather together to savor these delicious tastes and celebrate the warmth of springtime!
        We’ll be welcoming you with a shot of Rakiya and martenitsa!🥃
        
      `,
        `Come dressed in your best red and white outfits to honor the spirit of Baba Marta and embrace our traditions.
        We can't wait to share this special evening with you and kick off a year filled with joy, friendship, and Bulgarian culture        
      `,
        `❗TICKETS ARE VERY LIMITED SO MAKE SURE TO SECURE YOURS BEFORE THEY SELL OUT❗
      `,
      ],
      ticket_img: '/assets/images/tickets/breda/ticket-1.jpg',
      images: ["/assets/images/portfolio/breda/portfolio-1"],
      thumbnail: "/assets/images/portfolio/breda/portfolio-1",
    },
    {
      visible: false,
      subEvent: {
        description: 'You can purchase ticket for the Party and Dinner',
        links: [{ name: 'Click Here', href: '/event-details/Bulgarian Dinner & Party' }]
      },
      title: "Bulgarian Party",
      description: `Let’s celebrate 1st of March (Baba Marta) together!🤍❤`,
      bgImage: "24",
      date: "1st March",
      time: "22:30",
      ticketTimer: '2024-03-01T18:00:00',
      ticketLimit: 80,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      correctedDate: "",
      correctedTime: "",
      where: `Proost club`,
      entry: 5,
      memberEntry: 5,
      including: ['', ''],
      price_id: 'price_1OmrErIOw5UGbAo1qh8jHtnp',
      memberPrice_id: 'price_1OmrErIOw5UGbAo1qh8jHtnp',
      activeMemberPrice_id: 'price_1OmrErIOw5UGbAo1qh8jHtnp',
      discountPass: [
      ],
      freePass: ["vlady1002@abv.bg"],
      extraInputs: [
      ],
      text: [
        `We are delighted to invite you to our very first event — a dinner and party to celebrate Baba Marta, the cherished Bulgarian holiday marking the arrival of spring!🌸
      `,
      ,
        `Starting at 22:30 in Proost with the best Bulgarian hits secured by DjZander. 🪩
        Get ready to immerse yourself in Bulgarian culture as we dance the night away and create unforgettable memories together.
      `,
        `Come dressed in your best red and white outfits to honor the spirit of Baba Marta and embrace our traditions.
        We can't wait to share this special evening with you and kick off a year filled with joy, friendship, and Bulgarian culture        
      `,
      ],
      ticket_img: '/assets/images/tickets/breda/ticket-2.jpg',
      images: ["/assets/images/portfolio/breda/portfolio-1"],
      thumbnail: "/assets/images/portfolio/breda/portfolio-1",
    },
  ],
  maastricht: [
    {
      visible: true,
      title: "Bulgarian Party",
      description: `Celebrate the Freedom`,
      bgImage: "24",
      date: "2nd March",
      time: "21:30",
      ticketTimer: '2024-03-02T23:00:00',
      ticketLimit: 0,
      // Use the corrected date and time for changes in the date or time. Do not change the initial ones as it will make a new event in the DB
      correctedDate: "",
      correctedTime: "",
      where: `Rendezvous `,
      entry: '8 | 10 | 13',
      memberEntry: '8 | 10 | 13',
      including: ['', ''],
      ticket_link: 'https://eventix.shop/8qquqxef',
      price_id: '',
      memberPrice_id: '',
      activeMemberPrice_id: '',
      discountPass: [
      ],
      freePass: ["vlady1002@abv.bg"],
      extraInputs: false,
      text: [
        `On the second of March (02.03) at 📍Rendezvous we invite you to celebrate our National Holiday 🇧🇬 with banitsa and a free shot at the entrance!`,
        `The party will start at 21.30 and at 23.00 we will be closing the doors! We have prepared fun games to entertain you in the beginning of the party ,we will listen and dance to bulgarian music and so much more that you will only know if you come!🎉
      `,
        `You can find tickets through the eventix platform, by clicking the button below
      `,
      ],
      ticket_img: '',
      images: ["/assets/images/portfolio/maastricht/portfolio-1"],
      thumbnail: "/assets/images/portfolio/maastricht/portfolio-1",
    },
  ]
}

