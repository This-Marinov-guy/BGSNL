// React and Redux Required
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { clarityTrack, gaTrack } from "../util/functions/helpers";
import { Toaster, toast } from "sonner";
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
      const title = notification.summary || "";
      const description = notification.detail || "";

      const toastOptions = {
        duration,
        ...(description && { description }),
      };

      switch (notification.severity) {
        case "success":
          toast.success(title, toastOptions);
          break;
        case "error":
          toast.error(title, toastOptions);
          break;
        case "warn":
          toast.warning(title, toastOptions);
          break;
        case "info":
          toast.info(title, toastOptions);
          break;
        default:
          toast(title, toastOptions);
      }
    }
  }, [notificationIndex, notification]);

  return (
    <InternshipApplyModalProvider>
      <DonationModal />
      <RecruitModal />
      <BirthdayModal />
      <CookiesModal />
      <GoogleCalendarModal />
      <Toaster
        position="top-center"
        richColors
        closeButton
      />
      <Strap strap={activeStrap} />
      {children}
    </InternshipApplyModalProvider>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node,
};

export default MainLayout;
