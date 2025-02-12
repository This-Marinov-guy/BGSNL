import React from "react";
import Alert from "react-bootstrap/Alert";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
        className="rn-btn mr--10"
        onClick={() => {
          dispatch(logout());
          onHide();
          navigate(0);
        }}
      >
        Log out
      </button>
      <button
        className="rn-button-style--2 rn-btn-reverse-green"
        onClick={onHide}
      >
        Stay
      </button>
    </Alert>
  );
};

export default LogoutAlert;
