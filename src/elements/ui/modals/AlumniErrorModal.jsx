import PropTypes from "prop-types";
import { Dialog } from "@/compat/primereact";
import { FiAlertTriangle } from "@/elements/ui/icons/IconlyIcons";

const AlumniErrorModal = ({ isOpen, onClose }) => {
  const actions = (
    <button
      onClick={onClose}
      className="rn-button-style--2 rn-btn-reverse-green"
      type="button"
    >
      Close
    </button>
  );

  return (
    <Dialog
      header="Already an Alumni"
      visible={isOpen}
      onHide={onClose}
      footer={actions}
      style={{ width: "500px" }}
      dismissableMask
    >
      <div className="center_section center_text">
        <FiAlertTriangle size={42} style={{ color: "#dc3545" }} />
        <p className="mt--20 mb--0">
          Your account is already registered as an Alumni member. You cannot
          register again.
        </p>
      </div>
    </Dialog>
  );
};

AlumniErrorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AlumniErrorModal;
