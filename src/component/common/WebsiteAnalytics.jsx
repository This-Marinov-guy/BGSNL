"use client";

import { isEventTicketPage } from "@/util/payments/event-ticket-policy.mjs";

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

  // Approval links and scanner sign-in returns can carry bearer ticket tokens.
  if (pathname?.startsWith("/c/") || pathname?.startsWith("/event-feedback/") || pathname?.startsWith("/wallet/ticket") ||
      pathname === "/account/confirm" || pathname === "/login" || pathname === "/user/dashboard/ticket-scanner" ||
      isEventTicketPage(pathname) || !analyticsAllowed) return null;
  return <>
    <Script src="https://analytics.ahrefs.com/analytics.js" data-key="4ygyBA6xhw5zT9BfG2gpgg" strategy="afterInteractive" />
    <Script src="https://datafa.st/js/script.js" data-website-id="dfid_78wk1IMWgxBq23ebbRgUn" data-domain="bulgariansociety.nl" strategy="afterInteractive" />
  </>;
}
