import React from 'react'
import { Skeleton } from 'primereact/skeleton';

const EventsLoading = () => {
    return (
        <div className='row mt--20'>
            <div className='col-12 mb--20'>
                <p>Loading events, please be patient!</p>
                <Skeleton className="mb-2"></Skeleton>
                <Skeleton width="10rem" className="mb-2"></Skeleton>
                <Skeleton width="5rem" className="mb-2"></Skeleton>
            </div>
            
            <div className='col-4'>
                <Skeleton size="5rem"></Skeleton>
            </div>
            <div className='col-4'>
                <Skeleton size="5rem"></Skeleton>
            </div>
            <div className='col-4'>
                <Skeleton size="5rem"></Skeleton>
            </div>
        </div>
    )
}

export default EventsLoading