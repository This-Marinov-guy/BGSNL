export const metadata = {
  title: {
    default: "Account",
    template: "%s | BGSNL Account",
  },
  referrer: "no-referrer",
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
      "max-snippet": 0,
      "max-image-preview": "none",
      "max-video-preview": 0,
    },
  },
};

// The account screens below this boundary remain Client Components. This
// server layout contributes privacy metadata only; it never fetches account
// data or serializes authenticated state into the HTML response.
export default function UserPrivacyLayout({ children }) {
  return children;
}
