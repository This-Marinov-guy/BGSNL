import React, { useState } from 'react'
import EventModal from './EventModal';
import { Tooltip } from 'primereact/tooltip';
import { FiInfo } from 'react-icons/fi';
import { MOMENT_DATE_TIME, dateConvertor } from '../../../../util/functions/date';
import moment from 'moment';

const Event = (props) => {
    const [show, setShow] = useState(false);

    let price;
    if (props.event.isSaleClosed) {
        price = 'Tickets are closed';
    } else if (props.event.isFree) {
        price = 'FREE'
    } else if (!!props.event.product){
        price = props.event.product?.guest.price + ' / ' + (props.event.IsMemberFree ? 'FREE' : (props.event.product?.member?.price ?? '-')) + (props.event.product?.activeMember ? ' / ' + props.event.product?.activeMember.price : '')
    } else {
        price = 'TBA';
    }

    const todayValue = (new Date()).valueOf();
    const expired = (new Date(props.event.date).valueOf() < todayValue) || (new Date(props.event.ticketTimer).valueOf() < todayValue);

    return (
        <>
            <Tooltip target=".price_info" />
            <EventModal show={show} setShow={setShow} event={props.event} loadData={props.loadData}/>
            <div
                onClick={() => setShow(true)}
                style={expired ? { backgroundColor: '#ff4d4d' } : {}}
                className='service service__style--2 common-border-2 event-card'
            >
                <div className='event-card__poster'>
                    <img src={props.event.poster} alt='Poster' />
                </div>
                <div className='event-card__content'>
                    <h5 className='event-card__title'>{props.event.title}</h5>
                    <div className='event-card__details'>
                        <p><strong>Date:</strong> {moment(props.event.date).format(MOMENT_DATE_TIME)}</p>
                        <p><strong>Location:</strong> {props.event.location}</p>
                        <p>
                            <strong>Price</strong>
                            <FiInfo className='price_info tooltip_info'
                                data-pr-tooltip="Guest / Member / Active Member"
                                data-pr-position="top" />
                            : {price}
                        </p>
                        <p>
                            <strong>Status:</strong> {expired ? <span className='error'>Expired</span> : props.event.status}
                        </p>
                    </div>
                </div>
            </div>
        </>

    )
}

export default Event