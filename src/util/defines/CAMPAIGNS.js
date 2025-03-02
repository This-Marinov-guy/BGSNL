import React from "react";
import ValidateCalendarSubscription from "../../elements/banners/ValidateCalendarSubscription";
import { isTodayInRange } from "../functions/helpers";

export const CAMPAIGNS = [
  {
    name: "Membership Month March",
    key: "membership_month_march",
    modal: {
      active: isTodayInRange("04-03", "03-31"),
      title: "Join our MMM campaign",
      description: `Want to travel in Netherlands and also go on an event for absolutely FREE?
        
        All members of BGSNL can win 2 round-trip train tickets and 2 event tickets of their choice from BGSNL!

        Winners will be drawn from each city!

        How to participate?

	    1.	You must have an active an paid membership for any of our cities
	    2.	You must have followed our Event Calendar that can be found in the list of future events

        Winners will be announced around the start of April. Good luck!
        `,
      images: [
        "/assets/images/campaigns/mmm/cover.png",
        // "/assets/images/campaigns/mmm/award.png",
      ],
      links: [
        { name: "Validate", href: "/user", isExternal: false },
        { name: "Explain", href: "instagram.com", isExternal: true },
      ],
    },
    news: {
      active: isTodayInRange("04-03", "03-31"),
      title: "Join our MMM campaign",
      description:
        "Want to travel in Netherlands and also go on an event for absolutely FREE? March is membership month and we have a special offer for you!",
      image: "/assets/images/campaigns/mmm/cover.png",
      links: [{ name: "", href: "", isExternal: false }],
    },
    banner: {
      active: isTodayInRange("04-03", "03-31"),
      title: "Join our MMM campaign",
      description:
        "Want to travel in Netherlands and also go on an event for absolutely FREE? March is membership month and we have a special offer for you!",
      image: "",
      links: [
        { name: "Validate", href: "/user", isExternal: false },
        { name: "Explain", href: "instagram.com", isExternal: true },
      ],
    },
    userAction: {
      active: isTodayInRange("04-03", "03-31"),
      component: <ValidateCalendarSubscription/>
    },
  },
];
