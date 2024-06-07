import React from "react";
import Breadcrumb from "../../../elements/common/Breadcrumb";
import PageHelmet from "../../../component/common/Helmet";
import ScrollToTop from "react-scroll-up";
import ImageFb from "../../../elements/ui/ImageFb";
import { FiChevronUp } from "react-icons/fi";
import Header from "../../../component/header/Header";
import FooterTwo from "../../../component/footer/FooterTwo";
import { Image } from 'primereact/image';

const Minerva = () => {
    return <React.Fragment>
        <PageHelmet pageTitle="Articles" />
        <Header
            headertransparent="header--transparent"
            colorblack="color--black"
            logoname="logo.png"
        />
        {/* Start Breadcrump Area */}
        <Breadcrumb title={"Academie Minerva"} category='Articles' />
        {/* End Breadcrump Area */}
        {/* <div className="container mt--80 mb--80">

            <h2 className="title">Society Articles</h2>
            <ul>
                <p>

                </p>
            </ul>

        </div> */}
        {/* Start Article  Details */}
        <div
            className="rn-blog-details article pt--110 pb--70 pr--10 pl--10 bg_color--1"
        >
            <div className="inner-wrapper">
                <div className="inner">
                    <h2 style={{ textAlign: "start", fontSize: '44px' }}>
                        Exhibitions you don't want to miss
                    </h2>
                    <p style={{ textAlign: "end", fontSize: '26px' }} className="mb--10">
                        Introducing the prestige of Groningen's artisits
                    </p>
                    <ImageFb
                        className="mt--20 mb--40"
                        src="/assets/images/profile/minerva/1.webp"
                        fallback="/assets/images/profile/minerva/1.jpeg"
                        alt="Article Images"
                    />
                    <p className="mb--40">
                        Our first Spring Gala is a fact. the event was held on the 24th of May - the national day of literacy and culture. To celebrate the occasion, our team introduced a small gallery on the venue, on which artist from Academie Minerva presented their works prior the graduation exebition happeing 10th to 15th of June.
                    </p>
                    {/* <div className="blog-single-list-wrapper d-flex flex-wrap">
                        <div className="thumb position-relative">
                            <Image src="/assets/images/profile/minerva/1Edi.mp4" alt="Image" width="250" preview />
                            <button
                                className="video-popup position-top-center black-color"
                                onClick={() => { }}
                            >
                                <span className="play-icon"></span>
                            </button>
                        </div>
                        <div className="content">
                            <p>
                                minerva is a Bachelor student in Journalism from University
                                of Sofia in Bulgaria. His education is not in any way
                                related to business or entrepreneurship, yet he was able
                                to start a business, showing that this can be achieved
                                by anyone who has enough passion, patience and support.
                                minerva claims that this can be done by anyone with no
                                business knowledge and all that it is needed are “small
                                and gradual steps”.
                            </p>
                        </div>
                    </div> */}
                    <h2 className="mt--80">
                        Exhibition Map
                    </h2>
                    <div className="row">
                        <div className="col-lg-4 col-md-6 col-12">
                            <h4 className="mt--20">Oosterpoort concert building</h4>
                            <hr/>
                            <p>
                                Daniel Damev
                                <br />
                                Plamen Zlatanov
                                <br />
                                Simona Teneva
                                <br />
                                Theresa Konova
                                <br />
                                Yordan Mominski

                            </p>
                        </div>
                        <div className="col-lg-4 col-md-6 col-12">
                            <h4 className="mt--20">
                                ZD0 | Ground floor, Central hall
                            </h4>
                            <hr/>

                            <p>
                                Valentina Zheleva
                            </p>
                        </div>
                        <div className="col-lg-4 col-md-6 col-12">
                            <h4 className="mt--20">ZD2 | 2nd floor, A-wing</h4>
                            <hr/>

                            <p>
                                Denisa Lukanova
                                <br />
                                Plamen Zlatanov
                                <br />
                                Margarita Spasova
                            </p>
                        </div>
                        <div className="col-lg-4 col-md-6 col-12">
                            <h4 className="mt--20">STICHTING SIGN
                            </h4>
                            <hr/>

                            <p>
                                Antonio Todorov
                            </p>
                        </div>
                        <div className="col-lg-4 col-md-6 col-12">
                            <h4 className="mt--20">MUSEUM AAN DER A | MadA-3</h4>
                            <hr/>

                            <p>
                                Alexandra Georgieva
                            </p>
                        </div>
                        <div className="col-lg-4 col-md-6 col-12">
                            <h4 className="mt--20">Graphic Museum GRID</h4>
                            <hr/>

                            <p>
                                Ivena Srebcheva
                            </p>
                        </div>
                        <div className="col-lg-4 col-md-6 col-12">
                            <h4 className="mt--20">KUNSTPUNT</h4>
                            <hr/>

                            <p>
                                Naomi Arnaudova
                            </p>
                        </div>
                    </div>
                    <a href="https://viewer.mapme.com/cb7dd22a-5629-491c-bcd8-f79a49876d26" target="_blank" className="rn-button-style--2 btn-solid mt--80"
                    >To the map</a>
                    <p>Be there <span style={{ color: "#ab1c02" }}>June 10 - 15</span></p>
                </div>
            </div>
        </div>
        {/* End Article  Details */}
        {/* Start Back To Top */}
        <div className="backto-top">
            <ScrollToTop showUnder={160}>
                <FiChevronUp />
            </ScrollToTop>
        </div>
        {/* End Back To Top */}

        <FooterTwo />
    </React.Fragment>
}

export default Minerva
