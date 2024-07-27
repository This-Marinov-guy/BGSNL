import React, { Fragment } from 'react'
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom/cjs/react-router-dom.min'
import { selectUser } from '../../redux/user';
import ImageFb from '../../elements/ui/ImageFb';
import { REGIONS_MEMBERSHIP } from '../../util/defines/REGIONS_AUTH_CONFIG';

const RegionAuthCheck = ({ children }) => {
    const { region } = useParams();

    const user = useSelector(selectUser);

    if (user.region != region) {
        return <div className="container center_text mt--100">
            <ImageFb
                className="logo mb--40"
                src={`/assets/images/logo/${region && REGIONS_MEMBERSHIP.includes(region) ? region : 'logo'}.webp`}
                fallback={`/assets/images/logo/${region && REGIONS_MEMBERSHIP.includes(region) ? region : 'logo'}.jpg`}
                alt="Logo"
            />
            <h3 className="">It looks like you are trying to access an event with your profile for another city!</h3>
            <Link to='/'
                className="rn-button-style--2 rn-btn-reverse-green mt--20"
            >
               Home
            </Link>
        </div>
    } else {
        return <Fragment>
            {...children}
        </Fragment>
    }

}

export default RegionAuthCheck