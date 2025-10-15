import React from "react";
import { Helmet } from "react-helmet";

/**
 * Structured data component for Event pages
 * Provides rich snippets for search engines
 */
const EventStructuredData = ({ event, region }) => {
  if (!event) return null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title || event.name,
    "description": event.description || event.details || "Event organized by Bulgarian Society Netherlands",
    "startDate": event.start_date || event.date,
    "endDate": event.end_date || event.start_date || event.date,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": event.location || `${region} - Netherlands`,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "NL",
        "addressRegion": region
      }
    },
    "image": event.image || event.cover_photo || "https://www.bulgariansociety.nl/assets/images/splashscreens/welcome.png",
    "organizer": {
      "@type": "Organization",
      "name": "Bulgarian Society Netherlands",
      "url": "https://www.bulgariansociety.nl"
    },
    "offers": event.price ? {
      "@type": "Offer",
      "price": event.price,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": `https://www.bulgariansociety.nl/${region}/event-details/${event.id}`
    } : undefined
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

export default EventStructuredData;

