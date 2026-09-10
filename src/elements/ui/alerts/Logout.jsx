import { showNotification } from "../../../redux/notification";
import React from "react";
import Alert from "react-bootstrap/Alert";
import { useDispatch } from "react-redux";
import { useNavigate } from "@/util/navigation";
import { logout } from "../../../redux/user";

const LogoutAlert = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!visible) {
    return null;
  }

  return (
    <Alert className="logout_alert" variant="danger">
      <p>Continue logging out?</p>
      <button
        className="rn-button-style--2 rn-btn-reverse-red mr--10"
        onClick={async () => {
          try { await dispatch(logout()); onHide(); navigate(0); }
          catch { dispatch(showNotification({ severity: "error", detail: "Could not sign out. Please retry." })); }
        }}
      >
        LOG OUT
      </button>
      <button
        className="rn-button-style--2 rn-btn-reverse-green"
        onClick={onHide}
      >
        STAY
      </button>
    </Alert>
  );
};

export default LogoutAlert;
