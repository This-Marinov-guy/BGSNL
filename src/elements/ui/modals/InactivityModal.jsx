import React from "react";
import PropTypes from "prop-types";
import { Dialog } from "@/compat/primereact";
import { useDispatch, useSelector } from "react-redux";
import { removeModal, selectModal } from "../../../redux/modal";
import { INACTIVITY_MODAL } from "../../../util/defines/common";
import { formatMsToTimer } from "../../../util/functions/date";
import { useJWTRefresh } from "../../../hooks/common/api-hooks";
import { logout, selectUser } from "../../../redux/user";

const InactivityModal = ({ timeRemaining }) => {
  const dispatch = useDispatch();
  const modal = useSelector(selectModal);
  const user = useSelector(selectUser);
  const { refreshJWTinAPI } = useJWTRefresh();

  const closeHandler = () => {
    const timeRemaining = timeRemaining;

    if (timeRemaining <= 0) {
      dispatch(logout());
      dispatch(removeModal(INACTIVITY_MODAL));
      window.location.href = "/";
      return;
    }

    refreshJWTinAPI(user.token);
    dispatch(removeModal(INACTIVITY_MODAL));
  };

  return (
    <Dialog
      modal
      header="Session expiring"
      visible={modal.includes(INACTIVITY_MODAL)}
      onHide={closeHandler}
      footer={
        <button
          onClick={closeHandler}
          className="rn-button-style--2 rn-btn-reverse-green"
        >
          Stay active
        </button>
      }
    >
      <div className="center_section">
        <p className="center_text">
          Your session is about to expire if you stay inactive.{" "}
          You have {formatMsToTimer(timeRemaining)} seconds until you are
          automatically signed out
        </p>
      </div>
    </Dialog>
  );
};

InactivityModal.propTypes = {
  timeRemaining: PropTypes.number.isRequired,
};

export default InactivityModal;
