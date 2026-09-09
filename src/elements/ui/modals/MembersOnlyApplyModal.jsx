import { useCallback } from "react";
import PropTypes from "prop-types";
import { Dialog } from "@/compat/primereact";
import {
  FiLogIn,
  FiUserPlus,
} from "@/elements/ui/icons/IconlyIcons";
import { useNavigate } from "@/util/navigation";
import { getInternshipApplyAccess } from "./internship-access.mjs";

const MembersOnlyApplyModal = ({ visible, onHide, user = null }) => {
  const navigate = useNavigate();
  const { notice } = getInternshipApplyAccess(user);
  // The shared dialog mounts its portal after opening; focus the recovery link
  // when it actually enters the DOM, including for keyboard-only applicants.
  const focusRecoveryAction = useCallback((node) => {
    node?.focus({ preventScroll: true });
  }, []);

  const handleJoin = () => {
    onHide();
    navigate("/join-the-society");
  };

  const handleLogIn = () => {
    onHide();
    navigate("/login");
  };

  const footer = notice ? (
    <a
      className="rn-button-style--2 rn-btn-reverse-green rn-btn-small"
      href={notice.href}
      onClick={onHide}
      ref={focusRecoveryAction}
    >
      {notice.actionLabel}
    </a>
  ) : (
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
      header={notice?.title || "Members only"}
      visible={visible}
      onHide={onHide}
      footer={footer}
      style={{ width: notice ? "min(35rem, 94vw)" : "min(350px, 94vw)" }}
      closable
      dismissableMask
    >
      {notice ? (
        <div className="d-grid gap-3">
          <img
            alt=""
            aria-hidden="true"
            className="internship-access-modal__lock"
            src="/assets/images/svg/3d/lock.png"
          />
          <p className="mb--0">{notice.description}</p>
          <p className="mb--0">An active account with membership benefits is required to apply for internships.</p>
        </div>
      ) : (
        <>
          <img
            alt=""
            aria-hidden="true"
            className="internship-access-modal__lock"
            src="/assets/images/svg/3d/lock.png"
          />
          <h4 className="text-center">
            Only BGSNL members can apply for internships. Join our community or log
            in to your account to continue.
          </h4>
        </>
      )}
    </Dialog>
  );
};

MembersOnlyApplyModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default MembersOnlyApplyModal;
