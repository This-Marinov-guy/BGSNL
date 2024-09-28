import React from 'react'
import { Dialog } from 'primereact/dialog';
import { LOCAL_STORAGE_LANGUAGE_PREFERENCE, PAGE_TRANSLATION_TEXTS } from '../../../util/defines/common';
import ChangeLanguageBtns from '../buttons/ChangeLanguageBtns';

const LanguageChangeModal = ({ visible, callback, onHide, availableLanguages = ['bg', 'en'] }) => {
    const changeLanguage = (e) => {
        const newLang = e.target.id;

        localStorage.setItem(LOCAL_STORAGE_LANGUAGE_PREFERENCE, newLang);
        callback(newLang)
        onHide();
    }

    const options = Object.fromEntries(
        Object.entries(PAGE_TRANSLATION_TEXTS).filter(([key]) => availableLanguages.includes(key))
    );

    const titles = Object.values(options).map(item => item.title);
    const btnText = Object.values(options).map(item => ({
        text: item.button,
        value: item.value
    }));

    return (
        <Dialog modal visible={visible} blockScroll={true} onHide={onHide}>
            <div className="center_section center_text">
                {titles.map((t, i) => {
                    return (
                        <p key={i} className='mt--10'>{t}</p>
                    )
                })}
                <ChangeLanguageBtns callback={changeLanguage} availableLanguages={availableLanguages} />
                <button onClick={changeLanguage} className="rn-button-style--2 rn-btn-reverse mt--40">
                    Close
                </button>
            </div>
        </Dialog>
    )
}

export default LanguageChangeModal