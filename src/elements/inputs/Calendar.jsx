import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { FiCalendar } from "react-icons/fi";

const Calendar = (props) => {
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

export default Calendar;