import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeModal, selectModal } from "../../../redux/modal";
import { Dialog } from "primereact/dialog";
import { GOOGLE_CALENDAR_MODAL } from "../../../util/defines/common";
import CalendarSubscriptionComponent from "../../../component/common/CalendarSubscriptionComponent";

const GoogleCalendarModal = () => {
  const modal = useSelector(selectModal);
  const dispatch = useDispatch();

  return (
    <Dialog
      visible={modal.includes(GOOGLE_CALENDAR_MODAL)}
      onHide={() => dispatch(removeModal(GOOGLE_CALENDAR_MODAL))}
      dismissableMask
    >
      <CalendarSubscriptionComponent />
    </Dialog>
  );
};

export default GoogleCalendarModal;
