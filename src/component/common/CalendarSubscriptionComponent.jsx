import React from "react";
import { FaGoogle, FaApple, FaMicrosoft } from "react-icons/fa";

const CalendarSubscriptionComponent = () => {
  // todo: replace with actual ids
  const googleCalendarId = "your_calendar_id@gmail.com";
  const googleCalendarPublicLink = `https://calendar.google.com/calendar/embed?src=${googleCalendarId}&ctz=Europe/Amsterdam`;
  const icsLink = `https://calendar.google.com/calendar/ical/${googleCalendarId}/public/basic.ics`;

  return (
    <div className="portfolio-area pt--40 pb--10 bg_color--5">
      <div className="rn-slick-dot">
        <div className="container">
          <div style={styles.container}>
            <h2 style={styles.header}>📅 Subscribe to Our Calendar</h2>
            <p style={styles.description}>
              Stay connected and never miss an event! Subscribe to our calendar
              on your preferred platform:
            </p>
            <div style={styles.buttonsContainer}>
              <a
                href={googleCalendarPublicLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...styles.button }}
              >
                <FaGoogle style={styles.icon} /> Add to Google Calendar
              </a>
              <a href={icsLink} style={{ ...styles.button }}>
                <FaApple style={styles.icon} /> Add to Apple Calendar
              </a>
              <a href={icsLink} style={{ ...styles.button }}>
                <FaMicrosoft style={styles.icon} /> Add to Outlook Calendar
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "20px auto",
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    fontFamily: "'Roboto', sans-serif",
  },
  header: {
    fontSize: "24px",
    marginBottom: "10px",
    color: "#333",
  },
  description: {
    fontSize: "16px",
    marginBottom: "20px",
    color: "#555",
  },
  buttonsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "5px",
    transition: "background-color 0.3s ease",
    cursor: "pointer",
    fontWeight: "bold",
    backgroundColor: "#2a6e5e",
  },
  icon: {
    fontSize: "18px",
  },
};

export default CalendarSubscriptionComponent;
