import React, { useEffect, useState } from 'react'
import { REGIONS } from '../../../../util/defines/REGIONS_DESIGN'
import Event from './Event'
import { useSelector } from 'react-redux';
import { selectEvents } from '../../../../redux/events';
import Filter from '../Filter';
import { useSearchParams } from 'react-router-dom';
import { useLoadEvents } from '../../../../hooks/common/api-hooks';
import EventsLoading from '../../../ui/loading/EventsLoading';
import { selectUser } from '../../../../redux/user';
import { checkAuthorization, decodeJWT } from '../../../../util/functions/authorization';
import { ACCESS_2 } from '../../../../util/defines/common';
import { hasOverlap } from '../../../../util/functions/helpers';

const EventList = () => {
    const { reloadEvents, eventsLoading } = useLoadEvents();

    const user = useSelector(selectUser);
    const { roles, region } = decodeJWT(user.token);
    const isAuthorized = hasOverlap(roles, ACCESS_2);

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
        <h3 className='center_text'>Administration Dashboard</h3>
            {isAuthorized  && <Filter />}
            {eventsLoading ? <EventsLoading /> : <div className='mt--10'>
                {regionList.map((region, index) => {
                    return <div className='row' key={index}>
                        <h4 className='col-12 archive'>{region.toUpperCase()}</h4>
                        <div className='col-12 grid'>
                            {events[region].length ? events[region].map((event, i) => {
                                return <Event key={i} event={event} loadData={() => reloadEvents(true)} />
                            }) : <p>No current events for the region</p>}
                        </div>
                        <hr />
                    </div>

                })}
            </div>}
        </>
    )
}

export default EventList