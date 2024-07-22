import React from 'react'
import { Link } from 'react-router-dom';
import { REGIONS } from '../../util/defines/REGIONS_DESIGN'
import { Card } from 'primereact/card';
import { capitalizeFirstLetter } from '../../util/functions/capitalize';

const RegionOptions2 = (props) => {
    return (
        <div className='row m--20'>
            {REGIONS.map((r, index) => {
                return <Link key={index} className='col-lg-4 col-md-6 col-12 mb--20'>
                    <Card 
                        title={<div className='hor_section'>
                            {capitalizeFirstLetter(r)}
                            <Link
                                to={`/${r}/${props.to}`}
                                className="rn-button-style--2 rn-btn-green"
                            >
                                Select
                            </Link>
                    </div>} 
                    header={<img alt="Card" src={`/assets/images/bg/paralax/${r}.jpg`} style={{ height: '200px', objectFit: 'cover' }} />}>
                    </Card>
                </Link>
            })}
        </div>
    )
}

export default RegionOptions2