import React from "react";
import {
  LOCAL_STORAGE_LANGUAGE_PREFERENCE,
  PAGE_TRANSLATION_TEXTS,
} from "../../../util/defines/common";
import { useNavigate } from "react-router-dom";
import { encodeForURL } from "../../../util/functions/helpers";

const ChangeLanguageLinks = ({ post }) => {
  if (!post.translations) return null;

  const navigate = useNavigate();

  const changeLanguage = (e) => {
    const newLang = e.target.name;
    const id = e.target.id;

    localStorage.setItem(LOCAL_STORAGE_LANGUAGE_PREFERENCE, newLang);

    navigate(`/articles/${id}/${encodeForURL(post.title)}`);
  };

  const btnText = Object.entries(post.translations).map(([value, id]) => ({
    id,
    value,
  }));

  return (
    <div>
      <ul className="brand-style-2">
        {btnText.map((b, index) => {
          return (
            <li key={index}>
              <button
                key={index}
                id={b.id}
                name={b.value}
                className={`rn-button-style--2 rn-btn-solid-green`}
                onClick={changeLanguage}
              >
                {PAGE_TRANSLATION_TEXTS[b.value]
                  ? PAGE_TRANSLATION_TEXTS[b.value]["button"]
                  : b.value}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChangeLanguageLinks;
