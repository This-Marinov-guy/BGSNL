// React and Redux Required
import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { clarityTrack, gaTrack } from "../util/functions/helpers";
import { Toaster, toast } from "react-hot-toast";
import {
  selectNotification,
  selectNotificationIndex,
} from "../redux/notification";
import BirthdayModal from "../elements/ui/modals/BirthdayModal";
import RecruitModal from "../elements/ui/modals/RecruitModal";
import DonationModal from "../elements/ui/modals/DonationModal";
import { useArticlesLoad } from "../hooks/common/api-hooks";
import CookiesModal from "../elements/ui/modals/CookiesModal";
import GoogleCalendarModal from "../elements/ui/modals/GoogleCalendarModal";
import { getActiveStrap } from "../util/defines/CAMPAIGNS";
import Strap from "../elements/banners/Strap";
import { InternshipApplyModalProvider } from "../hooks/common/use-internship-apply-modal";
import GlobalFormValidation from "../elements/ui/forms/GlobalFormValidation";
import {
  IconlyDanger,
  IconlyInfo,
} from "../elements/ui/icons/IconlyIcons";

/*
 * react-hot-toast ships its own animated icons for success and error only, so
 * info and warning go through the plain toast() with one of the site's icons.
 * Every severity then arrives with an icon and the library's enter/exit
 * animation, which the previous toast.custom() implementation had to forgo:
 * custom toasts get no icon, no default styling and no animation at all.
 */
const TOAST_FALLBACK_TITLES = {
  success: "Success",
  info: "Information",
  warn: "Warning",
  warning: "Warning",
};

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
  info: <IconlyInfo className="bgsnl-toast__icon" size="1.5rem" />,
  warn: <IconlyDanger className="bgsnl-toast__icon" size="1.5rem" />,
};

const MainLayout = ({ children }) => {
  const notification = useSelector(selectNotification);
  const notificationIndex = useSelector(selectNotificationIndex);

  const activeStrap = getActiveStrap();

  /*
   * Ids of error toasts still on screen, so a later success can clear them —
   * once an action succeeds, the failure that preceded it is stale and should
   * not sit next to the confirmation.
   *
   * A ref rather than useToasterStore(): that hook would re-render this shell
   * on every toast change, and it wraps the whole app. Dismissing an id that
   * has already expired is a no-op, so stale entries are harmless.
   */
  const errorToastIds = useRef([]);

  const { reloadArticles } = useArticlesLoad();

  // Scroll reset on navigation now lives in <ScrollToTop /> (app/providers.jsx).
  // The old `[window.location.pathname]` dependency evaluated during render,
  // which crashes server rendering.

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_CLARITY_ENABLE == "1") {
      clarityTrack();
    }

    if (process.env.NEXT_PUBLIC_GTM_ENABLE == "1") {
      gaTrack();
    }

    reloadArticles();
  }, []);

  useEffect(() => {
    if (!notification.severity) return;

    const severity =
      notification.severity === "warning" ? "warn" : notification.severity;
    const summary = notification.summary || "";
    const detail = notification.detail || "";

    /*
     * Error toasts drop the heading — every one of them puts the real message
     * in `detail`, so a generic "Error"/"You got an error :(" line above it
     * only pushed the useful text down. The summary fallback keeps a
     * detail-less error from rendering as an empty toast.
     */
    const title =
      severity === "error"
        ? ""
        : summary || TOAST_FALLBACK_TITLES[severity] || "";
    const body = severity === "error" ? detail || summary : detail;

    const message = title ? (
      <span>
        <strong>{title}</strong>
        {body ? (
          <>
            <br />
            {body}
          </>
        ) : null}
      </span>
    ) : (
      body
    );

    const theme = TOAST_THEMES[severity] ?? TOAST_THEMES.info;
    const options = {
      className: "bgsnl-toast",
      duration: notification.life ?? 8000,
      position: notification.position || "top-center",
      style: { background: theme.background, color: theme.color },
    };

    if (severity === "success" || severity === "error") {
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
        errorToastIds.current.forEach((id) => toast.dismiss(id));
        errorToastIds.current = [];
        toast.success(message, withIcon);
      } else {
        errorToastIds.current.push(toast.error(message, withIcon));
      }
    } else {
      toast(message, {
        ...options,
        icon: TOAST_ICONS[severity] ?? TOAST_ICONS.info,
      });
    }
  }, [notificationIndex, notification]);

  return (
    <InternshipApplyModalProvider>
      <DonationModal />
      <RecruitModal />
      <BirthdayModal />
      <CookiesModal />
      <GoogleCalendarModal />
      <Toaster gutter={12} position="top-center" />
      <GlobalFormValidation />
      <Strap strap={activeStrap} />
      {children}
    </InternshipApplyModalProvider>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node,
};

export default MainLayout;
