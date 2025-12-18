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
    const defaultDescription = "Welcome to the official Bulgarian Society in Netherlands! We aim to bring Bulgarians together, develop Bulgarian culture, and showcase it among internationals. Find information about us, our events, and how to become a member.";
    const defaultImage = "https://www.bulgariansociety.nl/assets/images/splashscreens/welcome.png";
    const defaultKeywords = "Bulgarian Society, Bulgaria, Netherlands, Bulgarian community, events, culture, membership, student organization";

    const metaDescription = description || defaultDescription;
    const metaImage = image || defaultImage;
    const metaUrl = url || canonicalUrl || baseUrl;
    const metaKeywords = keywords || defaultKeywords;
    const fullTitle = pageTitle ? `${pageTitle} | Bulgarian Society Netherlands` : "Bulgarian Society Netherlands - Your Home Away From Home";

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
          <meta property="og:image:type" content="image/png" />
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
