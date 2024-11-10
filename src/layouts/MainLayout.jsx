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

const MainLayout = ({ children }) => {
  const toast = useRef(null);
  const { reloadArticles } = useArticlesLoad();

  const notification = useSelector(selectNotification);
  const notificationIndex = useSelector(selectNotificationIndex);

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
          life: notification.life ?? 8000,
          sticky: !notification?.closable
        });
      }, 200);
    }
  }, [notificationIndex]);

  return (
    <>
      <DonationModal />
      <RecruitModal />
      <BirthdayModal />
      <Toast ref={toast} position={notification.position ?? "top-center"} />
      {children}
    </>
  );
};

export default MainLayout;
