import React from 'react'
import { Dialog } from 'primereact/dialog';
import { useDispatch, useSelector } from 'react-redux';
import { removeModal, selectModal } from '../../../redux/modal';
import { WEB_DEV_MODAL } from '../../../util/defines/defines';
import ContactForm from '../../contact/ContactForm';

const RecruitModal = () => {
    const modal = useSelector(selectModal);
    const dispatch = useDispatch();

    return (
        <Dialog header="Join the Team" visible={modal === WEB_DEV_MODAL} onHide={() => dispatch(removeModal())}
            style={{ minWidth: '60vw', marginRight: '5px', marginLeft: '5px' }} dismissableMask>
            <div className="contact-form--1">
                <div className="form-wrapper">
                    <p>BGSNL is looking for a web designer - if you have some experience with HTML and CSS and want to contribute to this amazing platform, join our team and get amazing benefits such as events discount, great network of people and the best of feelings of contributing to a society. </p>
                    <ContactForm subject='Web Designer' placeholderMessage='Tell us about you | why you want to join' />
                </div>
            </div>
        </Dialog>
    )
}

export default RecruitModal