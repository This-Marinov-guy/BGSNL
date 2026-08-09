// Order matters and mirrors the old src/index.jsx import order:
// bootstrap -> template plugins -> template styles + overrides -> primereact -> slick.
import "bootstrap/dist/css/bootstrap.min.css";
import "../public/assets/css/plugins.css";
import "@/styles/globals.scss";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Providers from "./providers";

const SITE_URL = "https://www.bulgariansociety.nl";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bulgarian Society Netherlands",
    template: "%s | BGSNL",
  },
  description:
    "Welcome to the official Bulgarian Society in Netherlands! We aim to bring Bulgarians together, develop Bulgarian culture, and showcase it among internationals. Find information about us, our events, and how to become a member.",
  applicationName: "Bulgarian Society Netherlands",
  authors: [{ name: "Bulgarian Society Netherlands" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: `${SITE_URL}/assets/images/logo/logo-nl.png`,
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Your Home Away From Home",
    description:
      "Join the Bulgarian Society in the Netherlands! Discover our events, become a member, and connect with fellow Bulgarians.",
    url: SITE_URL,
    siteName: "BGSNL",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/assets/images/splashscreens/welcome.png`,
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Home Away From Home",
    description:
      "Join the Bulgarian Society in the Netherlands! Discover our events, become a member, and connect with fellow Bulgarians.",
    images: [`${SITE_URL}/assets/images/splashscreens/welcome.png`],
  },
  appleWebApp: {
    title: "Bulgarian Society Netherlands",
  },
  other: {
    "al:ios:url": SITE_URL,
    "al:ios:app_name": "Bulgarian Society Netherlands",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  url: SITE_URL,
  name: "Bulgarian Society Netherlands",
  alternateName: "BGSNL",
  description:
    "Join the Bulgarian Society in the Netherlands! Discover our events, become a member, and connect with fellow Bulgarians.",
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/assets/images/logo/logo-nl.png`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/assets/images/splashscreens/welcome.png`,
  email: "info@bulgariansociety.nl",
  address: { "@type": "PostalAddress", addressCountry: "NL" },
  sameAs: [
    "https://www.instagram.com/bulgariansociety.netherlands/",
    "https://www.linkedin.com/company/bulgarian-society-netherlands",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@bulgariansociety.nl",
    contactType: "customer service",
  },
  memberOf: {
    "@type": "Organization",
    name: "Bulgarian communities in the Netherlands",
  },
  areaServed: { "@type": "Country", name: "Netherlands" },
  knowsAbout: [
    "Bulgarian Culture",
    "Student Organizations",
    "Events",
    "Community Building",
  ],
  foundingDate: "2020",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <Providers>{children}</Providers>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="4ygyBA6xhw5zT9BfG2gpgg"
          async
        />
        <script
          defer
          data-website-id="dfid_78wk1IMWgxBq23ebbRgUn"
          data-domain="bulgariansociety.nl"
          src="https://datafa.st/js/script.js"
        />
      </body>
    </html>
  );
}
