import React from 'react'
import { useParams } from 'react-router-dom'
import { REGIONS } from '../../../../util/defines/REGIONS_DESIGN';
import ImageFb from '../../media/ImageFb';
import MembershipBanner from '../../../banners/MembershipBanner';

const ExclusiveMemberEvent = ({ link }) => {
    const { region } = useParams();

    return (
        <div className="container center_text mt--100">
            <ImageFb
                className="logo-md"
                src="/assets/images/avatars/exclusive-event.png"
                alt="Logo"
            />
            <h3 className="">Opps... it seems that this is an event exclusive to members! You still have a chance to enter!</h3>
            <MembershipBanner/>
        </div>
    )
}

export default ExclusiveMemberEvent