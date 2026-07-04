import React, { Component } from "react";
import { Helmet } from "react-helmet";

class PageHelmet extends Component {
  render() {
    const {
      pageTitle,
      description,
      keywords,
      image,
      url,
      type = "website",
      author = "Bulgarian Society Netherlands",
      canonicalUrl,
      noIndex = false,
    } = this.props;

    const baseUrl = "https://www.bulgariansociety.nl";
    const defaultDescription = "Bulgarian Society Netherlands connects Bulgarian students and young Bulgarians through events, membership, internships, and local city communities.";
    const defaultImage = "https://www.bulgariansociety.nl/assets/images/splashscreens/welcome.png";
    const defaultKeywords = "Bulgarian Society, Bulgaria, Netherlands, Bulgarian community, events, culture, membership, student organization";

    const buildAbsoluteUrl = (value) => {
      if (!value) return value;
      if (value.startsWith("http://") || value.startsWith("https://")) return value;
      if (value.startsWith("/")) return `${baseUrl}${value}`;
      return `${baseUrl}/${value}`;
    };

    const getImageType = (value) => {
      const normalizedValue = (value || "").split("?")[0].toLowerCase();

      if (normalizedValue.endsWith(".jpg") || normalizedValue.endsWith(".jpeg")) {
        return "image/jpeg";
      }

      if (normalizedValue.endsWith(".webp")) {
        return "image/webp";
      }

      if (normalizedValue.endsWith(".gif")) {
        return "image/gif";
      }

      return "image/png";
    };

    const metaDescription = description || defaultDescription;
    const metaImage = buildAbsoluteUrl(image || defaultImage);
    const metaUrl = buildAbsoluteUrl(url || canonicalUrl || baseUrl);
    const metaKeywords = keywords || defaultKeywords;
    const fullTitle = pageTitle ? `${pageTitle} | Bulgarian Society Netherlands` : "Bulgarian Society Netherlands - Your Home Away From Home";
    const metaImageType = getImageType(metaImage);

    return (
      <React.Fragment>
        <Helmet>
          {/* Primary Meta Tags */}
          <title>{fullTitle}</title>
          <meta name="title" content={fullTitle} />
          <meta name="description" content={metaDescription} />
          <meta name="keywords" content={metaKeywords} />
          <meta name="author" content={author} />
          
          {/* Canonical URL */}
          {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
          
          {/* Robots */}
          {noIndex ? (
            <meta name="robots" content="noindex, nofollow" />
          ) : (
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          )}

          {/* Open Graph / Facebook / WhatsApp / LinkedIn / Discord */}
          <meta property="og:type" content={type} />
          <meta property="og:url" content={metaUrl} />
          <meta property="og:title" content={fullTitle} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:image" content={metaImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:type" content={metaImageType} />
          <meta property="og:site_name" content="Bulgarian Society Netherlands" />
          <meta property="og:locale" content="en_NL" />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content={metaUrl} />
          <meta name="twitter:title" content={fullTitle} />
          <meta name="twitter:description" content={metaDescription} />
          <meta name="twitter:image" content={metaImage} />

          {/* Additional SEO */}
          <meta name="theme-color" content="#f92820" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="BGSNL" />
        </Helmet>
      </React.Fragment>
    );
  }
}

export default PageHelmet;
