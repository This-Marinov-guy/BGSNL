import {
  useDispatch,
  useSelector,
} from "react-redux";
import { Dialog } from "@/compat/primereact";
import CalendarSubscriptionComponent from "../../../component/common/CalendarSubscriptionComponent";
import {
  removeModal,
  selectModal,
} from "../../../redux/modal";
import { GOOGLE_CALENDAR_MODAL } from "../../../util/defines/common";

const GoogleCalendarModal = () => {
  const modal = useSelector(selectModal);
  const dispatch = useDispatch();

  return (
    <Dialog
      header="Add events to your calendar"
      visible={modal.includes(GOOGLE_CALENDAR_MODAL)}
      onHide={() => dispatch(removeModal(GOOGLE_CALENDAR_MODAL))}
      dismissableMask
    >
      <CalendarSubscriptionComponent />
    </Dialog>
  );
};

export default GoogleCalendarModal;
