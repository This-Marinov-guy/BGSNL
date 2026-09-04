"use client";

import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  FiChevronUp,
  IconlyArrowRight,
  IconlyDocument,
  IconlySearch,
} from "@/elements/ui/icons/IconlyIcons";
import { Link, useSearchParams } from "@/util/navigation";
import PageHelmet from "../../../component/common/Helmet";
import ScrollToTop from "../../../component/common/ScrollToTop";
import Footer from "../../../component/footer/Footer";
import HeaderTwo from "../../../component/header/HeaderTwo";
import Pagination from "../../../elements/common/Pagination";
import ArticleCard from "../../../elements/ui/cards/ArticleCard";
import PageLoading from "../../../elements/ui/loading/PageLoading";
import { selectArticles } from "../../../redux/articles";
import { encodeForURL } from "../../../util/functions/helpers";

const INITIAL_ITEMS_PER_PAGE = 6;

const getArticleLink = (article) =>
  article.legacyLink ??
  `/articles/${article.id}/${encodeForURL(article.title)}`;

/**
 * `initialArticles` is fetched on the server by app/(site)/articles/page.jsx so
 * the list is in the HTML. The store is empty during SSR and on the client's
 * first render, so both produce the same markup; once MainLayout's
 * reloadArticles() populates Redux, the store takes over.
 */
const ArticlesPage = ({ initialArticles = [] }) => {
  const storedArticles = useSelector(selectArticles);
  const articles = storedArticles?.length ? storedArticles : initialArticles;
  const featuredArticle = articles[0];
  const otherArticles = useMemo(() => articles.slice(1), [articles]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Math.max(0, Number(searchParams.get("page") || 1) - 1);
  const currentPageParam = searchParams.get("page") || "1";
  const [query, setQuery] = useState("");
  const [first, setFirst] = useState(initialPage * INITIAL_ITEMS_PER_PAGE);
  const [rows, setRows] = useState(INITIAL_ITEMS_PER_PAGE);

  useEffect(() => {
    const scrollToPageStart = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    scrollToPageStart();
    const frame = window.requestAnimationFrame(scrollToPageStart);

    return () => window.cancelAnimationFrame(frame);
  }, [currentPageParam]);

  const filteredArticles = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase();

    if (!keyword) return otherArticles;

    return otherArticles.filter((article) =>
      `${article.title ?? ""} ${article.description ?? ""}`
        .toLocaleLowerCase()
        .includes(keyword)
    );
  }, [otherArticles, query]);

  const handleSearch = (event) => {
    setQuery(event.target.value);
    setFirst(0);
  };

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    setSearchParams({ page: event.page + 1 });
  };

  if (!articles?.length) {
    return <PageLoading />;
  }

  const featuredLink = getArticleLink(featuredArticle);
  const lastPageStart = Math.max(
    0,
    Math.floor((filteredArticles.length - 1) / rows) * rows
  );
  const visibleFirst = Math.min(first, lastPageStart);
  const visibleArticles = filteredArticles.slice(
    visibleFirst,
    visibleFirst + rows
  );
  const resultLabel = query.trim()
    ? `${filteredArticles.length} ${
        filteredArticles.length === 1 ? "result" : "results"
      }`
    : `${otherArticles.length} stories`;

  return (
    <>
      <PageHelmet
        pageTitle="Articles"
        image="/assets/images/avatars/article.png"
        canonicalUrl="https://www.bulgariansociety.nl/articles"
      />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      <main className="articles-page">
        <div className="container">
          <header className="articles-page-hero">
            <h1>Stories from our community</h1>
            <p>
              Discover the people, ideas, and experiences bringing Bulgarians
              in the Netherlands closer together.
            </p>
          </header>

          <section
            className="articles-featured"
            aria-labelledby="featured-article-title"
          >
            <Link className="articles-featured-image" to={featuredLink}>
              <img
                src={featuredArticle.thumbnail}
                alt={`${featuredArticle.title} article cover`}
                fetchPriority="high"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src =
                    "/assets/images/avatars/article.png";
                }}
              />
            </Link>
            <div className="articles-featured-content">
              <span className="articles-featured-label">
                <IconlyDocument size={18} aria-hidden />
                Latest story
              </span>
              <h2 id="featured-article-title">
                <Link to={featuredLink}>{featuredArticle.title}</Link>
              </h2>
              <p>{featuredArticle.description}</p>
              <Link className="articles-featured-link" to={featuredLink}>
                Read the story
                <IconlyArrowRight size={20} aria-hidden />
              </Link>
            </div>
          </section>

          <section
            className="articles-library"
            aria-labelledby="all-articles-title"
          >
            <div className="articles-library-toolbar">
              <div>
                <span className="articles-eyebrow">Explore</span>
                <h2 id="all-articles-title">All articles</h2>
                <p aria-live="polite">{resultLabel}</p>
              </div>
              <label className="articles-search">
                <span>Search articles</span>
                <IconlySearch size={21} aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={handleSearch}
                  aria-label="Search articles"
                />
              </label>
            </div>

            {visibleArticles.length ? (
              <>
                <div className="articles-grid">
                  {visibleArticles.map((article) => (
                    <ArticleCard
                      key={article.id ?? article.title}
                      image={article.thumbnail}
                      fallbackImage="/assets/images/avatars/article.png"
                      title={article.title}
                      description={article.description}
                      link={getArticleLink(article)}
                      isInsideLink
                    />
                  ))}
                </div>
                {filteredArticles.length > INITIAL_ITEMS_PER_PAGE && (
                  <div className="articles-pagination">
                    <Pagination
                      first={visibleFirst}
                      rows={rows}
                      totalRecords={filteredArticles.length}
                      rowsPerPageOptions={[6, 9, 12]}
                      onPageChange={onPageChange}
                      ariaLabel="Articles pagination"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="articles-empty-state" role="status">
                <IconlySearch size={28} aria-hidden />
                <h3>{query.trim() ? "No matching stories" : "More stories soon"}</h3>
                <p>
                  {query.trim()
                    ? "Try a broader search term or clear the search field."
                    : "We are preparing more stories from our community."}
                </p>
                {query.trim() && (
                  <button type="button" onClick={() => setQuery("")}>
                    Clear search
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>

      <Footer />
    </>
  );
};

ArticlesPage.propTypes = {
  initialArticles: PropTypes.arrayOf(PropTypes.object),
};

export default ArticlesPage;
