import React, { useEffect, useState } from 'react'
import HeaderTwo from '../../../component/header/HeaderTwo'
import ImageFb from '../media/ImageFb'
import { Link, useNavigate } from 'react-router-dom'
import Fade from 'react-bootstrap/Fade';

const HeaderLoadingError = () => {
    const navigate = useNavigate();
    const [showBtns, setShowBtns] = useState(false);

    useEffect(() => {
        setTimeout(() => setShowBtns(true), 5000)
    }, [])

    return (
        <>
            <HeaderTwo />
            <div className="ver_section mt--200">
                <ImageFb
                    className="logo"
                    src="/assets/images/logo/logo.webp"
                    fallback="/assets/images/logo/logo.jpg"
                    alt="Logo"
                />
                <h3>Loading...</h3>
                <Fade in={showBtns}>
                    <div className="error-button mt--60">
                        <h4>It seems that you have been waiting too long - if there is an issue, please contact support!</h4>
                        <div className="options-btns-div ">
                            <button
                                onClick={() => {
                                    window.location.reload()
                                }}
                                className="rn-button-style--2 rn-btn-reverse-green"
                            >
                                Try again
                            </button>
                            <button
                                onClick={() => navigate(-1)}
                                className="rn-button-style--2 rn-btn-reverse"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </Fade>
            </div>
        </>
    )
}

export default HeaderLoadingError