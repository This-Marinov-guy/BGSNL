"use client";

import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Dialog } from "@/compat/primereact";
import { selectUser } from "@/redux/user";
import SubscriptionPlanPicker from "@/elements/subscriptions/SubscriptionPlanPicker";

export default function AlumniTypeModal({ isOpen, onClose }) {
  const user = useSelector(selectUser);
  return (
    <Dialog header="Choose your alumni subscription" visible={isOpen} onHide={onClose}
      style={{ width: "min(640px, 94vw)" }} dismissableMask>
      <SubscriptionPlanPicker user={user} alumniOnly />
    </Dialog>
  );
}
AlumniTypeModal.propTypes = { isOpen: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired };
