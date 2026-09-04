import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  humanizeRegion,
  truncateText,
} from "./site";

export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  url: SITE_URL,
  name: SITE_NAME,
  legalName: SITE_NAME,
  alternateName: "BGSNL",
  description: DEFAULT_DESCRIPTION,
  foundingDate: "2020",
  identifier: {
    "@type": "PropertyValue",
    propertyID: "KvK",
    value: "95335048",
  },
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/assets/images/logo/logo-nl.png`,
  },
  image: DEFAULT_IMAGE,
  email: "info@bulgariansociety.nl",
  address: { "@type": "PostalAddress", addressCountry: "NL" },
  areaServed: { "@type": "Country", name: "Netherlands" },
  sameAs: [
    "https://www.instagram.com/bulgariansociety.netherlands/",
    "https://www.linkedin.com/company/bulgarian-society-netherlands",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@bulgariansociety.nl",
    contactType: "general enquiries",
    availableLanguage: ["English", "Bulgarian"],
  },
  knowsAbout: [
    "Bulgarian culture in the Netherlands",
    "Bulgarian student communities",
    "Bulgarian community events",
    "Careers and internships in the Netherlands",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  alternateName: "BGSNL",
  description: DEFAULT_DESCRIPTION,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: ["en", "bg"],
};

export function buildArticleSchema({ article, image, path }) {
  if (!article) return null;

  const url = absoluteUrl(path, SITE_URL);
  const authorName = article.author || article.author_name;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: truncateText(
      article.excerpt || article.description || article.content
    ),
    image: [
      absoluteUrl(
        image ||
          article.thumbnail ||
          article.featured_image ||
          article.image ||
          article.cover_photo,
        DEFAULT_IMAGE
      ),
    ],
    author: authorName
      ? {
          "@type": article.author_organization ? "Organization" : "Person",
          name: authorName,
        }
      : { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(article.date || article.created_at || article.published_at
      ? {
          datePublished:
            article.date || article.created_at || article.published_at,
        }
      : {}),
    ...(article.updated_at || article.modified_at
      ? { dateModified: article.updated_at || article.modified_at }
      : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: article.language || "en",
  };
}

function eventPrice(event) {
  if (event?.isFree) return 0;

  const candidates = [
    event?.product?.guest?.price,
    event?.product?.member?.price,
    event?.price,
  ];

  return candidates.find(
    (value) => value !== undefined && value !== null && value !== ""
  );
}

export function buildEventSchema({ event, region, path }) {
  if (!event) return null;

  const url = absoluteUrl(path, SITE_URL);
  const regionName = humanizeRegion(region);
  const price = eventPrice(event);
  const soldOut = event.isSaleClosed || event.status === false;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${url}#event`,
    name: event.newTitle || event.title || event.name,
    description: truncateText(
      event.description || event.text || "A BGSNL community event."
    ),
    startDate: event.correctedDate || event.start_date || event.date,
    endDate:
      event.end_date || event.correctedDate || event.start_date || event.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location || `${regionName}, Netherlands`,
      address: {
        "@type": "PostalAddress",
        addressRegion: regionName,
        addressCountry: "NL",
      },
    },
    image: [
      absoluteUrl(
        event.poster || event.image || event.cover_photo,
        DEFAULT_IMAGE
      ),
    ],
    organizer: { "@id": `${SITE_URL}/#organization` },
    url,
    ...(price !== undefined
      ? {
          offers: {
            "@type": "Offer",
            price: String(price).replace(/[^0-9.,]/g, "").replace(",", "."),
            priceCurrency: "EUR",
            availability: soldOut
              ? "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
            url,
          },
        }
      : {}),
  };
}

export function buildBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, SITE_URL),
    })),
  };
}
