import React, { useEffect, useState } from "react";
import PageHelmet from "../../../component/common/Helmet";
import HeaderTwo from "../../../component/header/HeaderTwo";
import { useSelector } from "react-redux";
import { selectArticles } from "../../../redux/articles";
import { encodeForURL } from "../../../util/functions/helpers";
import PageLoading from "../../../elements/ui/loading/PageLoading";
import { Link, useSearchParams } from "react-router-dom";
import { Paginator } from "primereact/paginator";
import Footer from "../../../component/footer/Footer";
import { useArticlesLoad } from "../../../hooks/common/api-hooks";
import SearchField from "../../../elements/ui/functional/SearchField";
import ArticleCard from "../../../elements/ui/cards/ArticleCard";

const ArticlesPage = () => {
  const articles = useSelector(selectArticles);
  const [firstArticle, ...restArticles] = articles;

  const [searchParams, setSearchParams] = useSearchParams();

  const { reloadArticles } = useArticlesLoad();

  const INIT_ITEMS_PER_PAGE = 6;

  const [listedArticles, setListedArticles] = useState(restArticles);
  const [first, setFirst] = useState(
    (searchParams.get("page") ? searchParams.get("page") - 1 : 0) *
      INIT_ITEMS_PER_PAGE
  );
  const [rows, setRows] = useState(INIT_ITEMS_PER_PAGE);

  const searchArticles = (e) => {
    const keyword = e.target.value.toLowerCase();

    setListedArticles(
      restArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(keyword) ||
          a.description.toLowerCase().includes(keyword)
      )
    );
  };

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);

    setSearchParams({ page: event.page + 1 });
  };

  useEffect(() => {
    reloadArticles();
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8703070946657360";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    setListedArticles(restArticles);
  }, [articles]);

  if (articles?.length === 0) {
    return <PageLoading />;
  }

  return (
    <>
      <PageHelmet pageTitle="Articles" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      <div className="container articles-list-container mt--150 mb--60">
        <h3 className="center_text mt--150">Articles</h3>
        <p className="center_text">Stay updated with our latest insights</p>
        <label className="center_div mt--40 mb--40">Latest Article</label>
        <div className="row g--5">
          <img
            src={firstArticle.thumbnail}
            className="col main team_member_border-3"
          />
          <div className="col">
            <h3 className="mb--20">{firstArticle.title}</h3>
            <p>{firstArticle.description}</p>
            <Link
              className="main-link"
              to={`/articles/${firstArticle.id}/${encodeForURL(
                firstArticle.title
              )}`}
            >
              Read more
            </Link>
          </div>
        </div>

        <div className="mt--60">
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">
            <div className="d-flex flex-md-grow-1 justify-content-md-start justify-content-center">
              <label>All Articles</label>
            </div>
            <div className="d-flex justify-content-center">
              <SearchField
                onChange={searchArticles}
                className="article-search"
              />
            </div>
          </div>
          <div className="row mt--20">
            {listedArticles?.length > 0 ? (
              <>
                {listedArticles
                  .slice(first, first + rows)
                  .map((article, index) => (
                    <div key={index} className="col-lg-4 col-md-6 col-12">
                      <ArticleCard
                        image={article.thumbnail}
                        fallbackImage="/assets/images/avatars/article.png"
                        title={article.title}
                        description={article.description}
                        link={
                          article.legacyLink ??
                          `/articles/${article.id}/${encodeForURL(
                            article.title
                          )}`
                        }
                        isInsideLink
                      />
                    </div>
                  ))}
                <Paginator
                  className="col-12"
                  first={first}
                  rows={rows}
                  totalRecords={listedArticles.length ?? 0}
                  rowsPerPageOptions={[INIT_ITEMS_PER_PAGE, 10, 15]}
                  onPageChange={onPageChange}
                />
              </>
            ) : (
              <p className="col-12 center_text">No more articles found</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ArticlesPage;
