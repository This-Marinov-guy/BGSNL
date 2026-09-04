"use client";

import PropTypes from "prop-types";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ScrollToTop from "@/component/common/ScrollToTop";
import {
  FiChevronUp,
  IconlyArrowLeft,
  IconlyArrowRight,
  IconlyCalendar,
  IconlyClose,
  IconlyMaximize,
  IconlyProfile,
  IconlyTimeCircle,
} from "@/elements/ui/icons/IconlyIcons";
import { Link, useParams } from "@/util/navigation";
import FooterTwo from "../../../component/footer/FooterTwo";
import HeaderTwo from "../../../component/header/HeaderTwo";
import ChangeLanguageLinks from "../../../elements/ui/buttons/ChangeLanguageLinks";
import NoArticleFound from "../../../elements/ui/errors/NoArticleFound";
import PageLoading from "../../../elements/ui/loading/PageLoading";
import { useArticlesLoad } from "../../../hooks/common/api-hooks";
import { selectSingleArticle } from "../../../redux/articles";
import { selectPageLoading } from "../../../redux/loading";

const FIRST_PARAGRAPH_PATTERN = /^\s*<p\b[^>]*>([\s\S]*?)<\/p>/i;
const META_ICONS = [IconlyProfile, IconlyCalendar, IconlyTimeCircle];

const getImageDescription = (image, articleTitle) =>
  image.alt?.trim() ||
  image.dataset.imageTitle?.trim() ||
  image.closest("figure")?.querySelector("figcaption")?.textContent?.trim() ||
  `${articleTitle} — article image`;

const stripHtml = (value) =>
  value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim();

const separateArticleMetadata = (content = "") => {
  const firstParagraph = content.match(FIRST_PARAGRAPH_PATTERN);

  if (!firstParagraph) {
    return { body: content, metadata: [] };
  }

  const metadata = stripHtml(firstParagraph[1])
    .split(/\s*\|\s*/)
    .filter(Boolean);

  if (metadata.length < 2) {
    return { body: content, metadata: [] };
  }

  return {
    body: content.replace(firstParagraph[0], ""),
    metadata: metadata.slice(0, 3),
  };
};

/**
 * `initialArticle` is fetched on the server by the route, so the post body is
 * in the HTML instead of arriving after reloadArticleDetails() runs.
 */
const Article = ({ initialArticle = null }) => {
  const { articleId } = useParams();
  const { reloadArticleDetails } = useArticlesLoad();
  const storedArticle = useSelector(selectSingleArticle);
  const storedArticleMatchesRoute =
    String(storedArticle?.id) === String(articleId);
  const selectedArticle = storedArticleMatchesRoute
    ? storedArticle
    : initialArticle;
  const pageLoading = useSelector(selectPageLoading);
  const contentRef = useRef(null);
  const closeButtonRef = useRef(null);
  const imageTriggerRef = useRef(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [articleLookupComplete, setArticleLookupComplete] = useState(
    Boolean(initialArticle)
  );
  const parsedArticle = useMemo(
    () => separateArticleMetadata(selectedArticle?.content),
    [selectedArticle?.content]
  );

  useEffect(() => {
    if (initialArticle) {
      setArticleLookupComplete(true);
      return undefined;
    }

    let isCurrentRoute = true;
    setArticleLookupComplete(false);

    reloadArticleDetails(articleId).finally(() => {
      if (isCurrentRoute) setArticleLookupComplete(true);
    });

    return () => {
      isCurrentRoute = false;
    };
  }, [articleId, initialArticle]);

  useEffect(() => {
    const images = contentRef.current?.querySelectorAll("img") ?? [];

    images.forEach((image) => {
      const description = getImageDescription(image, selectedArticle?.title);

      image.classList.add("article-reader-expandable-image");
      image.setAttribute("tabindex", "0");
      image.setAttribute("role", "button");
      image.setAttribute("aria-haspopup", "dialog");
      image.setAttribute("aria-label", `Expand ${description}`);
    });

    return () => {
      images.forEach((image) => {
        image.classList.remove("article-reader-expandable-image");
        image.removeAttribute("tabindex");
        image.removeAttribute("role");
        image.removeAttribute("aria-haspopup");
        image.removeAttribute("aria-label");
      });
    };
  }, [parsedArticle.body, selectedArticle?.title]);

  useEffect(() => {
    if (!expandedImage) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleDialogKeyDown = (event) => {
      if (event.key === "Escape") {
        setExpandedImage(null);
      }

      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleDialogKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleDialogKeyDown);
      imageTriggerRef.current?.focus();
    };
  }, [expandedImage]);

  const openImage = (image) => {
    imageTriggerRef.current = image;
    setExpandedImage({
      alt: getImageDescription(image, selectedArticle.title),
      src: image.currentSrc || image.src,
    });
  };

  const handleArticleImageClick = (event) => {
    const image = event.target.closest("img.article-reader-expandable-image");

    if (!image || !contentRef.current?.contains(image)) return;

    event.preventDefault();
    openImage(image);
  };

  const handleArticleImageKeyDown = (event) => {
    const image = event.target.closest("img.article-reader-expandable-image");

    if (!image || !["Enter", " "].includes(event.key)) return;

    event.preventDefault();
    openImage(image);
  };

  if (!selectedArticle && (pageLoading || !articleLookupComplete)) {
    return <PageLoading />;
  }

  if (!selectedArticle) {
    return <NoArticleFound />;
  }

  return (
    <>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      <main className="article-reader-page">
        <header className="article-reader-hero">
          <div className="container">
            <Link className="article-reader-back" to="/articles">
              <IconlyArrowLeft size={18} aria-hidden />
              All articles
            </Link>
            <h1>{selectedArticle.title}</h1>

            {parsedArticle.metadata.length > 0 && (
              <ul className="article-reader-meta" aria-label="Article details">
                {parsedArticle.metadata.map((item, index) => {
                  const MetaIcon = META_ICONS[index] ?? IconlyCalendar;

                  return (
                    <li key={item}>
                      <MetaIcon size={18} aria-hidden />
                      <span>{item}</span>
                    </li>
                  );
                })}
              </ul>
            )}

            {selectedArticle.withTranslation && (
              <ChangeLanguageLinks post={selectedArticle} />
            )}
          </div>
        </header>

        <section className="article-reader-shell">
          <style>{selectedArticle.styles}</style>
          <div
            className="wordpress-embedded-container article-reader-content"
            onClick={handleArticleImageClick}
            onKeyDown={handleArticleImageKeyDown}
            ref={contentRef}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: parsedArticle.body,
              }}
            />
          </div>
        </section>

        <nav className="article-reader-footer" aria-label="Article navigation">
          <Link to="/articles">
            Browse more stories
            <IconlyArrowRight size={19} aria-hidden />
          </Link>
        </nav>
      </main>

      {expandedImage && (
        <div
          aria-label="Expanded article image"
          aria-modal="true"
          className="article-image-lightbox"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setExpandedImage(null);
          }}
          role="dialog"
        >
          <div className="article-image-lightbox__panel">
            <button
              aria-label="Close expanded image"
              className="article-image-lightbox__close"
              onClick={() => setExpandedImage(null)}
              ref={closeButtonRef}
              type="button"
            >
              <IconlyClose size={22} aria-hidden />
            </button>
            <img src={expandedImage.src} alt={expandedImage.alt} />
            <span className="article-image-lightbox__label">
              <IconlyMaximize size={17} aria-hidden />
              Full-size view
            </span>
          </div>
        </div>
      )}

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>

      <FooterTwo />
    </>
  );
};

Article.propTypes = {
  initialArticle: PropTypes.shape({
    content: PropTypes.string,
    styles: PropTypes.string,
    title: PropTypes.string,
    withTranslation: PropTypes.bool,
  }),
};

export default Article;
