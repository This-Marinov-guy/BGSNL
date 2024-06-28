import React, { useState, useEffect } from 'react';
import { createCustomerTicket } from '../../util/ticket-creator';

const TicketComponent = () => {
    const [ticketDataUrl, setTicketDataUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const generateTicket = async () => {
            const ticketImage = '/assets/images/tickets/groningen/ticket-40.jpg'; // Update this to the correct path
            const name = 'John';
            const surname = 'Doe';
            const qrLink = 'https://google.com'; // The data you want to encode in the QR code

            try {
                const { ticketUrl } = await createCustomerTicket(ticketImage, name, surname, '#faf9f6', qrLink);
                setTicketDataUrl(ticketUrl);
            } catch (err) {
                setError(err);
            }
        };

        generateTicket();
    }, []);

    return <img src={ticketDataUrl} alt="Customer Ticket" />
}

export default TicketComponent;