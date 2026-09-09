import {
  FaApple,
  GoogleBrandIcon,
  IconlyOutlook,
} from "@/elements/ui/icons/IconlyIcons";
import ImageFb from "../../elements/ui/media/ImageFb";
import {
  googleCalendarIframeSrc,
  googleCalendarPublicLink,
  icsLink,
  outlookWebLink,
} from "../../util/configs/google";
import "@assets/scss/elements/_calendarSubscriptionComponent.scss";

const CalendarSubscriptionComponent = () => {
  return (
    <div className="calendar-subscription__area">
      <div className="rn-slick-dot">
        <div className="calendar-subscription__container">
          <h2 className="calendar-subscription__header">
            <ImageFb
              className="calendar-subscription__header-icon"
              style={{ width: 52, height: 52 }}
              src={"/assets/images/svg/3d/calendar-3d.png"}
              fallback={"/assets/images/svg/3d/calendar-3d.png"}
              alt="Calendar"
            />{" "}
            Subscribe to Our Calendar
          </h2>
          <p className="calendar-subscription__description">
            Stay connected and never miss an event! Subscribe to our calendar on
            your preferred platform:
          </p>
          <div className="calendar-subscription__buttons">
            <span className="calendar-subscription__action">
              <a
                href={googleCalendarPublicLink}
                target="_blank"
                rel="noopener noreferrer"
                className="calendar-subscription__buttons-button calendar-subscription__buttons-button--google"
                aria-label="Add calendar to Google Calendar"
                aria-describedby="calendar-google-tooltip"
              >
                <GoogleBrandIcon className="calendar-subscription__icon" />
              </a>
              <span
                className="calendar-subscription__tooltip"
                id="calendar-google-tooltip"
                role="tooltip"
              >
                Add to Google Calendar
              </span>
            </span>

            {/* downloads .ics file */}
            <span className="calendar-subscription__action">
              <a
                href={icsLink}
                download="calendar.ics"
                className="calendar-subscription__buttons-button calendar-subscription__buttons-button--apple"
                aria-label="Download calendar for Apple Calendar"
                aria-describedby="calendar-apple-tooltip"
              >
                <FaApple className="calendar-subscription__icon" />
              </a>
              <span
                className="calendar-subscription__tooltip"
                id="calendar-apple-tooltip"
                role="tooltip"
              >
                Download for Apple Calendar
              </span>
            </span>

            <span className="calendar-subscription__action">
              <a
                href={outlookWebLink}
                target="_blank"
                rel="noopener noreferrer"
                className="calendar-subscription__buttons-button calendar-subscription__buttons-button--outlook"
                aria-label="Add calendar to Outlook"
                aria-describedby="calendar-outlook-tooltip"
              >
                <IconlyOutlook className="calendar-subscription__icon" />
              </a>
              <span
                className="calendar-subscription__tooltip"
                id="calendar-outlook-tooltip"
                role="tooltip"
              >
                Add to Outlook Calendar
              </span>
            </span>
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
