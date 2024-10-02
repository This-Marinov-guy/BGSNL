import React, { useState, useEffect } from 'react';
import { createCustomerTicket, createQrCodeCheckGuest } from '../../util/functions/ticket-creator';
import { decryptData } from '../../util/functions/helpers';

const TicketComponent = () => {
    const [ticketDataUrl, setTicketDataUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const generateTicket = async () => {
            const ticketImage = 'https://res.cloudinary.com/dqwcx5zyh/image/upload/v1724608250/groningen_Bulgarian%20Dinner_Mon%20Sep%2009%202024%2000:00:00%20GMT%2B0300%20%28Eastern%20European%20Summer%20Time%29/ticket.jpg'; // Update this to the correct path
            const name = 'John';
            const surname = 'Doe';
            const qrLink = createQrCodeCheckGuest({
              eventId: "66f1337cd435689ec6ec0f4c",
              quantity: 1,
            });

            try {
                const { ticketUrl } = await createCustomerTicket(ticketImage, name, surname, '#faf9f6', qrLink);
                setTicketDataUrl(ticketUrl);
            } catch (err) {
                setError(err);
            }
        };

        generateTicket();
    }, []);

    return (<>
        <img src={ticketDataUrl} alt="Customer Ticket" />
    </>)
}

export default TicketComponent;