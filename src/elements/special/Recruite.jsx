import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { showModal } from '../../redux/modal';
import { WEB_DEV_MODAL } from '../../util/defines/common';

const Recruit = () => {
    const dispatch = useDispatch();

    return (
        <Fragment>
            <p className="mb--20">BGSNL is looking for a web designer - if you have some experience with HTML and CSS and want to contribute to this amazing platform, join our team and get amazing benefits such as events discount, great network of people and the best of feelings of contributing to a society. <br /> <Link to='#' onClick={() => dispatch(showModal(WEB_DEV_MODAL))}>Click here to sign for the position</Link></p>
            <img style={{ width: '300px' }} onClick={() => dispatch(showModal(WEB_DEV_MODAL))} src='/assets/images/news/designer.png' />
        </Fragment>
    )
}

export default Recruit