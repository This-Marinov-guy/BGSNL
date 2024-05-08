import React from 'react'
import { REGIONS } from '../../../../util/REGIONS_DESIGN'
import Event from './Event'

const EventList = () => {
    return (
        <div className='mt--10'>
            {REGIONS.map((region, index) => {
                return <div className='row' key={index}>
                    <h4 className='col-12 archive'>{region.toUpperCase()}</h4>
                    <div className='col-12 grid'>
                        <Event />
                        <Event />
                        <Event />
                    </div>
                    <hr />
                </div>

            })}
        </div >
    )
}

export default EventList