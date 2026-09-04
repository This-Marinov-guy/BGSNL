import PropTypes from "prop-types";
import { IconlyNetwork } from "@/elements/ui/icons/IconlyIcons";
import { useNavigate, useParams } from "@/util/navigation";
import {
  LOCAL_STORAGE_LANGUAGE_PREFERENCE,
  PAGE_TRANSLATION_TEXTS,
} from "../../../util/defines/common";
import { encodeForURL } from "../../../util/functions/helpers";

const ChangeLanguageLinks = ({ post }) => {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const translations = Object.entries(post.translations ?? {});

  if (!translations.length) return null;

  const changeLanguage = (language, id) => {
    localStorage.setItem(LOCAL_STORAGE_LANGUAGE_PREFERENCE, language);
    navigate(`/articles/${id}/${encodeForURL(post.title)}`);
  };

  return (
    <nav className="article-language-switcher" aria-label="Article language">
      <span>
        <IconlyNetwork size={18} aria-hidden />
        Read in
      </span>
      <div>
        {translations.map(([language, id]) => {
          const isCurrent = String(id) === String(articleId);

          return (
            <button
              key={`${language}-${id}`}
              type="button"
              className={isCurrent ? "is-active" : undefined}
              aria-pressed={isCurrent}
              onClick={() => changeLanguage(language, id)}
            >
              {PAGE_TRANSLATION_TEXTS[language]?.button ?? language}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

ChangeLanguageLinks.propTypes = {
  post: PropTypes.shape({
    title: PropTypes.string.isRequired,
    translations: PropTypes.object,
  }).isRequired,
};

export default ChangeLanguageLinks;
