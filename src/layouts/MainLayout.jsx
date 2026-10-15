// React and Redux Required
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { Toaster, toast, useToasterStore } from "react-hot-toast";
import {
  selectNotification,
  selectNotificationIndex,
} from "../redux/notification";
import {
  FiAlertTriangle,
  IconlyInfo,
} from "../elements/ui/icons/IconlyIcons";
import { newestToastIdsToRemove } from "../util/functions/toast-limit.mjs";

/*
 * react-hot-toast ships its own animated icons for success and error only, so
 * info and warning go through the plain toast() with one of the site's icons;
 * an info toast marked as loading uses its built-in spinner.
 * Every severity then arrives with an icon and the library's enter/exit
 * animation, which the previous toast.custom() implementation had to forgo:
 * custom toasts get no icon, no default styling and no animation at all.
 */
/*
 * Restores the filled palette the old custom toasts used, now applied through
 * the library instead of hand-rolled CSS. `style` is passed per call rather
 * than as a class because react-hot-toast writes its white default background
 * inline, and an inline style cannot be overridden by a stylesheet rule.
 */
const TOAST_THEMES = {
  success: { background: "#16a34a", color: "#ffffff" },
  info: { background: "#2563eb", color: "#ffffff" },
  warn: { background: "#facc15", color: "#422006" },
  error: { background: "#dc2626", color: "#ffffff" },
};

// Only the blank-type toasts need one; success and error draw their own.
const TOAST_ICONS = {
  info: <IconlyInfo className="bgsnl-toast__icon" size={25} />,
  warn: <FiAlertTriangle className="bgsnl-toast__icon" size={25} />,
};

const SiteExtras = dynamic(() => import("./SiteExtras"));

const NotificationBridge = () => {
  const notification = useSelector(selectNotification);
  const notificationIndex = useSelector(selectNotificationIndex);
  const { toasts } = useToasterStore();
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  useEffect(() => {
    if (notification.dismissToast) toast.dismiss(notification.dismissToast);
    if (!notification.severity) return;

    const severity =
      notification.severity === "warning" ? "warn" : notification.severity;
    const summary = notification.summary || "";
    const detail = notification.detail || "";
    const message = detail || summary;

    if (!message) return;

    let visible = toastsRef.current.filter((item) =>
      item.visible && !item.dismissed && item.id !== notification.dismissToast
    );
    if (severity === "success") {
      // A successful retry makes any visible error messages stale.
      visible.filter((item) => item.type === "error").forEach((item) => toast.dismiss(item.id));
      visible = visible.filter((item) => item.type !== "error");
    }
    newestToastIdsToRemove(visible, notification.toastId).forEach((id) => toast.remove(id));

    const theme = TOAST_THEMES[severity] ?? TOAST_THEMES.info;
    const options = {
      className: "bgsnl-toast",
      duration: notification.life ?? 8000,
      id: notification.toastId,
      position: notification.position || "top-center",
      style: { background: theme.background, color: theme.color },
    };

    if (notification.loading) {
      toast.loading(message, { ...options,
        iconTheme: { primary: theme.color, secondary: "transparent" },
      });
    } else if (severity === "success" || severity === "error") {
      /*
       * The built-in indicator is a `primary` disc with the tick/cross punched
       * out of it in `secondary`. Inverting them against the filled background
       * keeps the glyph legible.
       */
      const withIcon = {
        ...options,
        iconTheme: { primary: theme.color, secondary: theme.background },
      };

      if (severity === "success") {
        toast.success(message, withIcon);
      } else {
        toast.error(message, withIcon);
      }
    } else {
      toast(message, {
        ...options,
        icon: TOAST_ICONS[severity] ?? TOAST_ICONS.info,
      });
    }
  }, [notificationIndex, notification]);

  return null;
};

const MainLayout = ({ children }) => {
  const [toastPortalTarget, setToastPortalTarget] = useState(null);
  const pathname = usePathname();
  const isScanner = pathname === "/user/dashboard/ticket-scanner";

  useEffect(() => {
    setToastPortalTarget(document.body);
  }, []);

  // Scroll reset on navigation now lives in <ScrollToTop /> (app/providers.jsx).
  // The old `[window.location.pathname]` dependency evaluated during render,
  // which crashes server rendering.

  return (
    <>
      <NotificationBridge />
      {toastPortalTarget
        ? createPortal(
            <Toaster
              containerClassName="bgsnl-toast-layer"
              containerStyle={{ zIndex: "var(--layer-toast)" }}
              gutter={12}
              position="top-center"
            />,
            toastPortalTarget,
          )
        : null}
      {isScanner ? children : <SiteExtras>{children}</SiteExtras>}
    </>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node,
};

export default MainLayout;
