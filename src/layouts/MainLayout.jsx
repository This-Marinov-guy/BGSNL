// React and Redux Required
import React, { useEffect } from "react";
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

const MainLayout = ({ children }) => {
  const notification = useSelector(selectNotification);
  const notificationIndex = useSelector(selectNotificationIndex);

  const activeStrap = getActiveStrap();

  const { reloadArticles } = useArticlesLoad();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [window.location.pathname]);

  useEffect(() => {
    if (process.env.REACT_APP_CLARITY_ENABLE == "1") {
      clarityTrack();
    }

    if (process.env.REACT_APP_GTM_ENABLE == "1") {
      gaTrack();
    }

    reloadArticles();
  }, []);

  useEffect(() => {
    if (notification.severity) {
      const duration = notification.life ?? 8000;
      const title = notification.summary || "";
      const description = notification.detail || "";
      
      // Map severity to Sonner toast types
      const toastOptions = {
        duration: duration,
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
    <>
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
    </>
  );
};

export default MainLayout;
