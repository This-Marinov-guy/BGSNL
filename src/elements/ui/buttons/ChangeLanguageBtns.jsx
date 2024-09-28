import React from 'react'
import { LOCAL_STORAGE_LANGUAGE_PREFERENCE, PAGE_TRANSLATION_TEXTS } from '../../../util/defines/common';

const ChangeLanguageBtns = ({ callback, availableLanguages = ['bg', 'en'] }) => {
    const changeLanguage = (e) => {
        const newLang = e.target.id;

        localStorage.setItem(LOCAL_STORAGE_LANGUAGE_PREFERENCE, newLang);
        callback(newLang);
    }

    const options = Object.fromEntries(
        Object.entries(PAGE_TRANSLATION_TEXTS).filter(([key]) => availableLanguages.includes(key))
    );

    const btnText = Object.values(options).map(item => ({
        text: item.button,
        value: item.value
    }));

  return (
      <div className="mt--20">
          <ul className="brand-style-2">
              {btnText.map((b, index) => {
                  return <li key={index}>
                      <button
                          key={index}
                          id={b.value}
                          className={`rn-button-style--2 rn-btn-solid-green`}
                          onClick={changeLanguage}
                      >{b.text}</button>
                  </li>
              })}

          </ul>
      </div>
  )
}

export default ChangeLanguageBtns