"use client";
import { useEffect } from "react";
import PropTypes from "prop-types";
import { ErrorBoundary } from "react-error-boundary";
import { usePathname } from "@/util/navigation";
import RecoveryScreen from "./RecoveryScreen";

const send = (event) => {
  const body = JSON.stringify({ ...event, path: window.location.pathname });
  fetch("/api/monitoring/web-event", { method: "POST", headers: { "Content-Type": "application/json" },
    body, keepalive: true, credentials: "omit" }).catch(() => {});
};

const ErrorFallback = ({ error, resetErrorBoundary }) =>
  <RecoveryScreen kind="error" error={error} onRetry={resetErrorBoundary} />;

ErrorFallback.propTypes = {
  error: PropTypes.shape({ message: PropTypes.string }),
  resetErrorBoundary: PropTypes.func.isRequired,
};

export default function GlobalError({ children }) {
  const pathname = usePathname();

  useEffect(() => { send({ type: "page_view" }); }, [pathname]);
  useEffect(() => {
    const onError = (event) => send({ type: "client_error", name: event.error?.name || "Error", component: "window" });
    const onRejection = (event) => send({ type: "client_error", name: event.reason?.name || "Error", component: "promise" });
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => { window.removeEventListener("error", onError); window.removeEventListener("unhandledrejection", onRejection); };
  }, []);

  return <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[pathname]}
    onError={(error, info) => send({ type: "client_error", name: error.name || "Error",
      component: info.componentStack?.match(/\s+in\s+([A-Za-z0-9]+)/)?.[1] || "React" })}>{children}</ErrorBoundary>;
}

GlobalError.propTypes = { children: PropTypes.node };
