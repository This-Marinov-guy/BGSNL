import {
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import {
  confirmPopup,
  ConfirmPopup,
  Dialog,
} from "@/compat/primereact";
import {
  FiFile,
  FiTrash2,
  FiUpload,
} from "@/elements/ui/icons/IconlyIcons";

const getPdfValidationMessage = (file) => {
  if (!file) return "";
  if (file.type !== "application/pdf") {
    return "Please upload a PDF file only.";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "File size must be less than 5MB.";
  }
  return "";
};

const CVUploadModal = ({ visible, onHide, currentCV, onSave, isSaving }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [shouldRemove, setShouldRemove] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      e.currentTarget.setCustomValidity(getPdfValidationMessage(file));
      setSelectedFile(file);
      setShouldRemove(false);
    }
  };

  const handleRemove = (event) => {
    confirmPopup({
      target: event.currentTarget,
      message: "Are you sure you want to remove your CV? This action cannot be undone.",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "reject",
      accept: () => {
        onSave(null, true);
      },
      reject: () => {
        // User cancelled, do nothing
      },
    });
  };

  const handleSave = (event) => {
    event.preventDefault();
    onSave(selectedFile, shouldRemove);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setShouldRemove(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.setCustomValidity("");
    }
    onHide();
  };

  const actions = (
    <>
      <button
        type="button"
        className="rn-button-style--2 rn-btn-reverse"
        onClick={handleClose}
        disabled={isSaving}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="cv-upload-form"
        className="rn-button-style--2 rn-btn-green"
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </>
  );

  return (
    <>
      <ConfirmPopup />
      <Dialog
        header="Manage Your CV"
        visible={visible}
        style={{ width: "500px" }}
        onHide={handleClose}
        closable={!isSaving}
        footer={actions}
      >
        <form
          className="cv-upload-modal"
          id="cv-upload-form"
          onSubmit={handleSave}
        >
        {/* Current CV Status */}
        {currentCV && (
          <div className="mb--20">
            <h5 style={{ marginBottom: "10px" }}>Current CV:</h5>
            <div
              className="d-flex align-items-center justify-content-between"
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "8px",
              }}
            >
              <div className="d-flex align-items-center">
                <FiFile
                  size={20}
                  style={{ marginRight: "8px", color: "#017363" }}
                />
                <span>CV uploaded</span>
              </div>
              <button
                type="button"
                className="rn-button-style--2 rn-btn-small rn-btn-reverse-red"
                onClick={handleRemove}
                disabled={isSaving}
                style={{ padding: "5px 12px" }}
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        )}

        {/* File Upload Section */}
        <div className="mb--20">
          <h5 style={{ marginBottom: "10px" }}>
            {currentCV ? "Replace with New CV:" : "Upload CV:"}
          </h5>
          <div
            className="file-upload-wrapper"
            data-field-name="cv"
            data-custom-validation-field
          >
            <input
              ref={fileInputRef}
              type="file"
              name="cv"
              accept=".pdf"
              required
              onChange={handleFileChange}
              disabled={isSaving}
              style={{ display: "none" }}
              id="cv-file-input"
            />
            <label
              htmlFor="cv-file-input"
              className="rn-button-style--2 rn-btn-green upload-dropzone"
              style={{
                display: "inline-block",
                cursor: isSaving ? "not-allowed" : "pointer",
                padding: "10px 20px",
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              <FiUpload size={14} style={{ marginRight: "8px" }} />
              Choose PDF File
            </label>
            {selectedFile && (
              <div
                className="mt--10"
                style={{ color: "#017363" }}
              >
                <FiFile size={14} style={{ marginRight: "5px" }} />
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>
          <p style={{ color: "#666", marginTop: "8px" }}>
            Maximum file size: 5MB. Accepted format: PDF only.
          </p>
        </div>

      </form>
    </Dialog>
    </>
  );
};

CVUploadModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  currentCV: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
};

export default CVUploadModal;
