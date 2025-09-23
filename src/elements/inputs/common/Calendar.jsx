import React, { useState, useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { FiCalendar, FiClock } from "react-icons/fi";

export const Calendar = (props) => {
  const [selected, setSelected] = useState(props.initialValue);
  const [inputValue, setInputValue] = useState(
    props.initialValue ? formatDateToString(new Date(props.initialValue)) : ""
  );
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const formatDateToString = (date) => {
    if (!date) return "";
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;

    // Handle different separators (/ or -)
    const parts = dateString.split(/[/-]/);
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    // Add century if year is given in 2 digits
    const fullYear =
      year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;

    const date = new Date(fullYear, month, day);

    // Validate parsed date
    if (
      date.getDate() !== day ||
      date.getMonth() !== month ||
      date.getFullYear() !== fullYear ||
      !isFinite(date)
    ) {
      return null;
    }

    return date;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Only attempt to parse and update if we have a complete date string
    if (value.length >= 8) {
      const parsedDate = parseDate(value);
      if (parsedDate) {
        setSelected(parsedDate);
        props.onSelect(parsedDate);
      }
    }
  };

  const handleKeyDown = (e) => {
    // Allow only numbers, forward slash, backspace, delete, and arrow keys
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ];
    if (!allowedKeys.includes(e.key) && !/[\d/]/.test(e.key)) {
      e.preventDefault();
    }

    // Auto-insert slashes
    if (e.key !== "Backspace" && e.key !== "Delete") {
      const value = e.target.value;
      if (value.length === 2 || value.length === 5) {
        setInputValue(value + "/");
      }
    }
  };

  const handleDateSelect = (date) => {
    setSelected(date);
    setInputValue(date ? formatDateToString(date) : "");
    props.onSelect(date);
    setIsOpen(false);
  };

  return (
    <div
      className="rn-form-group center_div"
      style={{ marginTop: "15px", position: "relative" }}
      ref={calendarRef}
    >
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={props.placeholder ?? "dd/mm/yyyy"}
        onClick={() => setIsOpen(true)}
        maxLength="10"
      />
      <FiCalendar
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: "pointer",
        }}
      />
      {isOpen && (
        <div
          className="calendar"
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            right: "0",
            zIndex: 1000,
            backgroundColor: "white",
            border: "1px solid #e9ecef",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            marginTop: "4px",
            padding: "0",
          }}
        >
          <DayPicker
            mode="single"
            locale="en-nl"
            captionLayout="dropdown"
            selected={selected}
            onSelect={handleDateSelect}
          />
        </div>
      )}
    </div>
  );
};

export const CalendarWithClock = (props) => {
  const initialValue = props.initialValue ? new Date(props.initialValue) : "";

  const [selected, setSelected] = useState(initialValue);
  const [inputValue, setInputValue] = useState(
    initialValue ? formatDateTimeToString(initialValue) : ""
  );
  const [timeValue, setTimeValue] = useState(
    initialValue
      ? `${initialValue.getHours().toString().padStart(2, "0")}:${initialValue
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      : ""
  );
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef(null);

  function formatDateTimeToString(date) {
    if (!date) return "";
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }

  const parseDateTime = (dateTimeString) => {
    if (!dateTimeString) return null;

    const [datePart, timePart] = dateTimeString.split(" ");
    if (!datePart || !timePart) return null;

    const parts = datePart.split(/[/-]/);
    if (parts.length !== 3) return null;

    const [hours, minutes] = timePart
      .split(":")
      .map((num) => parseInt(num, 10));
    if (isNaN(hours) || isNaN(minutes)) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    // Add century if year is given in 2 digits
    const fullYear =
      year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;

    const date = new Date(fullYear, month, day, hours, minutes);

    // Validate parsed date
    if (
      date.getDate() !== day ||
      date.getMonth() !== month ||
      date.getFullYear() !== fullYear ||
      !isFinite(date) ||
      hours >= 24 ||
      minutes >= 60
    ) {
      return null;
    }

    return date;
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length >= 16) {
      // Minimum length for a complete date-time string
      const parsedDateTime = parseDateTime(value);
      if (parsedDateTime) {
        setSelected(parsedDateTime);
        setTimeValue(
          `${parsedDateTime
            .getHours()
            .toString()
            .padStart(2, "0")}:${parsedDateTime
            .getMinutes()
            .toString()
            .padStart(2, "0")}`
        );
        props.onSelect(parsedDateTime);
      }
    }
  };

  const handleKeyDown = (e) => {
    // Allow only numbers, forward slash, colon, space, backspace, delete, and arrow keys
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      " ",
      ":",
    ];
    if (!allowedKeys.includes(e.key) && !/[\d]/.test(e.key)) {
      e.preventDefault();
    }

    // Auto-insert formatting characters
    if (e.key !== "Backspace" && e.key !== "Delete") {
      const value = e.target.value;
      if (value.length === 2 || value.length === 5) {
        setInputValue(value + "/");
      } else if (value.length === 10) {
        setInputValue(value + " ");
      } else if (value.length === 13) {
        setInputValue(value + ":");
      }
    }
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setTimeValue(time);

    if (selected) {
      const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
      const newSelectedDate = new Date(selected);
      newSelectedDate.setHours(hours);
      newSelectedDate.setMinutes(minutes);
      setSelected(newSelectedDate);
      setInputValue(formatDateTimeToString(newSelectedDate));
      if (time && selected) {
        props.onSelect(newSelectedDate);
      } else {
        props.onSelect(null);
      }
    }
  };

  const handleDaySelect = (date) => {
    if (!date) {
      setSelected(undefined);
      setInputValue("");
      props.onSelect(null);
      return;
    }

    if (timeValue) {
      const [hours, minutes] = timeValue
        .split(":")
        .map((str) => parseInt(str, 10));
      const newDate = new Date(date);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      setSelected(newDate);
      setInputValue(formatDateTimeToString(newDate));
      props.onSelect(newDate);
    } else {
      setSelected(date);
      setInputValue(formatDateTimeToString(date));
      props.onSelect(null);
    }
  };

  return (
    <div
      className="rn-form-group center_div"
      style={{ marginTop: "7px", position: "relative" }}
      ref={calendarRef}
    >
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={props.placeholder ?? "dd/mm/yyyy hh:mm"}
        onClick={() => setIsOpen(true)}
        maxLength="16"
      />
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <FiCalendar />/
        <FiClock />
      </div>

      {isOpen && (
        <div
          className="calendar"
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            right: "0",
            zIndex: 1000,
            backgroundColor: "white",
            border: "1px solid #e9ecef",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            marginTop: "4px",
            padding: "0",
          }}
        >
          <input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            style={{
              margin: "8px 8px 4px 8px",
              width: "calc(100% - 16px)",
              maxWidth: "120px",
              padding: "4px 6px",
              border: "1px solid #e9ecef",
              borderRadius: "4px",
            }}
          />
          <div style={{ padding: "0" }}>
            <DayPicker
              mode="single"
              locale="en-nl"
              captionLayout="dropdown"
              selected={selected}
              onSelect={handleDaySelect}
              disabled={
                props.min && {
                  before: props.min,
                }
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
