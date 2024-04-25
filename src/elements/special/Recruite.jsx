import React, { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dialog } from 'primereact/dialog';
import ContactForm from '../contact/ContactForm';

const Recruit = () => {
    const [visible, setVisible] = useState(false);

    return (
        <Fragment>
            <Dialog header="Join the Team" visible={visible} onHide={() => setVisible(false)}
                style={{ minWidth: '60vw', marginRight: '5px', marginLeft: '5px' }}>
                <div className="contact-form--1">
                    <div className="form-wrapper">
                        <ContactForm subject='Web Designer' placeholderMessage='Tell us about you | why you want to join' />
                    </div>
                </div>
            </Dialog>
            <p className="mb--20">BGSNL is looking for a web designer - if you have some experience with HTML and CSS and want to contribute to this amazing platform, join our team and get amazing benefits such as events discount, great network of people and the best of feelings of contributing to a society. <br /> <Link to='#' onClick={() => setVisible(true)}>Click here to sign for the position</Link></p>
            <img style={{ width: '300px' }} onClick={() => setVisible(true)} src='/assets/images/news/designer.png' />
        </Fragment>
    )
}

export default Recruit