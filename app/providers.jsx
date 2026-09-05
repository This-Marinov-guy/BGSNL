"use client";

import React, { Suspense, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Provider, useSelector } from "react-redux";
import PrimeSSRProvider from "./prime-ssr-provider";

import { store } from "@/redux/store";
import MainLayout from "@/layouts/MainLayout";
import CampaignLayout from "@/layouts/CampaignLayout";
import GlobalError from "@/component/common/GlobalError";
import GlobalBackground, {
  GLOBAL_BACKGROUND_REVEAL_EVENT,
} from "@/component/common/GlobalBackground";
import GlobalModals from "@/elements/ui/modals/GlobalModals";
import InactivityModal from "@/elements/ui/modals/InactivityModal";
import InitialLoadingScreen from "@/elements/ui/loading/InitialLoadingScreen";
import PageLoading from "@/elements/ui/loading/PageLoading";
import Maintenance from "@/screens/Maintenance";
import RouteProgress from "@/component/common/RouteProgress";
import ScrollToTop from "@/component/common/ScrollToTop";
import { useAppInitialization } from "@/hooks/session/app-init";
import { useAuthSession } from "@/hooks/session/auth-session";
import { selectModal } from "@/redux/modal";
import { INACTIVITY_MODAL } from "@/util/defines/common";
import { removeLogsOnProd } from "@/util/functions/helpers";

/**
 * Everything that used to live in the `Root` component of src/index.jsx.
 * The <Routes> tree is gone — App Router supplies `children` instead.
 */
const AppShell = ({ children }) => {
  // DO not change order!
  const { isLoading } = useAppInitialization();
  const { getTimeRemaining } = useAuthSession();
  const [showInitialLoading, setShowInitialLoading] = useState(true);
  const [isWindowLoaded, setIsWindowLoaded] = useState(false);

  const modal = useSelector(selectModal);

  useEffect(() => {
    removeLogsOnProd();
  }, []);

  // Handle window load event
  useEffect(() => {
    const handleLoad = () => setIsWindowLoaded(true);

    if (document.readyState === "complete") {
      setIsWindowLoaded(true);
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => window.removeEventListener("load", handleLoad);
  }, []);

  const handleLoadingComplete = () => {
    setShowInitialLoading(false);
    window.dispatchEvent(new Event(GLOBAL_BACKGROUND_REVEAL_EVENT));
  };

  if (process.env.NEXT_PUBLIC_MAINTENANCE == "1") {
    return <Maintenance />;
  }

  return (
    <>
      <ScrollToTop />
      <RouteProgress />
      {modal.includes(INACTIVITY_MODAL) && (
        <InactivityModal timeRemaining={getTimeRemaining()} />
      )}
      <GlobalModals />
      <GlobalError>
        {/*
         * The old SPA swapped the whole tree for <PageLoading /> until
         * useAppInitialization() resolved. That check can never resolve during
         * SSR (it runs in an effect), so keeping it would mean every crawler
         * received a "Loading..." document — the exact problem this migration
         * exists to fix. The page now always renders; <InitialLoadingScreen />
         * below still covers it visually until init and window load complete.
         *
         * The Suspense boundary is also what client components calling
         * useSearchParams() need during prerender.
         */}
        <Suspense fallback={<PageLoading />}>
          <CampaignLayout>{children}</CampaignLayout>
        </Suspense>
      </GlobalError>
      {showInitialLoading && (
        <InitialLoadingScreen
          onLoadComplete={handleLoadingComplete}
          isReady={!isLoading && isWindowLoaded}
        />
      )}
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
          <GlobalBackground />
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
