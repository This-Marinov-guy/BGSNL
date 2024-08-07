import React from "react";
import Breadcrumb from "../../elements/common/Breadcrumb";
import PageHelmet from "../../component/common/Helmet";
import ScrollToTop from "react-scroll-up";
import ImageFb from "../../elements/ui/media/ImageFb";
import { FiChevronUp } from "react-icons/fi";
import Header from "../../component/header/Header";
import FooterTwo from "../../component/footer/FooterTwo";

const Gala = () => {
    return <React.Fragment>
        <PageHelmet pageTitle="Gala" />
        <Header
            headertransparent="header--transparent"
            colorblack="color--black"
            logoname="logo.png"
        />
        {/* Start Breadcrump Area */}
        <Breadcrumb title={"Gala"} />
        {/* End Breadcrump Area */}
        {/* <div className="container mt--80 mb--80">

            <h2 className="title">Society Gala</h2>
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
                    <h2 className="center_text mb--20">
                        Open Call for artists
                    </h2>
                    <div className="row">
                        <img
                            className="col-lg-6 col-12 mt--20"
                            style={{ width: '300px' }}
                            src="/assets/images/news/gala.jpg"
                            alt="Article Images"
                        />
                        <p className="col-lg-6 col-12 mt--20">
                            До всички артисти и любители на изкуството в Холандия, предстои прекрасна възможност да развихрите креативния си дух и да споделите вашите произведения на изкуството с по-широка публика!
                            Тема на изложбата за предстоящата Гала вечер е <span style={{ color: 'black' }}>„Криворазбраната цивилизация“.</span>
                            <br />
                            <br />
                            С тази изложба като част от <span style={{ color: 'black' }}>Пролетната Гала на 24 май 2024</span> целим да представим изкуството на български студенти и артисти пред разностранна публика в Грьонинген. Темата е със свободна и обширна интерпретация, целяща да транспортира публиката, да препрати към дадени преживявания или да замисли обществото по различни въпроси. Може да изпратите вече готови творби или да изговите такива целенасочено.


                        </p>
                    </div>
                    <div className="row mt--20">
                        <div className="col-12">
                            <p>
                                <span style={{ color: 'black' }}>Максималният брой творби</span>, които може да изпратите за ревизия, е 5, от които ние ще изберем до 3, които да бъдат част от изложбата.
                                <br />
                                <br />
                                Формулярът може да се изпрати многократно, в случай, че искате да допълните кандидатурата си на по-късен етап.
                                <br />
                                <br />
                                Програмата предвижда и организирането на базар. Който има желание за участие може да заяви интерес. Детайлите и покана за участие в базара ще ви бъдат изпратени на по-късен етап.
                            </p>
                        </div>
                    </div>
                    <div className="row mt--20">
                        <div className="col-12">
                            <p>
                                Краен срок: <span style={{color:'red'}}> 1 май 2024</span>
                                <br />
                                <br />
                                Избор на творби: <span style={{color:'red'}}>до 8 май 2024</span>
                                <br />
                                <br />
                                Краен срок за получаване на готовите произведения: <span style={{color:'red'}}>20 май 2024</span>
                            </p>
                        </div>
                    </div>
                    <div className="row mt--20">
                        <div className="col-12">
                            <h3>Формуляр за записване: <a href='/assets/images/files/gala.docx' target="_blank">Натисни за да изтеглиш формата</a></h3>
                        </div>
                        <div className="col-12 mt--20">
                            <p>
                                Изтеглете формуляра за участие и го изпратете попълнен на <a href='mailto:bulgariansociety.gro@gmail.com' target='_blank'>bulgariansociety.gro@gmail.com</a> с тема Gala Exhibition Submission. Прикачете снимките и/или видеото.
                                <br />
                                <br />
                                За въпроси, свържете се с нас на имейла ни или чрез инстаграм.
                            </p>
                        </div>
                    </div>
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
    </React.Fragment >
}

export default Gala