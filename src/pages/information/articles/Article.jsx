import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../../elements/common/Breadcrumb";
import PageHelmet from "../../../component/common/Helmet";
import Header from "../../../component/header/Header";
import FooterTwo from "../../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import { useArticlesLoad } from "../../../hooks/common/api-hooks";
import { useSelector } from "react-redux";
import { decodeFromURL } from "../../../util/functions/helpers";
import { selectSingleArticle } from "../../../redux/articles";
import { selectPageLoading } from "../../../redux/loading";
import PageLoading from "../../../elements/ui/loading/PageLoading";
import ImageFb from "../../../elements/ui/media/ImageFb";
import NoArticleFound from "../../../elements/ui/errors/NoArticleFound";

const Article = () => {
  const { articleId } = useParams();

  const { reloadArticleDetails } = useArticlesLoad();

  const selectedArticle = useSelector(selectSingleArticle);
  const pageLoading = useSelector(selectPageLoading);

  useEffect(() => {
    reloadArticleDetails(articleId);
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

  if (pageLoading) {
    return <PageLoading />;
  }

  if (!selectedArticle) {
    return <NoArticleFound />;
  }

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Articles" />
      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      {/* Start Breadcrump Area */}
      <Breadcrumb title={selectedArticle.title} category="Articles" />
      {/* End Breadcrump Area */}

      {/* Start Article  Details */}
      <style>{selectedArticle.styles}</style>
      <div className="wordpress-embedded-container">
        <h1
          className="mb--20"
          dangerouslySetInnerHTML={{ __html: selectedArticle.title }}
        />
        <div
          dangerouslySetInnerHTML={{
            __html: selectedArticle.content,
          }}
        />
      </div>
      {/* End Article  Details */}
      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <FooterTwo />
    </React.Fragment>
  );
};

export default Article;
