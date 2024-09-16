import React from "react";
import Card2 from "../cards/Card2";
import { useDispatch, useSelector } from 'react-redux';
import { showModal } from '../../../redux/modal';
import { WEB_DEV_MODAL } from '../../../util/defines/common';
import { REGION_INSTAGRAM } from "../../../util/defines/REGIONS_DESIGN";
import { selectIsAuth } from "../../../redux/user";
import { useLocation } from "react-router-dom";

const NewsList = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const isAuth = useSelector(selectIsAuth)

    const NEWS = [
        {
            image: "/assets/images/bg/bg-image-9.webp",
            title: "Sign up!",
            description: "Membership 2024-2025 are officially open.",
            link: '/signup',
            action: ``,
            isForMember: false,
        },
        {
            image: "/assets/images/profile/minerva/1.webp",
            title: "Academie Minerva",
            description: "Еxhibitions of Bulgarian students in Groningen",
            link: '/articles/acedemie-minerva',
            action: ``,
            isForMember: true,

        },
        {
            image: "/assets/images/news/designer.png",
            title: "Web recruit",
            description: "Contribute to this amazing platform and support the society. Apply now!",
            link: '',
            action: () => dispatch(showModal(WEB_DEV_MODAL)),
            isForMember: true,
        },
    ];

    const MEMBER_NEWS = [
        ...NEWS.filter((n) => n.isForMember),
    ];

    const newsArray = (isAuth && location.pathname === '/user') ? MEMBER_NEWS : NEWS;

    return <div className="rn-featured-service-area bg_color--5 pb--40">
        <div className="container">
            <div className="row">
                {/* Start Single Service  */}
                <div className="col-lg-3 col-md-6 col-12 mt--30">
                    <div className="section-title">
                        <h2 className="title">News</h2>
                        <p>
                           Find everything recent with the society here or on our social media channels.
                        </p>
                    <div className="service-btn">
                        {/* //add link */}
                            <a className="btn-transparent rn-btn-dark" href={REGION_INSTAGRAM['netherlands'] ?? ''} target="_blank">
                                <span className="text">Social media</span>
                            </a>
                        </div>
                    </div>
                </div>
                {/* End Single Service  */}

                {/* Start Single Service  */}
                <div className="col-lg-9">
                    <div className="row">
                        {newsArray.length ? newsArray.map((value, index) => (
                            <Card2 key={index} {...value}/>
                        )) : <p>No recent news - stay tuned for updates!</p>}
                    </div>
                </div>
                {/* End Single Service  */}
            </div>
        </div>
    </div>
}

export default NewsList;
