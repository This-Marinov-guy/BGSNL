"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Provider, useSelector } from "react-redux";
import { PrimeReactProvider } from "primereact/api";

import { store } from "@/redux/store";
import MainLayout from "@/layouts/MainLayout";
import CampaignLayout from "@/layouts/CampaignLayout";
import GlobalError from "@/component/common/GlobalError";
import GlobalModals from "@/elements/ui/modals/GlobalModals";
import InactivityModal from "@/elements/ui/modals/InactivityModal";
import InitialLoadingScreen from "@/elements/ui/loading/InitialLoadingScreen";
import PageLoading from "@/elements/ui/loading/PageLoading";
import Maintenance from "@/screens/Maintenance";
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

  const handleLoadingComplete = () => setShowInitialLoading(false);

  if (process.env.NEXT_PUBLIC_MAINTENANCE == "1") {
    return <Maintenance />;
  }

  return (
    <>
      <ScrollToTop />
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

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <PrimeReactProvider>
        <MainLayout>
          <AppShell>{children}</AppShell>
        </MainLayout>
      </PrimeReactProvider>
    </Provider>
  );
}
