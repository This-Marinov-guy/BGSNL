import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { FiLogIn, FiUserPlus } from "react-icons/fi";
import ImageFb from "../media/ImageFb";

const MembersOnlyApplyModal = ({ visible, onHide }) => {
  const navigate = useNavigate();

  const handleJoin = () => {
    onHide();
    navigate("/join-the-society");
  };

  const handleLogIn = () => {
    onHide();
    navigate("/login");
  };

  const footer = (
    <div
      className="d-flex flex-wrap gap-2 justify-content-center"
      style={{ gap: "12px" }}
    >
      <button
        type="button"
        className="rn-button-style--2 rn-btn-solid-green"
        onClick={handleJoin}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 24px",
          fontSize: "15px",
          fontWeight: 600,
        }}
      >
        <FiUserPlus size={18} />
        Join
      </button>
      <button
        type="button"
        className="rn-button-style--2 rn-btn-solid-red"
        onClick={handleLogIn}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 24px",
          fontSize: "15px",
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
        }}
      >
        <FiLogIn size={18} />
        Log in
      </button>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      footer={footer}
      style={{ maxWidth: "350px" }}
      closable
      dismissableMask
    >
      <img
        style={{ margin: "10px auto", height: "12em" }}
        className="center_div"
        src={`/assets/images/icons/lightning.png`}
        alt="Ligtning"
      />
      <h4 className="text-center">
        Only BGSNL members can apply for internships. Join our community or log
        in to your account to continue.
      </h4>
    </Dialog>
  );
};

MembersOnlyApplyModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};

export default MembersOnlyApplyModal;
