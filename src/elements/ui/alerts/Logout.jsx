import React from "react";
import PropTypes from "prop-types";
import Alert from "react-bootstrap/Alert";
import { useDispatch } from "react-redux";
import { useNavigate } from "@/util/navigation";
import { logout } from "../../../redux/user";

const LogoutAlert = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = React.useState("");

  if (!visible) {
    return null;
  }

  return (
    <Alert className="logout_alert" variant="danger">
      <p>Continue logging out?</p>
      {logoutError && <p role="alert">{logoutError}</p>}
      <button
        className="rn-button-style--2 rn-btn-reverse-red mr--10"
        onClick={async () => {
          setLogoutError("");
          try { await dispatch(logout()); onHide(); navigate(0); }
          catch { setLogoutError("Could not sign out. Please retry."); }
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

LogoutAlert.propTypes = { visible: PropTypes.bool.isRequired, onHide: PropTypes.func.isRequired };

export default LogoutAlert;
