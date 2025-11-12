import React, { useEffect, useState } from 'react'
import { REGIONS } from '../../../../util/defines/REGIONS_DESIGN'
import Event from './Event'
import { useSelector } from 'react-redux';
import { selectEvents } from '../../../../redux/events';
import Filter from '../Filter';
import { useSearchParams, Link } from 'react-router-dom';
import { useLoadEvents } from '../../../../hooks/common/api-hooks';
import EventsLoading from '../../../ui/loading/EventsLoading';
import { selectUser } from '../../../../redux/user';
import { checkAuthorization, decodeJWT } from '../../../../util/functions/authorization';
import { ACCESS_2, ACCESS_4 } from '../../../../util/defines/common';
import { hasOverlap } from '../../../../util/functions/helpers';
import { capitalizeAfterSpace, capitalizeFirstLetter } from '../../../../util/functions/capitalize';

const EventList = () => {
    const { reloadEvents, eventsLoading } = useLoadEvents();

    const user = useSelector(selectUser);
    const { roles, region } = decodeJWT(user.token);
    const isAuthorized = hasOverlap(roles, ACCESS_2);
    const canAddEvents = hasOverlap(roles, ACCESS_4);

    const [searchParams, setSearchParams] = useSearchParams();
    const regionParam = REGIONS.includes(searchParams.get("region")) ? searchParams.get("region") : '';
    const regionList = isAuthorized ?
        // show by filter
        (regionParam ? REGIONS.filter((r) => r === regionParam) : REGIONS) :
        //only show region events
        REGIONS.filter((r) => r === region);

    const events = useSelector(selectEvents);

    useEffect(() => {
        reloadEvents(true);
    }, [])

    return (
        <>
        <div className="d-flex justify-content-between align-items-center mb--30 flex-wrap" style={{ gap: '15px' }}>
            <h3 className='center_text' style={{ margin: 0 }}>Administration Dashboard</h3>
            {canAddEvents && (
                <Link
                    to="/user/add-event"
                    className="rn-button-style--2 rn-btn-green"
                >
                    <span>Add Event</span>
                </Link>
            )}
        </div>
            {isAuthorized  && <Filter />}
            {eventsLoading ? <EventsLoading /> : <div className='mt--20'>
                {regionList.map((region, index) => {
                    return <div className='region-section' key={index}>
                        <div className='row'>
                            <div className='col-12'>
                                <h4 className='archive region-title'>{capitalizeFirstLetter(region, true)}</h4>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-12'>
                                <div className='grid events-grid'>
                                    {events[region].length ? events[region].map((event, i) => {
                                        return <Event key={i} event={event} loadData={() => reloadEvents(true)} />
                                    }) : <p className='no-events-message'>No current events for the region</p>}
                                </div>
                            </div>
                        </div>
                        {index < regionList.length - 1 && <hr className='region-divider' />}
                    </div>

                })}
            </div>}
        </>
    )
}

export default EventList