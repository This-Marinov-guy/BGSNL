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
import ChangeLanguageLinks from "../../../elements/ui/buttons/ChangeLanguageLinks";
import ArticleStructuredData from "../../../component/common/ArticleStructuredData";

const Article = () => {
  const { articleId } = useParams();

  const { reloadArticleDetails } = useArticlesLoad();

  const selectedArticle = useSelector(selectSingleArticle);
  const pageLoading = useSelector(selectPageLoading);

  useEffect(() => {
    reloadArticleDetails(articleId);
  }, []);

  if (pageLoading) {
    return <PageLoading />;
  }

  if (!selectedArticle) {
    return <NoArticleFound />;
  }

  const articleDescription = selectedArticle.excerpt || selectedArticle.description || 
    (selectedArticle.content ? selectedArticle.content.replace(/<[^>]*>/g, '').substring(0, 160) : '');
  const articleUrl = `https://www.bulgariansociety.nl/articles/${articleId}/${selectedArticle.slug || ''}`;

  return (
    <React.Fragment>
      <PageHelmet 
        pageTitle={selectedArticle.title}
        description={articleDescription}
        image={selectedArticle.featured_image || selectedArticle.image}
        type="article"
        canonicalUrl={articleUrl}
        keywords={`${selectedArticle.title}, Bulgarian article, BGSNL, Bulgarian Society`}
      />
      <ArticleStructuredData article={selectedArticle} />
      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      {/* Start Breadcrump Area */}
      <Breadcrumb
        title={selectedArticle.title}
        category="Articles"
        extraElement={
          selectedArticle.withTranslation && (
            <ChangeLanguageLinks post={selectedArticle} />
          )
        }
      />
      {/* End Breadcrump Area */}

      {/* Start Article  Details */}
      <style>{selectedArticle.styles}</style>
      <style>{`
        .wordpress-embedded-container a {
          text-decoration: underline;
          font-style: italic;
        }
      `}</style>
      <div className="wordpress-embedded-container">
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
          <FiChevronUp size={26} style={{ fontSize: '26px' }} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <FooterTwo />
    </React.Fragment>
  );
};

export default Article;
