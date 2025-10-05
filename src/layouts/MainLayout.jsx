// React and Redux Required
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { clarityTrack, gaTrack } from "../util/functions/helpers";
import { Toast } from "primereact/toast";
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
  const toast = useRef(null);

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
    // Always clear existing toasts first
    toast.current.clear();
    
    if (notification.severity) {
      // Wait a bit for clear to complete, then show new notification
      setTimeout(() => {
        toast.current.show({
          ...notification,
          // default values
          sticky: !(notification.closable ?? true),
          life: notification.life ?? 8000,
        });
      }, 100);
    }
  }, [notificationIndex]);

  return (
    <>
      <DonationModal />
      <RecruitModal />
      <BirthdayModal />
      <CookiesModal />
      <GoogleCalendarModal />
      <Toast ref={toast} position={notification.position ?? "top-center"} />
      <Strap strap={activeStrap} />
      {children}
    </>
  );
};

export default MainLayout;
