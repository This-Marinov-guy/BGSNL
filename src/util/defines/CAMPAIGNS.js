import React from "react";
import ValidateCalendarSubscription from "../../elements/banners/ValidateCalendarSubscription";
import { isTodayInRange } from "../functions/helpers";

export const CAMPAIGNS = [
  {
    name: "Membership Month March",
    key: "membership_month_march",
    modal: {
      active: isTodayInRange("03-03", "03-31"),
      title: "Join March Membership Month",
      description: `Want to travel across the Netherlands and attend an event for FREE?

All BGSNL members have a chance to win 2 round-trip train tickets and 2 event tickets of their choice from BGSNL!

Winners will be selected from each city!

How to participate:
1.⁠ ⁠You must have an active and paid membership for any of our cities.
2.⁠ ⁠You must follow our Event Calendar, which can be found in the list of upcoming events.
3. Leave a comment on the BGSNL campaign's Instagram post with a tag of a buddy you want to travel with. 

Winners will be announced at the beginning of April. Good luck!
`,
      images: [
        "/assets/images/campaigns/mmm/cover.png",
        // "/assets/images/campaigns/mmm/award.png",
      ],
      links: [
        { name: "Join", href: "/user", isExternal: false },
        {
          name: "Explain",
          href: "https://www.instagram.com/p/DGvu4Dftnwg",
          isExternal: true,
        },
      ],
      sponsors: [
        {
          image: "/assets/images/brand/brand-07.png",
          link: "https://domakin.nl/",
        },
      ],
    },
    navStrap: {
      active: isTodayInRange("03-03", "03-31"),
      // one liner please
      title: "March is Membership Month - join and win!",
      modal: "membership_month_march",
      links: [{ name: "", href: "", isExternal: false }],
    },
    news: {
      active: isTodayInRange("03-03", "03-31"),
      title: "March is Membership Month",
      description:
        "Want to travel in Netherlands and also go on an event for absolutely FREE? March is membership month and we have a special offer for you!",
      image: "/assets/images/campaigns/mmm/cover.png",
      links: [
        {
          name: "Learn more",
          href: "https://www.instagram.com/p/DGvu4Dftnwg",
          isExternal: false,
        },
      ],
      isForMember: true,
    },
    banner: {
      active: isTodayInRange("03-03", "03-31"),
      title: "Join March Membership Month",
      description:
        "Want to travel in Netherlands and also go on an event for absolutely FREE? March is membership month and we have a special offer for you!",
      image: "",
      links: [
        { name: "Join", href: "/user", isExternal: false },
        {
          name: "Explain",
          href: "https://www.instagram.com/p/DGvu4Dftnwg",
          isExternal: true,
        },
      ],
    },
    userAction: {
      active: isTodayInRange("03-03", "03-31"),
      component: <ValidateCalendarSubscription />,
    },
  },
];

export const getActiveStrap = () => {
  const activeCampaign = CAMPAIGNS.find(
    (campaign) => campaign?.navStrap?.active
  );

  const activeStrap = activeCampaign?.navStrap ?? null;

  if (activeStrap) {
    return activeStrap;
  } else {
    return null;
  }
};
