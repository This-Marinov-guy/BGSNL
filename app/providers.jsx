"use client";

import React, { Suspense, useEffect } from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import PrimeSSRProvider from "./prime-ssr-provider";

import { store } from "@/redux/store";
import MainLayout from "@/layouts/MainLayout";
import CampaignLayout from "@/layouts/CampaignLayout";
import GlobalError from "@/component/common/GlobalError";
import GlobalBackground from "@/component/common/GlobalBackground";
import GlobalModals from "@/elements/ui/modals/GlobalModals";
import PageLoading from "@/elements/ui/loading/PageLoading";
import Maintenance from "@/screens/Maintenance";
import RouteProgress from "@/component/common/RouteProgress";
import SupportWidget from "@/elements/support/SupportWidget";
import ScrollToTop from "@/component/common/ScrollToTop";
import { useAppInitialization } from "@/hooks/session/app-init";
import { useAuthSession } from "@/hooks/session/auth-session";
import { removeLogsOnProd } from "@/util/functions/helpers";

/**
 * Everything that used to live in the `Root` component of src/index.jsx.
 * The <Routes> tree is gone — App Router supplies `children` instead.
 */
const AppShell = ({ children }) => {
  // DO not change order! Still called for its side effects; the splash screen
  // that consumed its `isLoading` flag is gone.
  useAppInitialization();
  useAuthSession();

  useEffect(() => {
    removeLogsOnProd();
  }, []);

  if (process.env.NEXT_PUBLIC_MAINTENANCE == "1") {
    return <Maintenance />;
  }

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={null}><RouteProgress /></Suspense>
      <SupportWidget />
      <GlobalModals />
      <GlobalError>
        {/*
         * The old SPA swapped the whole tree for <PageLoading /> until
         * useAppInitialization() resolved. That check can never resolve during
         * SSR (it runs in an effect), so keeping it would mean every crawler
         * received a "Loading..." document — the exact problem this migration
         * exists to fix. The page now always renders, with no splash screen
         * covering it.
         *
         * The Suspense boundary is also what client components calling
         * useSearchParams() need during prerender.
         */}
        <Suspense fallback={<PageLoading />}>
          <CampaignLayout>{children}</CampaignLayout>
        </Suspense>
      </GlobalError>
    </>
  );
};

AppShell.propTypes = {
  children: PropTypes.node,
};

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <PrimeSSRProvider>
        <div className="global-site-shell">
          <GlobalBackground initiallyRevealed />
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

Providers.propTypes = {
  children: PropTypes.node,
};
