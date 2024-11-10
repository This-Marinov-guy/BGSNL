import React from "react";
import { Dialog } from "primereact/dialog";
import { useDispatch, useSelector } from "react-redux";
import { removeModal, selectModal } from "../../../redux/modal";
import { INACTIVITY_MODAL } from "../../../util/defines/common";
import { formatMsToTimer } from "../../../util/functions/date";
import { useJWTRefresh } from "../../../hooks/common/api-hooks";
import { selectUser } from "../../../redux/user";

const InactivityModal = ({ timeRemaining }) => {
  const dispatch = useDispatch();

  const modal = useSelector(selectModal);

  const user = useSelector(selectUser);

  const { refreshJWTinAPI } = useJWTRefresh();

  const closeHandler = () => {
    if (timeRemaining === 0) {
      window.location.href = "/";
    }

    refreshJWTinAPI(user.token);
    dispatch(removeModal(INACTIVITY_MODAL));
  };

  return (
    <Dialog
      modal
      visible={modal.includes(INACTIVITY_MODAL)}
      onHide={closeHandler}
    >
      <div className="center_section">
        <h3>Your session is about to expire if you stay inactive</h3>
        <p className="center_text">
          Yoo have {formatMsToTimer(timeRemaining)} seconds until you are
          automatically signed out
        </p>
        <button
          onClick={closeHandler}
          className="rn-button-style--2 rn-btn-reverse-green mt--40"
        >
          Stay active
        </button>
      </div>
    </Dialog>
  );
};

export default InactivityModal;
