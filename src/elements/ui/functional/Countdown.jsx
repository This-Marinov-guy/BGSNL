import React, { useState, useEffect } from 'react';
import { calculateTimeRemaining } from '../../../util/functions/date';

const Countdown = (props) => {
    const [remainingTime, setRemainingTime] = useState(calculateTimeRemaining(props.targetTime));

    useEffect(() => {
        const timer = setInterval(() => {
            const timeRemaining = calculateTimeRemaining(props.targetTime);
            setRemainingTime(timeRemaining);

            if (timeRemaining <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []); // Empty dependency array to run effect only once

    function formatTime(milliseconds) {
        if (milliseconds <= 0) {
            return '';
        }

        const seconds = Math.floor((milliseconds / 1000) % 60);
        const minutes = Math.floor((milliseconds / 1000 / 60) % 60);
        const hours = Math.floor((milliseconds / 1000 / 60 / 60) % 24);

        return `${hours}h ${minutes}m ${seconds}s`;
    }

    if (props.eventClosed || remainingTime <= 0) {
        props.setEventClosed(true);
        return <h3 style={{ color: 'red', marginTop: '10px' }}>Online tickets sold out!</h3>;
    } else if (remainingTime <= 24 * 60 * 60 * 1000) {
        return <h3 style={{fontSize: '1.2rem'}}>Online ticket sale closes in: {formatTime(remainingTime)}</h3>;
    } else {
        return null;
    }
};

export default Countdown;