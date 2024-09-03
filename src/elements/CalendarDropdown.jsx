import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faMicrosoft, faApple } from '@fortawesome/free-brands-svg-icons';

const CalendarDropdown = () => {
    const [selectedCalendar, setSelectedCalendar] = useState(null);

    const calendarOptions = [
        { label: 'Google Calendar', value: 'google', icon: <FontAwesomeIcon icon={faGoogle} /> },
        { label: 'Outlook Calendar', value: 'outlook', icon: <FontAwesomeIcon icon={faMicrosoft} /> },
        { label: 'Apple Calendar', value: 'apple', icon: <FontAwesomeIcon icon={faApple} /> }
    ];

    const handleCalendarSelection = (e) => {
        setSelectedCalendar(e.value);
        switch (e.value) {
            case 'google':
                window.open('https://calendar.google.com/calendar/r', '_blank');
                break;
            case 'outlook':
                window.open('https://outlook.live.com/calendar/', '_blank');
                break;
            case 'apple':
                alert('For Apple Calendar, please download the .ics file and import it into your calendar.');
                break;
            default:
                break;
        }
    };

    return (
        <div style={{ marginTop: '20px', backgroundColor: 'var(--background-color)', padding: '20px', borderRadius: '10px' }}>
            <div className="row mb--40">
                <div className="col-lg-12">
                    <div className="section-title service-style--3 text-left mb--15">
                        <h4 className="title">Add to Calendar</h4>
                    </div>
                </div>
            </div>
            <div className="row mb--20">
                <div className="col-lg-6 col-md-8 col-sm-10">
                    <Dropdown
                        value={selectedCalendar}
                        options={calendarOptions.map(option => ({
                            label: (
                                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '5px' }}>
                                    {option.icon} <span style={{ marginLeft: '8px' }}>{option.label}</span>
                                </div>
                            ),
                            value: option.value
                        }))}
                        onChange={handleCalendarSelection}
                        placeholder="Select a Calendar"
                        className="p-dropdown"
                        panelStyle={{ overflow: 'hidden', maxHeight: 'none' }} 
                    />
                </div>
            </div>
        </div>
    );
};

export default CalendarDropdown;
