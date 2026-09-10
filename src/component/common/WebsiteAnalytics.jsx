"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { LOCAL_STORAGE_COOKIE_CONSENT } from "@/util/defines/common";

export default function WebsiteAnalytics() {
  const pathname = usePathname();
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const updateConsent = () => setAnalyticsAllowed(
      window.localStorage.getItem(LOCAL_STORAGE_COOKIE_CONSENT) === "1"
    );
    updateConsent();
    window.addEventListener("bgsnl-cookie-consent-change", updateConsent);
    window.addEventListener("storage", updateConsent);
    return () => {
      window.removeEventListener("bgsnl-cookie-consent-change", updateConsent);
      window.removeEventListener("storage", updateConsent);
    };
  }, []);

  // Email approval capabilities must not be visible to analytics scripts.
  if (pathname === "/account/confirm" || !analyticsAllowed) return null;
  return <>
    <Script src="https://analytics.ahrefs.com/analytics.js" data-key="4ygyBA6xhw5zT9BfG2gpgg" strategy="afterInteractive" />
    <Script src="https://datafa.st/js/script.js" data-website-id="dfid_78wk1IMWgxBq23ebbRgUn" data-domain="bulgariansociety.nl" strategy="afterInteractive" />
  </>;
}
