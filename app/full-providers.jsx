"use client";

import React, { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { isEventTicketPage } from "@/util/payments/event-ticket-policy.mjs";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import PrimeSSRProvider from "./prime-ssr-provider";

import { store } from "@/redux/store";
import MainLayout from "@/layouts/MainLayout";
import GlobalError from "@/component/common/GlobalError";
import GlobalBackground from "@/component/common/GlobalBackground";
import PageLoading from "@/elements/ui/loading/PageLoading";
import Maintenance from "@/screens/Maintenance";
import RouteProgress from "@/component/common/RouteProgress";
import ScrollToTop from "@/component/common/ScrollToTop";
import { useAppInitialization } from "@/hooks/session/app-init";
import { useAuthSession } from "@/hooks/session/auth-session";
import { removeLogsOnProd } from "@/util/functions/helpers";

const GlobalModals = dynamic(() => import("@/elements/ui/modals/GlobalModals"));
const SupportWidget = dynamic(() => import("@/elements/support/SupportWidget"));
const CampaignLayout = dynamic(() => import("@/layouts/CampaignLayout"));

/**
 * Everything that used to live in the `Root` component of src/index.jsx.
 * The <Routes> tree is gone — App Router supplies `children` instead.
 */
const AppShell = ({ children }) => {
  const pathname = usePathname();
  const isScanner = pathname === "/user/dashboard/ticket-scanner";
  const { isLoading } = useAppInitialization();
  useAuthSession();

  useEffect(() => {
    removeLogsOnProd();
  }, []);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={null}><RouteProgress /></Suspense>
      {!isScanner && <Suspense fallback={null}><SupportWidget /></Suspense>}
      {!isScanner && <GlobalModals />}
      <GlobalError>
        {/*
         * The old SPA swapped the whole tree for <PageLoading /> until
         * useAppInitialization() resolved. That check can never resolve during
         * SSR (it runs in an effect), so keeping it would mean every crawler
         * received a "Loading..." document — the exact problem this migration
         * exists to fix. The page now always renders, with no splash screen
         * replacing it. StartupOverlay only visually covers the mounted tree.
         *
         * The Suspense boundary is also what client components calling
         * useSearchParams() need during prerender.
         */}
        <div data-startup-pending={isLoading ? "true" : "false"}>
        <Suspense fallback={<PageLoading />}>
          {isScanner ? children : <CampaignLayout>{children}</CampaignLayout>}
        </Suspense>
        </div>
      </GlobalError>
    </>
  );
};

AppShell.propTypes = {
  children: PropTypes.node,
};

export default function FullProviders({ children }) {
  const pathname = usePathname();
  const isUserRoute = pathname?.startsWith("/user");
  // Maintenance must not start sessions, API requests or modals.
  if (process.env.NEXT_PUBLIC_MAINTENANCE === "1") return <Maintenance />;

  if (pathname?.startsWith("/c/") || isEventTicketPage(pathname)) return <Provider store={store}><PrimeSSRProvider><div className="global-site-shell"><GlobalBackground initiallyRevealed /><div className="global-site-content">{children}</div></div></PrimeSSRProvider></Provider>;

  return (
    <Provider store={store}>
      <PrimeSSRProvider>
        <div className={`global-site-shell${isUserRoute ? " global-site-shell--user" : ""}`}>
          {!isUserRoute && <GlobalBackground initiallyRevealed />}
          <div className="global-site-content">
            <MainLayout>
              <AppShell>{children}</AppShell>
            </MainLayout>
          </div>
        </div>
      </PrimeSSRProvider>
    </Provider>
  );
}

FullProviders.propTypes = {
  children: PropTypes.node,
};
