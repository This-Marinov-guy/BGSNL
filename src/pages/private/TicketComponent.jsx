import React, { useState, useEffect } from 'react';
import { createCustomerTicket } from '../../util/functions/ticket-creator';
import EventCard from '../../elements/ui/cards/EventCard';
import EventCard2 from '../../elements/ui/cards/EventCard2';
import EventCard2List from '../../elements/ui/lists/EventCard2List';
import EventCardList from '../../elements/ui/lists/EventCardList';
import { decryptData } from '../../util/functions/helpers';

const TicketComponent = () => {
    const [ticketDataUrl, setTicketDataUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const generateTicket = async () => {
            // const ticketImage = 'https://res.cloudinary.com/dqwcx5zyh/image/upload/v1724608250/groningen_Bulgarian%20Dinner_Mon%20Sep%2009%202024%2000:00:00%20GMT%2B0300%20%28Eastern%20European%20Summer%20Time%29/ticket.jpg'; // Update this to the correct path
            // const name = 'John';
            // const surname = 'Doe';
            // const qrLink = 'https://bgsg-guest-tickets.s3.amazonaws.com/66cb6efa92a0e07f14c70591_VladislavMarinov_GUEST.webp'; // The data you want to encode in the QR code

            // try {
            //     const { ticketUrl } = await createCustomerTicket(ticketImage, name, surname, '#faf9f6', qrLink);
            //     setTicketDataUrl(ticketUrl);
            // } catch (err) {
            //     setError(err);
            // }
        };

        generateTicket();
    }, []);

    return (<>
        <img src={ticketDataUrl} alt="Customer Ticket" />
        {/* <EventCardList/>
        <EventCard2List/> */}
    </>)
}

export default TicketComponent;