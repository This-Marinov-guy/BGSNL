"use client";

import { Fragment } from "react";
import StaticHeaderLogo from "../component/header/StaticHeaderLogo";

const Maintenance = () => {
    return (
        <Fragment>
            <StaticHeaderLogo />
            {/* Start Page Error  */}
            <div className="error-page-inner bg_color--4">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="inner">
                                <h1 className="theme-gradient">Maintenance Break</h1>
                                <p style={{ color: 'white' }}>We are making some changes that require time - please check again in 10-15 minutes! </p>
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
