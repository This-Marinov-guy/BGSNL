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
            <div onClick={() => setShow(true)} style={expired ? { backgroundColor: '#ff4d4d' } : {}} className='service service__style--2 common-border-2 flex'>
                <div>
                    <p>Title: {props.event.title}</p>
                    <p>Date: {moment(props.event.date).format(MOMENT_DATE_TIME)}</p>
                    <p>Location: {props.event.location}</p>
                    <p>Price <FiInfo className='price_info tooltip_info'
                        data-pr-tooltip="Guest / Member / Active Member"
                        data-pr-position="top" /> : {price}</p>
                    <p>Status: {expired ? <span className='error'>Expired</span> : props.event.status}</p>
                </div>
                <img style={{ maxWidth: '150px', objectFit: 'contain' }} src={props.event.poster} alt='Poster' />
            </div>
        </>

    )
}

export default Event