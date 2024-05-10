import React, { useEffect, useState } from 'react'
import { REGIONS } from '../../../../util/REGIONS_DESIGN'
import Event from './Event'
import { useHttpClient } from '../../../../hooks/http-hook';
import { useDispatch, useSelector } from 'react-redux';
import { loadEvents, selectEvents } from '../../../../redux/events';
import { ProgressSpinner } from 'primereact/progressspinner';
import Filter from '../Filter';
import { useSearchParams } from 'react-router-dom';

const EventList = () => {
    const [isEventsLoading, setIsEventsLoading] = useState(false);
    const { sendRequest } = useHttpClient();

    const [searchParams, setSearchParams] = useSearchParams();
    const regionParam = REGIONS.includes(searchParams.get("region")) ? searchParams.get("region") : '';
    const regionList = regionParam ? REGIONS.filter((r) => r === regionParam) : REGIONS;

    const events = useSelector(selectEvents);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchEventsFromApi = async () => {
            try {
                setIsEventsLoading(true);
                const responseData = await sendRequest(`event/actions/events`);
                dispatch(loadEvents(responseData.events));
            } catch (err) { } finally {
                setIsEventsLoading(false);
            }
        }

        fetchEventsFromApi();
    }, [])

    return (
        <>
            <Filter />
            {isEventsLoading ? <ProgressSpinner /> : <div className='mt--10'>
                {regionList.map((region, index) => {
                    return <div className='row' key={index}>
                        <h4 className='col-12 archive'>{region.toUpperCase()}</h4>
                        <div className='col-12 grid'>
                            {events[region].length ? events[region].map((event, i) => {
                                return <Event key={i} event={event} />
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