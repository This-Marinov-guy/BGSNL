// React and Redux Required
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { clarityTrack, gaTrack } from "../util/functions/helpers";
import { Toast } from 'primereact/toast';
import { selectNotification, selectNotificationIndex } from "../redux/notification";
import BirthdayModal from "../elements/ui/modals/BirthdayModal";
import RecruitModal from "../elements/ui/modals/RecruitModal";

const MainLayout = ({ children }) => {
    const toast = useRef(null);

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
    }, []);

    useEffect(() => {
        if (notification.severity) {
            setTimeout(() => {
                toast.current.show(notification);
            }, 200)
        }
    }, [notificationIndex]);

    return (
        <>
            <RecruitModal />
            <BirthdayModal />
            <Toast ref={toast} position="top-center" life={8000} />
            {children}
        </>)
}

export default MainLayout