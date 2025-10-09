import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const MembershipBanner = ({border = 2}) => {
    const location = useLocation();
    const routePath = location.pathname;

    return (
        <div className={`team_member_border_${border} center_section`} style={{ maxWidth: '500px', margin: '40px auto' }} >
            <p className="information center_text">
                You do not want to miss a discount, fill the info manually or miss a ticket for your collection - become a member to enjoy these benefits!
            </p>
            <Link
                className="rn-button-style--2 rn-btn-reverse-green center_text mb--10"
                onClick={() => sessionStorage.setItem('prevUrl', routePath)}
                to="/login"
            >
                <span className="">Log in</span>
            </Link>
            <Link
                className="rn-button-style--2 rn-btn-reverse-green center_text"
                onClick={() => sessionStorage.setItem('prevUrl', routePath)}
                to="/signup"
            >
                <span className="">Become a Member</span>
            </Link>
        </div>
    )
}

export default MembershipBanner