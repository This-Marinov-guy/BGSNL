// Order matters and mirrors the old src/index.jsx import order:
// bootstrap -> template plugins -> template styles + overrides -> primereact -> slick.
import "bootstrap/dist/css/bootstrap.min.css";
import "../public/assets/css/plugins.css";
import "@/styles/globals.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Providers from "./providers";
import WebsiteAnalytics from "@/component/common/WebsiteAnalytics";
import PropTypes from "prop-types";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@/util/seo/site";
import {
  organizationSchema,
  serializeJsonLd,
  websiteSchema,
} from "@/util/seo/structured-data";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s | BGSNL",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "community",
  alternates: { canonical: SITE_URL },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: `${SITE_URL}/assets/images/logo/logo-nl.png`,
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Your Home Away From Home",
    description:
      "Join the Bulgarian Society in the Netherlands! Discover our events, become a member, and connect with fellow Bulgarians.",
    url: SITE_URL,
    siteName: "BGSNL",
    type: "website",
    images: [
      {
        url: DEFAULT_IMAGE,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Bulgarian Society Netherlands — Your Home Away From Home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Home Away From Home",
    description:
      "Join the Bulgarian Society in the Netherlands! Discover our events, become a member, and connect with fellow Bulgarians.",
    images: [
      {
        url: DEFAULT_IMAGE,
        alt: "Bulgarian Society Netherlands — Your Home Away From Home",
      },
    ],
  },
  appleWebApp: {
    title: SITE_NAME,
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <Providers>{children}</Providers>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteSchema) }}
        />

        <WebsiteAnalytics />
      </body>
    </html>
  );
}

RootLayout.propTypes = { children: PropTypes.node };
