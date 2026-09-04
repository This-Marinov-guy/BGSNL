import React from 'react'
import PropTypes from "prop-types";
import { Dialog } from "@/compat/primereact";
import { LOCAL_STORAGE_LANGUAGE_PREFERENCE, PAGE_TRANSLATION_TEXTS } from '../../../util/defines/common';
import ChangeLanguageBtns from '../buttons/ChangeLanguageBtns';

const LanguageChangeModal = ({ visible, callback, onHide, availableLanguages = ['bg', 'en'] }) => {
    const changeLanguage = (newLang) => {
        localStorage.setItem(LOCAL_STORAGE_LANGUAGE_PREFERENCE, newLang);
        callback(newLang)
        onHide();
    }

    const options = Object.fromEntries(
        Object.entries(PAGE_TRANSLATION_TEXTS).filter(([key]) => availableLanguages.includes(key))
    );

    const titles = Object.values(options).map(item => item.title);
    const actions = (
        <button onClick={onHide} className="rn-button-style--2 rn-btn-reverse">
            Close
        </button>
    );

    return (
        <Dialog
            modal
            header="Choose your language"
            visible={visible}
            blockScroll={true}
            onHide={onHide}
            footer={actions}
        >
            <div className="center_section center_text">
                {titles.map((t, i) => {
                    return (
                        <p key={i} className='mt--10'>{t}</p>
                    )
                })}
                <ChangeLanguageBtns callback={changeLanguage} availableLanguages={availableLanguages} />
            </div>
        </Dialog>
    )
}

LanguageChangeModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    callback: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    availableLanguages: PropTypes.arrayOf(PropTypes.string),
};

export default LanguageChangeModal
