import React, { useState } from "react";
import Breadcrumb from "../../../elements/common/Breadcrumb";
import PageHelmet from "../../../component/common/Helmet";
import ScrollToTop from "react-scroll-up";
import ImageFb from "../../../elements/ui/ImageFb";
import { FiChevronUp } from "react-icons/fi";
import Header from "../../../component/header/Header";
import FooterTwo from "../../../component/footer/FooterTwo";
import { Dialog } from 'primereact/dialog';
import VideoPlayer from "../../../elements/ui/VideoPLayer";

const Minerva = () => {
    const [modal, setModal] = useState();

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
                    <p style={{ fontSize: '26px' }} className="mb--10">
                        Bulgarian student exhibitions in Groningen
                    </p>
                    <ImageFb
                        className="mt--20 mb--40"
                        src="/assets/images/profile/minerva/1.webp"
                        fallback="/assets/images/profile/minerva/1.jpeg"
                        alt="Article Images"
                    />
                    <p className="mb--40">
                        We had our very first Spring Gala on May 24th, which also happens to be the National Day of Literacy and Culture. Our team put together a cool gallery featuring artists from Academie Minerva. They’re gearing up for their big graduation exhibition happening from June 10th to 15th.
                    </p>

                    <h2 className="mt--40">
                        Exhibition Map
                    </h2>
                    <div className="row">
                        <div className="col-lg-4 col-md-6 col-12">
                            <h3 className="mt--20">SPOT - De Oosterport</h3>
                            <hr />
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
                            <h3 className="mt--20">Academie Minerva ZUIDERDIEP</h3>
                            <hr />

                            <h4 className="mt--20">
                                ZD0 | Ground floor, Central hall
                            </h4>

                            <p>
                                Valentina Zheleva
                            </p>
                            <h4 className="mt--20">ZD2 | 2nd floor, A-wing</h4>

                            <p>
                                Denisa Lukanova
                                <br />
                                Plamen Zlatanov
                                <br />
                                Margarita Spasova
                            </p>
                        </div>

                        <div className="col-lg-4 col-md-6 col-12">
                            <h3 className="mt--20">STICHTING SIGN
                            </h3>
                            <hr />

                            <p>
                                Antonio Todorov
                            </p>
                        </div>
                        <div className="col-lg-4 col-md-6 col-12">
                            <h3 className="mt--20">MUSEUM AAN DER A | MadA-3</h3>
                            <hr />

                            <p>
                                Alexandra Georgieva
                            </p>
                        </div>
                        <div className="col-lg-4 col-md-6 col-12">
                            <h3 className="mt--20">Graphic Museum GRID</h3>
                            <hr />

                            <p>
                                Ivena Srebcheva
                            </p>
                        </div>
                        <div className="col-lg-4 col-md-6 col-12">
                            <h3 className="mt--20">KUNSTPUNT</h3>
                            <hr />

                            <p>
                                Naomi Arnaudova
                            </p>
                        </div>
                    </div>
                    <a href="https://viewer.mapme.com/cb7dd22a-5629-491c-bcd8-f79a49876d26" target="_blank" className="rn-button-style--2 btn-solid mt--80"
                    >To the map</a>
                    <p>Be there <span style={{ color: "#ab1c02" }}>June 10 - 15</span></p>

                    <h2 className="mt--40">
                        Pick an artist - get inspired                    </h2>
                    <main className="page-wrapper">

                        <div className="rn-section ptb--60 bg_color--1">
                            <div className="container">
                                <div className="row sercice-details-content align-items-center">
                                    <div className="col-lg-4 mt--20">
                                        <h3 style={{ color: "#ab1c02" }}>Antonio Todorov</h3>

                                        <div className="thumb position-relative">
                                            <img
                                                className="w-80"
                                                src={'/assets/images/profile/minerva/antonio.jpg'}
                                                alt="Service Images"
                                            />
                                            <Dialog header="Antonio Todorov" visible={modal === '1'} style={{ width: 'auto', height: 'auto', maxWidth: '98%' }} onHide={() => setModal(null)}>
                                                <VideoPlayer src='91pmQa4nlvw' />
                                            </Dialog>
                                            <button
                                                style={{ scale: '0.7' }}

                                                className="video-popup position-top-center theme-color md-size"
                                                onClick={() => setModal('1')}
                                            >
                                                <span className="play-icon"></span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 mt--20">
                                        <h3 style={{ color: "#ab1c02" }}>Edi Baramov</h3>

                                        <div className="thumb position-relative">
                                            <img
                                                className="w-80"
                                                src={'/assets/images/profile/minerva/edi.jpg'}
                                                alt="Service Images"
                                            />
                                            <Dialog header="Edi Baramov" visible={modal === '2'} style={{ width: 'auto', height: 'auto', maxWidth: '98%' }} onHide={() => setModal(null)}>
                                                <VideoPlayer src='hQ3LP0Sjtp4' />
                                            </Dialog>
                                            <button
                                                style={{ scale: '0.7' }}

                                                className="video-popup position-top-center theme-color md-size"
                                                onClick={() => setModal('2')}
                                            >
                                                <span className="play-icon"></span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 mt--20">
                                        <h3 style={{ color: "#ab1c02" }}>Margarita Spasova</h3>
                                        <div className="thumb position-relative">
                                            <img
                                                className="w-80"
                                                src={'/assets/images/profile/minerva/margarita.jpg'}
                                                alt="Service Images"
                                            />
                                            <Dialog header="Margarita Spasova" visible={modal === '3'} style={{ width: 'auto', height: 'auto', maxWidth: '98%' }} onHide={() => setModal(null)}>
                                                <VideoPlayer src='CW4LhDfP7D0' />
                                            </Dialog>
                                            <button
                                                style={{ scale: '0.7' }}

                                                className="video-popup position-top-center theme-color md-size"
                                                onClick={() => setModal('3')}
                                            >
                                                <span className="play-icon"></span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 mt--20">
                                        <h3 style={{ color: "#ab1c02" }}>Marina Vasileva</h3>

                                        <div className="thumb position-relative">
                                            <img
                                                className="w-80"
                                                src={'/assets/images/profile/minerva/marina.jpg'}
                                                alt="Service Images"
                                            />
                                            <Dialog header="Marina Vasileva" visible={modal === '4'} style={{ width: 'auto', height: 'auto', maxWidth: '98%' }} onHide={() => setModal(null)}>
                                                <VideoPlayer src='RnsCHgPli70' />
                                            </Dialog>
                                            <button
                                                style={{ scale: '0.7' }}

                                                className="video-popup position-top-center theme-color md-size"
                                                onClick={() => setModal('4')}
                                            >
                                                <span className="play-icon"></span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 mt--20">
                                        <h3 style={{ color: "#ab1c02" }}>Naomi Arnaudova</h3>

                                        <div className="thumb position-relative">
                                            <img
                                                className="w-80"
                                                src={'/assets/images/profile/minerva/naomi.jpg'}
                                                alt="Service Images"
                                            />
                                            <Dialog header="Naomi Arnaudova" visible={modal === '5'} style={{ width: 'auto', height: 'auto', maxWidth: '98%' }} onHide={() => setModal(null)}>
                                                <VideoPlayer src='cbEQoLut3Dw' />
                                            </Dialog>
                                            <button
                                                style={{ scale: '0.7' }}

                                                className="video-popup position-top-center theme-color md-size"
                                                onClick={() => setModal('5')}
                                            >
                                                <span className="play-icon"></span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 mt--20">
                                        <h3 style={{ color: "#ab1c02" }}>Zlatelina Tsokova</h3>
                                        <div className="thumb position-relative">
                                            <img
                                                className="w-80"
                                                src={'/assets/images/profile/minerva/zlatelina.jpg'}
                                                alt="Service Images"
                                            />
                                            <Dialog header="Zlatelina Tsokova" visible={modal === '6'} style={{ width: 'auto', height: 'auto', maxWidth: '98%' }} onHide={() => setModal(null)}>
                                                <VideoPlayer src='Mrq9JJ6PvMA' />
                                            </Dialog>
                                            <button
                                                style={{ scale: '0.7' }}

                                                className="video-popup position-top-center theme-color md-size"
                                                onClick={() => setModal('6')}
                                            >
                                                <span className="play-icon"></span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 mt--20">
                                        <h3 style={{ color: "#ab1c02" }}>Yordan Mominski</h3>
                                        <div className="thumb position-relative">
                                            <img
                                                className="w-80"
                                                src={'/assets/images/profile/minerva/yordan.jpg'}
                                                alt="Service Images"
                                            />
                                            <Dialog header="Yordan Mominski" visible={modal === '7'} style={{ width: 'auto', height: 'auto', maxWidth: '98%' }} onHide={() => setModal(null)}>
                                                <VideoPlayer src='bw_UaGCqNU8' />
                                            </Dialog>
                                            <button
                                                style={{ scale: '0.7' }}

                                                className="video-popup position-top-center theme-color md-size"
                                                onClick={() => setModal('7')}
                                            >
                                                <span className="play-icon"></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>


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
