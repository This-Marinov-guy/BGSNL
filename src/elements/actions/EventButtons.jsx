import React from 'react'
import { Link } from 'react-router-dom'

const EventButtons = (props) => {
    return (
            <div className="options-btns-div mt--60">
                <Link
                    to='/user/all-events'
                    className="rn-button-style--2 rn-btn-reverse-green"
                >
                    Add Event
                </Link>
                <Link
                    to='/user/add-event'
                    className="rn-button-style--2 rn-btn-green"
                >
                    All Events
                </Link>
            </div>
    )
}

export default EventButtons

