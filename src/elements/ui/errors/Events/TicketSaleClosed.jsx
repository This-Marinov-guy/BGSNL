import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { REGIONS } from '../../../../util/defines/REGIONS_DESIGN';
import ImageFb from '../../media/ImageFb';

const TicketSaleClosed = () => {
    const { region } = useParams();

    const navigate = useNavigate();

    return (
        <div className="container center_text mt--100">
            <ImageFb
                className="logo mb--40"
                src={`/assets/images/logo/${region && REGIONS.includes(region) ? region : 'logo'}.webp`}
                fallback={`/assets/images/logo/${region && REGIONS.includes(region) ? region : 'logo'}.jpg`}
                alt="Logo"
            />
            <h3 className="">Opps ... it is all SOLD OUT! Please check the event description for tickets on-the-door or contact us through our email! Hope we see you soon!</h3>
            <div className="options-btns-div mt--60">
                <button
                    onClick={() => navigate(-1)}
                    className="rn-button-style--2 rn-btn-reverse"
                >
                    Go Back
                </button>
                <Link to={`/${region}`}
                    className="rn-button-style--2 rn-btn-reverse-green"
                >
                    Home
                </Link>
            </div>
        </div>
    )
}

export default TicketSaleClosed