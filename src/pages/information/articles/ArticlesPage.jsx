import React, { useEffect, useState } from "react";
import PageHelmet from "../../../component/common/Helmet";
import HeaderTwo from "../../../component/header/HeaderTwo";
import { useSelector } from "react-redux";
import { selectArticles } from "../../../redux/articles";
import { encodeForURL } from "../../../util/functions/helpers";
import PageLoading from "../../../elements/ui/loading/PageLoading";
import { Link } from "react-router-dom";
import Card2 from "../../../elements/ui/cards/Card2";
import Footer from "../../../component/footer/Footer";
import { useArticlesLoad } from "../../../hooks/common/api-hooks";
import SearchField from "../../../elements/ui/functional/SearchField";

const ArticlesPage = () => {
  const articles = useSelector(selectArticles);
  const [firstArticle, ...restArticles] = articles;

  const { reloadArticles } = useArticlesLoad();

  const [listedArticles, setListedArticles] = useState(restArticles);

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

  useEffect(() => {
    reloadArticles();
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
        <label className="center_div mb--40">Latest Article</label>
        <div className="row g--5">
          <img
            src={firstArticle.thumbnail}
            className="col main team_member_border-3"
          />
          <div className="col">
            <h3 className="mb--20">{firstArticle.title}</h3>
            <p>{firstArticle.description}</p>
            <Link
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
              <label>Main Articles</label>
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
              listedArticles.map((article, index) => (
                <div key={index} className="col-lg-4 col-md-6 col-12">
                  <Card2
                    image={article.thumbnail}
                    fallbackImage="/assets/images/avatars/article.png"
                    description={article.description}
                    link={article.legacyLink ?? `/articles/${
                      article.id
                    }/${encodeForURL(article.title)}`}
                    isInsideLink
                  />
                </div>
              ))
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
