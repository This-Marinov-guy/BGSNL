import React from "react";
import { FaGoogle, FaApple, FaMicrosoft } from "react-icons/fa";
import "../../../public/assets/scss/elements/_calendarSubscriptionComponent.scss";

const CalendarSubscriptionComponent = () => {
  const googleCalendarId = "8f0daebdf04f1aa6ad47325bda0405abd072547ff8e1ec0f62720bc836bac964@group.calendar.google.com";
  const googleCalendarPublicLink = `https://calendar.google.com/calendar/render?cid=${googleCalendarId}`;
  const icsLink = `https://calendar.google.com/calendar/ical/${googleCalendarId}/public/basic.ics`;
  const outlookWebLink = `https://outlook.office.com/owa/?path=/calendar/view/Month&src=${icsLink}`;
  const googleCalendarIframeSrc = `https://calendar.google.com/calendar/embed?height=400&wkst=2&ctz=Europe%2FAmsterdam&showPrint=0&showTabs=0&title=BGSNL%20Events&src=${googleCalendarId}`;

  return (
    <div className="calendar-subscription__area">
      <div className="rn-slick-dot">
        <div className="calendar-subscription__container">
          <h2 className="calendar-subscription__header">
            📅 Subscribe to Our Calendar
          </h2>
          <p className="calendar-subscription__description">
            Stay connected and never miss an event! Subscribe to our calendar on
            your preferred platform:
          </p>
          <div className="calendar-subscription__buttons">
            <a
              href={googleCalendarPublicLink}
              target="_blank"
              rel="noopener noreferrer"
              className="calendar-subscription__buttons-button calendar-subscription__buttons-button--google"
            >
              <FaGoogle className="calendar-subscription__icon" /> Add to Google
              Calendar
            </a>

            {/* downloads .ics file */}
            <a
              href={icsLink}
              download="calendar.ics"
              className="calendar-subscription__buttons-button calendar-subscription__buttons-button--apple"
              title="Download ICS file for Apple Calendar"
            >
              <FaApple className="calendar-subscription__icon" /> Download ICS
              File
            </a>

            <a
              href={outlookWebLink}
              target="_blank"
              rel="noopener noreferrer"
              className="calendar-subscription__buttons-button calendar-subscription__buttons-button--outlook"
            >
              <FaMicrosoft className="calendar-subscription__icon" /> Add to
              Outlook Calendar
            </a>
          </div>

          {/* google iframe calendar */}
          <div className="calendar-subscription__iframe-container">
            <iframe
              src={googleCalendarIframeSrc}
              title="Google Calendar"
              frameBorder="0"
              scrolling="no"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarSubscriptionComponent;
