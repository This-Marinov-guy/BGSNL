import React, { Component, Fragment } from "react";
import Header from "../component/header/Header";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import ImageFb from "../elements/ui/media/ImageFb";

const Maintenance = () => {
    return (
        <Fragment>
            {/* Start Page Error  */}
            <div className="error-page-inner bg_color--4">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="inner">
                                <h1 className="theme-gradient">Maintenance Break</h1>
                                <p style={{ color: 'white', fontSize: '20px' }}>We are experiencing technical issues - please come back tomorrow! </p>
                                <ImageFb
                                    style={{ borderRadius: "50%", height: '100px', marginTop: '20px' }}
                                    src="/assets/images/logo/logo.webp"
                                    fallback="/assets/images/logo/logo.jpg"
                                    alt="Logo"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* End Page Error  */}


        </Fragment>
    );
};

export default Maintenance;
