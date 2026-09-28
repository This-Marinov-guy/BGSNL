"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import PrimeSSRProvider from "./prime-ssr-provider";
import GlobalBackground from "@/component/common/GlobalBackground";
import PageLoading from "@/elements/ui/loading/PageLoading";

// Public QR cards should not download the authenticated application shell.
const FullProviders = dynamic(() => import("./full-providers"), { loading: () => <PageLoading /> });
const Maintenance = dynamic(() => import("@/screens/Maintenance"));

export default function Providers({ children }) {
  const pathname = usePathname();
  if (process.env.NEXT_PUBLIC_MAINTENANCE === "1") return <Maintenance />;
  if (!pathname?.startsWith("/c/")) return <FullProviders>{children}</FullProviders>;
  return <Provider store={store}><PrimeSSRProvider>
    <div className="global-site-shell">
      <GlobalBackground initiallyRevealed />
      <div className="global-site-content">{children}</div>
    </div>
  </PrimeSSRProvider></Provider>;
}

Providers.propTypes = { children: PropTypes.node };
