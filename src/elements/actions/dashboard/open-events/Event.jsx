import { useState } from "react";
import moment from "moment";
import { Tooltip } from "@/compat/primereact";
import { FiInfo } from "@/elements/ui/icons/IconlyIcons";
import { MOMENT_DATE_TIME } from "../../../../util/functions/date";
import EventModal from "./EventModal";

const Event = (props) => {
    const [show, setShow] = useState(false);
    const isDraft = props.event.status === 'draft';

    let price;
    if (isDraft) {
        price = 'Not created yet';
    } else if (props.event.isSaleClosed) {
        price = 'Tickets are closed';
    } else if (props.event.isFree) {
        price = 'FREE'
    } else if (!!props.event.product){
        price = props.event.product?.guest.price + ' / ' + (props.event.IsMemberFree ? 'FREE' : (props.event.product?.member?.price ?? '-')) + (props.event.product?.activeMember ? ' / ' + props.event.product?.activeMember.price : '')
    } else {
        price = 'TBA';
    }

    const todayValue = (new Date()).valueOf();
    const expired = !isDraft && (
        (new Date(props.event.date).valueOf() < todayValue) ||
        (new Date(props.event.ticketTimer).valueOf() < todayValue)
    );

    return (
        <>
            <Tooltip target=".price_info" />
            <EventModal show={show} setShow={setShow} event={props.event} loadData={props.loadData}/>
            <div
                onClick={() => setShow(true)}
                style={isDraft
                    ? { backgroundColor: '#fff8e1', borderColor: '#f59e0b' }
                    : expired ? { backgroundColor: '#ff4d4d' } : {}}
                className='service service__style--2 common-border-2 event-card'
            >
                <div className='event-card__poster'>
                    {props.event.poster ? (
                        <img
                            src={props.event.poster}
                            alt={`${props.event.title || 'Draft event'} poster`}
                            loading='eager'
                            decoding='async'
                        />
                    ) : (
                        <div className='center_div' style={{ height: '100%', minHeight: '180px', color: '#92400e' }}>
                            Draft — no poster yet
                        </div>
                    )}
                </div>
                <div className='event-card__content'>
                    <h5 className='event-card__title'>{props.event.title || 'Untitled draft'}</h5>
                    <div className='event-card__details'>
                        <p><strong>Date:</strong> {props.event.date ? moment(props.event.date).format(MOMENT_DATE_TIME) : 'Not set'}</p>
                        <p><strong>Location:</strong> {props.event.location || 'Not set'}</p>
                        <p>
                            <strong>Price</strong>
                            <FiInfo className='price_info tooltip_info'
                                data-pr-tooltip="Guest / Member / Active Member"
                                data-pr-position="top" />
                            : {price}
                        </p>
                        <p>
                            <strong>Status:</strong> {isDraft ? 'Draft' : expired ? <span className='error'>Expired</span> : props.event.status}
                        </p>
                    </div>
                </div>
            </div>
        </>

    )
}

export default Event
