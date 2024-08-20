import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { FiCalendar, FiClock } from "react-icons/fi";

export const Calendar = (props) => {
    const [selected, setSelected] = useState();
    const [isOpen, setIsOpen] = useState(false);

    const toggleCalendar = () => {
        setIsOpen(!isOpen);
    };

    const handleDateSelect = (date) => {
        setSelected(date);
        props.onSelect(date);
        setIsOpen(false);
    };

    return (
        <>
            <div className="rn-form-group center_div mt--20">
                <input
                    type="text"
                    value={selected ? selected.toLocaleDateString() : ""}
                    placeholder={props.placeholder ?? "Select a date"}
                    onClick={toggleCalendar}
                />
                <FiCalendar
                    onClick={toggleCalendar}
                    style={{
                        cursor: "pointer",
                    }}
                />
            </div>
            {isOpen && (
                <div className="calendar">
                    <DayPicker
                        mode="single"
                        locale='en-nl'
                        captionLayout="dropdown"
                        selected={selected}
                        onSelect={handleDateSelect}
                    />
                </div>
            )}
        </>
    );
}

export const CalendarWithClock = (props) => {
    const [selected, setSelected] = useState();
    const [timeValue, setTimeValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const toggleCalendar = () => {
        setIsOpen(!isOpen);
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
            props.onSelect(null);
            return;
        }

        if (timeValue) {
            const [hours, minutes] = timeValue.split(":").map((str) => parseInt(str, 10));
            const newDate = new Date(date);
            newDate.setHours(hours);
            newDate.setMinutes(minutes);
            setSelected(newDate);
            props.onSelect(newDate);
        } else {
            setSelected(date);
            props.onSelect(null);
        }
    };

    const formatDateTime = (date) => {
        if (!date) return "";
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <div className="rn-form-group center_div" style={{ marginTop: '7px' }}>
            <input
                type="text"
                value={selected && timeValue ? formatDateTime(selected) : ""}
                placeholder={props.placeholder ?? "Select date & time"}
                onClick={toggleCalendar}
                readOnly
            />
            <div onClick={toggleCalendar}
                style={{
                    display: "flex",
                    alignItems: 'center',
                    cursor: "pointer",
                }}>
                <FiCalendar />/
                <FiClock />
            </div>

            {isOpen && (
                <div className="calendar" style={{ marginBlockEnd: "1em" }}>
                    <input
                        type="time"
                        value={timeValue}
                        onChange={handleTimeChange}
                        style={{ marginBottom: "10px" }}
                    />
                    <DayPicker
                        mode="single"
                        locale='en-nl'
                        captionLayout="dropdown"
                        selected={selected}
                        onSelect={handleDaySelect}
                    />
                </div>
            )}
        </div>
    );
}