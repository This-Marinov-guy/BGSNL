// Google Calendar
export const googleCalendarId =
  "8f0daebdf04f1aa6ad47325bda0405abd072547ff8e1ec0f62720bc836bac964@group.calendar.google.com";

export const googleCalendarPublicLink = `https://calendar.google.com/calendar/render?cid=${googleCalendarId}`;
export const icsLink = `https://calendar.google.com/calendar/ical/${googleCalendarId}/public/basic.ics`;
export const outlookWebLink = `https://outlook.office.com/owa/?path=/calendar/view/Month&src=${icsLink}`;
export const googleCalendarIframeSrc = `https://calendar.google.com/calendar/embed?height=400&wkst=2&ctz=Europe%2FAmsterdam&showPrint=0&showTabs=0&title=BGSNL%20Events&src=${googleCalendarId}`;
