import React, { useState } from 'react'
import { Tooltip } from 'primereact/tooltip';
import { Dialog } from 'primereact/dialog';
import { Link } from 'react-router-dom';
import { FiInfo } from 'react-icons/fi';
import capitalizeFirstLetter from '../../../../util/functions/capitalize';

const EventModal = (props) => {
    const [expandImage, setExpandImage] = useState(null);
    const [expandBg, setExpandBg] = useState(false)

    const tooltip = <FiInfo className='price_info tooltip_info'
        data-pr-tooltip="Click on image to expand"
        data-pr-position="top" />

    return (
        <Dialog header={`${capitalizeFirstLetter(props.event.region)} | ${props.event.title} | ${props.event.date}, ${props.event.time}`}
            visible={props.show} style={{ maxWidth: '90%' }}
            onHide={() => props.setShow(false)}
            dismissableMask>
            <div className="options-btns-div">
                <Link
                    to={`/user/edit-event`}
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
            <Tooltip target=".price_info" />
            <div>
                <h3>Main Info</h3>
                <hr />
                <p>Status: {props.event.status}</p>
                <p>Region: {props.event.region}</p>
                <p>Title: {props.event.title}</p>
                <p>Descriptions: {props.event.description}</p>
                <p>Date: {props.event.date}</p>
                <p>Time: {props.event.time}</p>
                <p>Location: {props.event.location}</p>
                <p>Ticket Timer: {props.event.ticketTimer}</p>
                <p>Ticket Limit: {props.event.ticketLimit}</p>
                <p>Is it only for members: {props.event.memberOnly ? 'Yes' : 'No'}</p>
                <p>Extra Inputs Required: {!!props.event.extraInputsForm ? 'Yes' : 'No'}</p>
                <p>Sub-event: {props.event.subEventDescription || 'None'}</p>
                <p>Text for the event: {props.event.text}</p>

                {!props.event.isFree && <>
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
                    <p>Free Pass List: {props.event.freePass.length ? props.event.freePass.join(', ') : 'None'}</p>
                    <p>Discount Pass List: {props.event.discountPass.length ? props.event.discountPass.join(', ') : 'None'}</p>
                </>}
                <h3>Images</h3>
                <hr />
                <p>Images {tooltip}: {props.event.images.length ?
                    props.event.images.map((img, index) =>
                        <img key={index}
                            onClick={() => setExpandImage(expandImage == null ? index : null)}
                            className={'small_preview ' + (expandImage === index && 'center_expand')}
                            src={img}
                            alt='preview' />) : 'Only poster will be displayed'}</p>
                <p>Ticket: </p> <img src={props.event.ticketImg} className='normal_preview' alt='ticket' />
                <p>Poster: </p> <img src={props.event.ticketImg} className='normal_preview' alt='poster' />
                <p>Background {tooltip}: </p>
                {props.event.bgImageExtra ?
                    <img onClick={() => setExpandBg(!expandBg)} src={props.event.bgImageExtra} className={'normal_preview ' + (expandBg && 'center_expand')} alt='bg' />
                    : <img onClick={() => setExpandBg(!expandBg)} src={`/assets/images/bg/bg-image-${props.event.bgImage}.webp`} className={'normal_preview ' + (expandBg && 'center_expand')} alt='bg' />}
            </div>
        </Dialog>
    )
}

export default EventModal