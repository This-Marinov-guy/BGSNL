import React from 'react'
import { useParams } from 'react-router-dom'
import {
    isPublicRegionSlug,
    resolveRegionSlug,
} from '../../../../util/defines/REGIONS_DESIGN';
import ImageFb from '../../media/ImageFb';

const ExternalPlatformTicketSale = ({link}) => {
    const { region } = useParams();
    const regionKey = resolveRegionSlug(region);
    const hasRegion = isPublicRegionSlug(region);

    return (
        <div className="container center_text mt--100">
            <ImageFb
                className="logo mb--40"
                src={`/assets/images/logo/${hasRegion ? regionKey : 'logo'}.webp`}
                fallback={`/assets/images/logo/${hasRegion ? regionKey : 'logo'}.jpg`}
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
