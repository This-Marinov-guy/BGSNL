import React, { useEffect, useState } from 'react'
import { REGIONS } from '../../../../util/defines/REGIONS_DESIGN'
import Event from './Event'
import { useSelector } from 'react-redux';
import { selectEvents } from '../../../../redux/events';
import Filter from '../Filter';
import { useSearchParams } from 'react-router-dom';
import { useLoadEvents } from '../../../../hooks/api-hooks';
import EventsLoading from '../../../ui/loading/EventsLoading';

const EventList = () => {
    const {reloadEvents, eventsLoading} = useLoadEvents();

    const [searchParams, setSearchParams] = useSearchParams();
    const regionParam = REGIONS.includes(searchParams.get("region")) ? searchParams.get("region") : '';
    const regionList = regionParam ? REGIONS.filter((r) => r === regionParam) : REGIONS;

    const events = useSelector(selectEvents);

    useEffect(() => {
        reloadEvents(2000);
    }, [])

    return (
        <>
            <Filter />
            {eventsLoading ? <EventsLoading /> : <div className='mt--10'>
                {regionList.map((region, index) => {
                    return <div className='row' key={index}>
                        <h4 className='col-12 archive'>{region.toUpperCase()}</h4>
                        <div className='col-12 grid'>
                            {events[region].length ? events[region].map((event, i) => {
                                return <Event key={i} event={event} loadData={reloadEvents}/>
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