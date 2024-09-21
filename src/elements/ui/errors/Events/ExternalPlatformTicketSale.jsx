import React from 'react'
import { useParams } from 'react-router-dom'
import { REGIONS } from '../../../../util/defines/REGIONS_DESIGN';
import ImageFb from '../../media/ImageFb';

const ExternalPlatformTicketSale = ({link}) => {
    const { region } = useParams();

    return (
        <div className="container center_text mt--100">
            <ImageFb
                className="logo mb--40"
                src={`/assets/images/logo/${region && REGIONS.includes(region) ? region : 'logo'}.webp`}
                fallback={`/assets/images/logo/${region && REGIONS.includes(region) ? region : 'logo'}.jpg`}
                alt="Logo"
            />
            <h3 className="">This event is sold through an external platform - click below to see it!</h3>
            <a href={link}
                className="rn-button-style--2 rn-btn-reverse-green mt--20"
            >
                Go to event
            </a>
        </div>
    )
}

export default ExternalPlatformTicketSale