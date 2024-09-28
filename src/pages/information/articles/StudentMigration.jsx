import React, { useEffect, useState } from "react";
import Breadcrumb from "../../../elements/common/Breadcrumb";
import PageHelmet from "../../../component/common/Helmet";
import ScrollToTop from "react-scroll-up";
import ImageFb from "../../../elements/ui/media/ImageFb";
import { FiChevronUp } from "react-icons/fi";
import Header from "../../../component/header/Header";
import FooterTwo from "../../../component/footer/FooterTwo";
import LanguageChangeModal from "../../../elements/ui/modals/LanguageChangeModal";
import { LOCAL_STORAGE_LANGUAGE_PREFERENCE } from "../../../util/defines/common";
import { ARTICLE_FROM_BG_TO_NL } from "../../../util/defines/ARTICLES";
import ChangeLanguageBtns from "../../../elements/ui/buttons/ChangeLanguageBtns";
import { object } from "yup";

const StudentMigration = () => {
    let savedLanguage = localStorage.getItem(LOCAL_STORAGE_LANGUAGE_PREFERENCE);
    savedLanguage = savedLanguage in ARTICLE_FROM_BG_TO_NL ? savedLanguage : 'en';

    const [isChangeLangModal, setIsChangeLangModal] = useState(false);
    const [text, setText] = useState(ARTICLE_FROM_BG_TO_NL[savedLanguage]);

    const changeLanguage = (newLang) => {
        setText(ARTICLE_FROM_BG_TO_NL[newLang])
    };

    useEffect(() => {
        if (!localStorage.getItem(LOCAL_STORAGE_LANGUAGE_PREFERENCE)) {
            setIsChangeLangModal(true);
        }
    }, []);

    return <React.Fragment>
        <PageHelmet pageTitle="Articles" />
        <Header
            headertransparent="header--transparent"
            colorblack="color--black"
            logoname="logo.png"
        />
        {/* Start Breadcrump Area */}
        <Breadcrumb title={text.heading} category='Articles' />
        {/* End Breadcrump Area */}

        <ChangeLanguageBtns callback={changeLanguage} />
        <LanguageChangeModal visible={isChangeLangModal} callback={changeLanguage} onHide={() => setIsChangeLangModal(false)} />
        {/* Start Article  Details */}
        <div
            className="rn-blog-details article pt--110 pb--70 pr--10 pl--10 bg_color--1"
        >
            <div className="inner-wrapper">
                <div className="inner">
                    <h2 style={{ textAlign: "start", fontSize: '32px', fontFamily: 'Archive' }}>
                        {text.title}
                    </h2>
                    <h5 style={{ color: '#017363',textAlign: "end", fontSize: '22px' }} className="mb--60">
                        {text.author} | {text.date} | {text.time}
                    </h5>
                    <p className="mt--20 mb--40">
                        {text.para1}
                    </p>

                    <div className='center_div_col mb--40'>
                        <ImageFb
                            style={{ width: '15em', objectFit: 'contain' }}
                            src={ARTICLE_FROM_BG_TO_NL.folder + '1.webp'}
                            fallback={ARTICLE_FROM_BG_TO_NL.folder + '1.jpg'}
                            alt="BLog Images"
                        />
                        <h5 className="mt--10">
                            {text.imgDesc1}
                        </h5>
                    </div>

                    <p className="mb--40">
                        {text.para2}
                    </p>

                    <p className="mb--40">
                        {text.para3}
                    </p>

                    <p className="mb--40">
                        {text.para4}
                    </p>

                    <p className="mb--40">
                        {text.para5}
                    </p>

                    <p className="mb--40">
                        {text.para6}
                    </p>

                    <p className="mb--40">
                        {text.para7}
                    </p>

                    <p className="mb--40">
                        {text.para8}
                    </p>

                    <p className="mb--40">
                        {text.para9}
                    </p>

                    <p className="mb--40">
                        {text.para10}
                    </p>

                    <p className="mb--40">
                        {text.para11}
                    </p>

                    <div className='center_div_col mb--40'>
                        <ImageFb
                            style={{ width: '15em', objectFit: 'contain' }}
                            src={ARTICLE_FROM_BG_TO_NL.folder + '2.webp'}
                            fallback={ARTICLE_FROM_BG_TO_NL.folder + '2.jpg'}
                            alt="BLog Images"
                        />
                        <h5 className="mt--10">
                            {text.imgDesc2}
                        </h5>
                    </div>

                    <p className="mb--40">
                        {text.para12}
                    </p>

                    <p className="mb--40">
                        {text.para13}
                    </p>

                    <p className="mb--40">
                        {text.para14}
                    </p>
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

export default StudentMigration
