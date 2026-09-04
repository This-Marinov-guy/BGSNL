// React and Redux Required
import React, { useEffect } from "react";
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
  IconlyClose,
  IconlyDanger,
  IconlyInfo,
} from "../elements/ui/icons/IconlyIcons";

const TOAST_VARIANTS = {
  success: {
    fallbackTitle: "Success",
    Icon: null,
  },
  info: {
    fallbackTitle: "Information",
    Icon: IconlyInfo,
  },
  warn: {
    fallbackTitle: "Warning",
    Icon: IconlyDanger,
  },
  warning: {
    fallbackTitle: "Warning",
    Icon: IconlyDanger,
  },
  error: {
    fallbackTitle: "Error",
    Icon: null,
  },
};

const MainLayout = ({ children }) => {
  const notification = useSelector(selectNotification);
  const notificationIndex = useSelector(selectNotificationIndex);

  const activeStrap = getActiveStrap();

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
    if (notification.severity) {
      const duration = notification.life ?? 8000;
      const variantName = notification.severity === "warning"
        ? "warn"
        : notification.severity;
      const variant = TOAST_VARIANTS[notification.severity] ?? TOAST_VARIANTS.info;
      const title = notification.summary || variant.fallbackTitle;
      const description = notification.detail || "";
      const { Icon } = variant;

      toast.custom(
        (activeToast) => (
          <div
            aria-atomic="true"
            aria-live={variantName === "error" ? "assertive" : "polite"}
            className={`bgsnl-toast bgsnl-toast--${variantName}`}
            data-visible={activeToast.visible}
            role={variantName === "error" ? "alert" : "status"}
          >
            {Icon ? (
              <span className="bgsnl-toast__icon" aria-hidden="true">
                <Icon size={20} />
              </span>
            ) : null}

            <div className="bgsnl-toast__content">
              <div className="bgsnl-toast__title">{title}</div>
              {description ? (
                <div className="bgsnl-toast__detail">{description}</div>
              ) : null}
            </div>

            <button
              aria-label="Dismiss notification"
              className="bgsnl-toast__close"
              onClick={() => toast.dismiss(activeToast.id)}
              type="button"
            >
              <IconlyClose size={16} />
            </button>
          </div>
        ),
        {
          duration,
          position: notification.position || "top-center",
        }
      );
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
