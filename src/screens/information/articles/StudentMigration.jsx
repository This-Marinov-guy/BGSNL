"use client";

import React, {
  useEffect,
  useState,
} from "react";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import PageHelmet from "../../../component/common/Helmet";
import FooterTwo from "../../../component/footer/FooterTwo";
import Header from "../../../component/header/Header";
import Breadcrumb from "../../../elements/common/Breadcrumb";
import ChangeLanguageBtns from "../../../elements/ui/buttons/ChangeLanguageBtns";
import ImageFb from "../../../elements/ui/media/ImageFb";
import LanguageChangeModal from "../../../elements/ui/modals/LanguageChangeModal";
import { ARTICLE_FROM_BG_TO_NL } from "../../../util/defines/ARTICLES";
import { LOCAL_STORAGE_LANGUAGE_PREFERENCE } from "../../../util/defines/common";

const StudentMigration = () => {
    const [isChangeLangModal, setIsChangeLangModal] = useState(false);
    // Starts on English and switches after mount: localStorage does not exist
    // during server rendering, and reading it in the render body crashed SSR.
    const [text, setText] = useState(ARTICLE_FROM_BG_TO_NL['en']);

    useEffect(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_LANGUAGE_PREFERENCE);
        if (saved && saved in ARTICLE_FROM_BG_TO_NL) {
            setText(ARTICLE_FROM_BG_TO_NL[saved]);
        }
    }, []);

    const changeLanguage = (newLang) => {
        setText(ARTICLE_FROM_BG_TO_NL[newLang])
    };

    useEffect(() => {
        if (!localStorage.getItem(LOCAL_STORAGE_LANGUAGE_PREFERENCE)) {
            setIsChangeLangModal(true);
        }
    }, []);

    return <React.Fragment>
        <PageHelmet
            pageTitle={text.title}
            image={ARTICLE_FROM_BG_TO_NL.folder + "1.webp"}
            type="article"
        />
        <Header
            headertransparent="header--transparent"
            colorblack="color--black"
            logoname="logo.png"
        />
        <Breadcrumb
            title={text.heading}
            description="A practical student perspective on moving from Bulgaria to the Netherlands."
        />

        <ChangeLanguageBtns callback={changeLanguage} />
        <LanguageChangeModal visible={isChangeLangModal} callback={changeLanguage} onHide={() => setIsChangeLangModal(false)} />
        {/* Start Article  Details */}
        <div
            className="rn-blog-details article pt--110 pb--70 pr--10 pl--10 bg_color--1"
        >
            <div className="inner-wrapper">
                <div className="inner">
                    <h2 style={{ textAlign: "start", fontFamily: 'Archive' }}>
                        {text.title}
                    </h2>
                    <h5 style={{ color: '#017363',textAlign: "end" }} className="mb--60">
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
                            alt="Blog Image"
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
                <FiChevronUp size={26} />
            </ScrollToTop>
        </div>
        {/* End Back To Top */}

        <FooterTwo />
    </React.Fragment>
}

export default StudentMigration
