import React, { useState } from 'react'
import { Dialog } from 'primereact/dialog';
import { Link } from 'react-router-dom';

const Event = () => {
    const [show, setShow] = useState(false);

    return (
        <>
            <Dialog header="Rotterdam | Beach Party | 10th May 10:00" visible={show} style={{ maxWidth: '90%' }} onHide={() => setShow(false)}>
                <div className="options-btns-div">
                    <Link
                        to='/'
                        className="rn-button-style--2 btn-solid"
                    >
                        Edit
                    </Link>
                    <button
                        className="rn-button-style--2 rn-btn-reverse"
                    >
                        Delete
                    </button>
                </div>
            </Dialog>
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