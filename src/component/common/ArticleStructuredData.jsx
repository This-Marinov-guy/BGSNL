import React from "react";
import { Helmet } from "react-helmet";

/**
 * Structured data component for Article/Blog pages
 * Provides rich snippets for search engines
 */
const ArticleStructuredData = ({ article }) => {
  if (!article) return null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description || article.excerpt || "Article by Bulgarian Society Netherlands",
    "image": article.image || article.featured_image || article.cover_photo || "https://www.bulgariansociety.nl/assets/images/splashscreens/welcome.png",
    "author": {
      "@type": article.author_organization ? "Organization" : "Person",
      "name": article.author || "Bulgarian Society Netherlands"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bulgarian Society Netherlands",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.bulgariansociety.nl/assets/images/logo/logo-nl.png"
      }
    },
    "datePublished": article.date || article.created_at || article.published_at,
    "dateModified": article.updated_at || article.modified_at || article.date || article.created_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url || `https://www.bulgariansociety.nl/articles/${article.id}`
    }
  };

  // Remove undefined values
  Object.keys(structuredData).forEach(key => 
    structuredData[key] === undefined && delete structuredData[key]
  );

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default ArticleStructuredData;

