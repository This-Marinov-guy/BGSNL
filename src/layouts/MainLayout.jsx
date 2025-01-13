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

const MainLayout = ({ children }) => {
  const toast = useRef(null);

  const notification = useSelector(selectNotification);
  const notificationIndex = useSelector(selectNotificationIndex);

  const { reloadArticles } = useArticlesLoad();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [window.location.pathname]);

  useEffect(() => {
    if (process.env.REACT_APP_CLARITY_ENABLE) {
      clarityTrack();
    }

    if (process.env.REACT_APP_GTM_ENABLE) {
      gaTrack();
    }

    reloadArticles();
  }, []);

  useEffect(() => {
    if (notification.severity) {
      setTimeout(() => {
        toast.current.show({
          ...notification,
          // default values
          sticky: !notification?.closable,
        });
      }, 200);
    } else {
      toast.current.clear();
    }
  }, [notificationIndex]);

  return (
    <>
      <DonationModal />
      <RecruitModal />
      <BirthdayModal />
      <CookiesModal />
      <GoogleCalendarModal />
      <Toast
        ref={toast}
        life={notification.life ?? 8000}
        position={notification.position ?? "top-center"}
      />
      {children}
    </>
  );
};

export default MainLayout;
