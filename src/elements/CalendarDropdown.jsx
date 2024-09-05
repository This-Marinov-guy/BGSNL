import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGoogle,
  faMicrosoft,
  faApple,
} from "@fortawesome/free-brands-svg-icons";

const CalendarDropdown = () => {
  const [selectedCalendar, setSelectedCalendar] = useState(null);

  const calendarOptions = [
    {
      label: "Google Calendar",
      value: "google",
      icon: <FontAwesomeIcon icon={faGoogle} />,
    },
    {
      label: "Outlook Calendar",
      value: "outlook",
      icon: <FontAwesomeIcon icon={faMicrosoft} />,
    },
    {
      label: "Apple Calendar",
      value: "apple",
      icon: <FontAwesomeIcon icon={faApple} />,
    },
  ];

  const calendarName = "Bulgarian Society";

  const handleCalendarSelection = (e) => {
    const selectedValue = e.value;
    switch (selectedValue) {
      case "google":
        window.open(
          `https://www.google.com/calendar/render?cid=${encodeURIComponent(
            process.env.CALENDAR_PUBLIC_ADRESS
          )}&name=${encodeURIComponent(calendarName)}`,
          "_blank"
        );
        break;
      case "outlook":
        window.open(
          `https://outlook.live.com/owa/?path=/calendar/action/compose&rru=addsubscription&url=${encodeURIComponent(
            process.env.CALENDAR_PUBLIC_ADRESS
          )}&name=${encodeURIComponent(calendarName)}`,
          "_blank"
        );
        break;
      case "apple":
        window.open(process.env.CALENDAR_PUBLIC_ADRESS, "_blank");
        break;
      default:
        break;
    }

    setSelectedCalendar(null);
  };

  return (
    <div
      style={{
        marginTop: "20px",
        backgroundColor: "var(--background-color)",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <div className="row mb--40">
        <div className="col-lg-12">
          <div className="section-title service-style--3 text-left mb--8">
            <h4
              style={{
                fontFamily: "Arial, sans-serif",
                fontWeight: "900",
              }}
            >
              SUBSCRIBE TO THE BULGARIAN SOCIETY'S CALENDAR
            </h4>
          </div>
        </div>
      </div>
      {/* <div className="row"> */}
      <div>
        <div className="col-lg-6 col-md-8 col-sm-10">
          <Dropdown
            value={selectedCalendar}
            options={calendarOptions.map((option) => ({
              label: (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "5px",
                  }}
                >
                  {option.icon}{" "}
                  <span style={{ marginLeft: "8px" }}>{option.label}</span>
                </div>
              ),
              value: option.value,
            }))}
            onChange={handleCalendarSelection}
            placeholder="Select a Calendar"
            className="p-dropdown"
            panelStyle={{ overflow: "hidden", maxHeight: "none" }}
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarDropdown;
