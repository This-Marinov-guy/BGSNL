import React, { useState } from 'react'
import EventModal from './EventModal';

const Event = () => {
    const [show, setShow] = useState(false);

    return (
        <>
            <EventModal show={show} setShow={setShow} event={{}} />
            <div onClick={() => setShow(true)} className='service service__style--2 common-border-2 flex'>
                <div className=''>
                    <p>Title: Beach Party</p>
                    <p>When: 10th May</p>
                    <p>Time: 10:00</p>
                    <p>Location: Oostricht</p>
                    <p>Price: 5 / 12</p>
                    <p>Status: Open</p>
                </div>
                <img style={{ maxWidth: '150px', objectFit: 'contain' }} src='/assets/images/portfolio/groningen/portfolio-37.jpg' alt='Poster' />
            </div>
        </>

    )
}

export default Event