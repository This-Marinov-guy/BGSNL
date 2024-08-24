import React, { useState } from 'react'
import { Tooltip } from 'primereact/tooltip';
import { Dialog } from 'primereact/dialog';
import { FiInfo } from 'react-icons/fi';
import { capitalizeFirstLetter } from '../../../../util/functions/capitalize';
import { useDispatch } from 'react-redux';
import { loadSingleEvent } from '../../../../redux/events';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmCenterModal from '../../../ui/modals/ConfirmCenterModal';
import moment from 'moment';
import { useHttpClient } from '../../../../hooks/http-hook';
import Loader from '../../../ui/loading/Loader';
import { showNotification } from '../../../../redux/notification';
import { EVENT_DELETED } from '../../../../util/defines/defines';

const EventModal = (props) => {
    const [visible, setVisible] = useState(false);
    const [expandImage, setExpandImage] = useState(null);
    const [expandBg, setExpandBg] = useState(false);

    const { sendRequest, loading } = useHttpClient();

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const tooltip = <FiInfo className='price_info tooltip_info'
        data-pr-tooltip="Click on image to expand"
        data-pr-position="top" />


    const onDelete = async () => {
        const responseData = await sendRequest(`event/actions/delete-event/${props.event.id}`, 'DELETE');

        if (responseData.status) {
            dispatch(showNotification(EVENT_DELETED));
            props.loadData();
            setVisible(false);
            props.setShow(false);
            navigate('/user/dashboard');
        }
    }

    const priceInfo = <>
        <h3>Price Info</h3>
        <hr />
        <p>Is the sale closed: {props.event.isSaleClosed ? 'Yes' : 'No'}</p>
        <p>Is the Event Free: {props.event.isFree ? 'Yes' : 'No'}</p>
        <p>Is the Event Member Free: {props.event.isMemberFree ? 'Yes' : 'No'} </p>
        <br />
        <p>Price for guests: {props.event.entry}</p>
        <p>Guest Ticket Including: {props.event.entryIncluding || 'None'}</p>
        <p>Guest Price Id: {props.event.priceId}</p>
        <br />

        {!props.event.isMemberFree && <>
            <p>Price for members: {props.event.memberEntry}</p>
            <p>Member Ticket Including: {props.event.memberIncluding || 'None'}</p>
            <p>Member Price Id: {props.event.memberPriceId}</p>
            <br />
            <p>Price for active members: {props.event.activeMemberEntry}</p>
            <p>Active Member Price Id: {props.event.activeMemberPriceId}</p>
            <br />
        </>}
        <p>Free Pass List: {props.event.freePass.length ? props.event.freePass.join('| ') : 'None'}</p>
        <p>Discount Pass List: {props.event.discountPass.length ? props.event.discountPass.join('| ') : 'None'}</p>
    </>

    return (
        <>
            <ConfirmCenterModal text={loading ? <Loader /> : 'Deleting an event is an irreversible action! Are you sure you want to delete it?'} onConfirm={onDelete} visible={visible} setVisible={setVisible} />
            <Dialog header={`${capitalizeFirstLetter(props.event.region)} | ${props.event.title} | ${moment(props.event.date).format("Do MMMM")}, ${props.event.time}`}
                visible={props.show} style={{ maxWidth: '90%' }}
                onHide={() => props.setShow(false)}
                dismissableMask>
                <div className="options-btns-div">
                    <button
                        onClick={() => {
                            dispatch(loadSingleEvent(props.event));
                            navigate(`/user/edit-event/${props.event.id}`);
                        }}
                        className="rn-button-style--2 rn-btn-reverse-green"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => setVisible(true)}
                        className="rn-button-style--2 rn-btn-reverse"
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
                    <p>Date: {moment(props.event.date).format("Do MMMM")}</p>
                    <p>Time: {props.event.time}</p>
                    <p>Location: {props.event.location}</p>
                    <p>Ticket Timer: {moment(props.event.ticketTimer).format('Do MMMM,hh:mm')}</p>
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
                    <h3>Images</h3>
                    <hr />
                    <p>Images {tooltip}: {props.event.images.length > 0 ?
                        props.event.images.map((img, index) => {
                            if (!img) { return <p>No extra images</p> }
                            {
                                return <img key={index}
                                    onClick={() => setExpandImage(expandImage == null ? index : null)}
                                    className={'small_preview ' + (expandImage === index && 'center_expand')}
                                    src={img}
                                    alt='preview' />
                            }
                        }) : 'Only poster will be displayed'}</p>
                    <p>Ticket: </p> <img src={props.event.ticketImg} className='normal_preview' alt='ticket' />
                    <p>Poster: </p> <img src={props.event.ticketImg} className='normal_preview' alt='poster' />
                    <p>Background {tooltip}: </p>
                    {props.event.bgImageExtra ?
                        <img onClick={() => setExpandBg(!expandBg)} src={props.event.bgImageExtra} className={'normal_preview ' + (expandBg && 'center_expand')} alt='bg' />
                        : <img onClick={() => setExpandBg(!expandBg)} src={`/assets/images/bg/bg-image-${props.event.bgImage}.webp`} className={'normal_preview ' + (expandBg && 'center_expand')} alt='bg' />}
                </div>
            </Dialog>
        </>
    )
}

export default EventModal