import React, { useState } from 'react'
import { Tooltip } from 'primereact/tooltip';
import { Dialog } from 'primereact/dialog';
import { FiInfo } from 'react-icons/fi';
import { capitalizeFirstLetter } from '../../../../util/functions/capitalize';
import { useDispatch } from 'react-redux';
import { loadSingleEvent, removeEventFromAll } from '../../../../redux/events';
import { useNavigate, useParams } from 'react-router-dom';
import { Image } from 'primereact/image';
import ConfirmCenterModal from '../../../ui/modals/ConfirmCenterModal';
import moment from 'moment';
import { useHttpClient } from '../../../../hooks/common/http-hook';
import Loader from '../../../ui/loading/Loader';
import { showNotification } from '../../../../redux/notification';
import { EVENT_DELETED } from '../../../../util/defines/common';
import { MOMENT_DATE_TIME } from '../../../../util/functions/date';
import GenerateTicketsModal from './GenerateTicketsModal';
import { useLoadEvents } from '../../../../hooks/common/api-hooks';

const EventModal = (props) => {
    const [visible, setVisible] = useState(false);
    const [ticketGeneratorModal, setTicketGeneratorModal] = useState(false);

    const { sendRequest, loading } = useHttpClient();

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const tooltip = <FiInfo className='price_info tooltip_info'
        data-pr-tooltip="Click on image to expand"
        data-pr-position="top" />


    const onDelete = async () => {
        const responseData = await sendRequest(`future-event/delete-event/${props.event.id}`, 'DELETE');

        if (responseData.status) {
            dispatch(showNotification(EVENT_DELETED));
            props.loadData();
            setVisible(false);
            props.setShow(false);
            dispatch(removeEventFromAll({
                region: props.event.region,
                eventId: props.event.id
            }));
        }
    }

    const priceInfo = !!props.event.product ? <>
        <h3>Price Info</h3>
        <hr />
        <p>Is the sale closed: {props.event.isSaleClosed ? 'Yes' : 'No'}</p>
        <p>Is the Event Free: {props.event.isFree ? 'Yes' : 'No'}</p>
        <p>Is the Event Member Free: {props.event.isMemberFree ? 'Yes' : 'No'} </p>
        <br />
        <p>Price for guests: {props.event.product?.guest.price}</p>
        <p>Guest Ticket Including: {props.event.entryIncluding || 'None'}</p>
        <p>Guest Price Id: {props.event.product?.guest.priceId}</p>
        <br />

        {!props.event.isMemberFree && <>
            <p>Price for members: {props.event.product?.member.price}</p>
            <p>Member Ticket Including: {props.event.memberIncluding || 'None'}</p>
            <p>Member Price Id: {props.event.product?.member.priceId}</p>
            <br />
            <p>Price for active members: {props.event.product?.activeMember?.price}</p>
            <p>Active Member Price Id: {props.event.product?.activeMember?.priceId}</p>
            <br />
        </>}
        <p>Free Pass List: {props.event.freePass?.length ? props.event.freePass.join('| ') : 'None'}</p>
        <p>Discount Pass List: {props.event.discountPass?.length ? props.event.discountPass.join('| ') : 'None'}</p>
    </> : null;

    return (
        <>
            <ConfirmCenterModal text={'Deleting an event is an irreversible action! Are you sure you want to delete it?'} onConfirm={onDelete} visible={visible} setVisible={setVisible} loading={loading} />
            <GenerateTicketsModal visible={ticketGeneratorModal} onHide={() => setTicketGeneratorModal(false)} event={props.event} />
            <Dialog header={`${capitalizeFirstLetter(props.event.region)} | ${props.event.title} | ${moment(props.event.date).format(MOMENT_DATE_TIME)}`}
                visible={props.show} style={{ maxWidth: '90%' }}
                onHide={() => props.setShow(false)}
                dismissableMask>
                <div className="btn_row row">
                    <button
                        onClick={() => {
                            setTicketGeneratorModal(true);
                        }}
                        className="col-lg-2 col-md-4 col-sm-12 center_text rn-button-style--2 rn-btn-reverse-green"
                    >
                        Generate Tickets
                    </button>
                    <button
                        onClick={() => {
                            dispatch(loadSingleEvent(props.event));
                            navigate(`/user/edit-event/${props.event.id}`);
                        }}
                        className="col-lg-2 col-md-4 col-sm-12 center_text rn-button-style--2 rn-btn-reverse-green"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => setVisible(true)}
                        className="col-lg-2 col-md-4 col-sm-12 center_text rn-button-style--2 rn-btn-reverse"
                    >
                        Delete
                    </button>
                </div>
                <Tooltip target=".price_info" />
                <div>
                    <h3>Main Info</h3>
                    <hr />
                    <p>Status: {props.event.status}</p>
                    <p>Region: {props.event.region}</p>
                    <p>Title: {props.event.title}</p>
                    <p>Descriptions: {props.event.description}</p>
                    <p>Date: {moment(props.event.correctedDate ?? props.event.date).format(MOMENT_DATE_TIME)}</p>
                    <p>Location: {props.event.location}</p>
                    <p>Ticket Timer: {moment(props.event.ticketTimer).format(MOMENT_DATE_TIME)}</p>
                    <p>Ticket Limit: {props.event.ticketLimit}</p>
                    <p>Is it only for members: {props.event.memberOnly ? 'Yes' : 'No'}</p>
                    <p>Extra Inputs Required: {!!props.event.extraInputsForm ? 'Yes' : 'No'}</p>
                    <p>Sub-event: {props.event.subEventDescription || 'None'}</p>
                    <p>Text for the event: {props.event.text}</p>

                    {props.event.isFree ?
                        <h3>Price Info: Event is free</h3> :
                        (props.event.ticketLink ?
                            <h3>Ticket are bought from <a href={props.event.ticketLink} target='_blank'>here</a></h3> :
                            priceInfo)}
                    <h3>Images (click to expand)</h3>
                    <hr />
                    <div className='row'>
                        <div className='col-lg-4 col-md-6 col-12'>
                            <p>Ticket: </p> <Image src={props.event.ticketImg} width='200px' className='normal_preview' alt='ticket' preview />
                        </div>

                        <div className='col-lg-4 col-md-6 col-12'>
                            <p>Poster: </p> <Image src={props.event.poster} width='200px' className='normal_preview' alt='poster' preview />
                        </div>

                        <div className='col-lg-4 col-md-6 col-12'>
                            <p>Background {tooltip}: </p>
                            {(props.event.bgImageExtra && props.event?.bgImageSelection === 2) ?
                                <Image src={props.event.bgImageExtra} className='normal_preview' alt='bg with expand' preview />
                                : <Image src={`/assets/images/bg/bg-image-${props.event.bgImage}.webp`} className='normal_preview' alt='bg with expand' preview />}
                        </div>

                        <div className='col-12'>
                            <p>Images {tooltip}: {props.event.images?.length > 0 ?
                                props.event.images.map((img, index) => <Image key={index}
                                    className='m--10'
                                    width='100px'
                                    src={img}
                                    alt='image with preview'
                                    preview
                                />
                                ) : 'No extra images'}</p>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default EventModal