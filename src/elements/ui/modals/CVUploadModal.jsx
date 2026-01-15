import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { FiUpload, FiTrash2, FiFile } from "react-icons/fi";
import PropTypes from "prop-types";

const CVUploadModal = ({ visible, onHide, currentCV, onSave, isSaving }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [shouldRemove, setShouldRemove] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF only)
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file only");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
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

  const handleSave = () => {
    onSave(selectedFile, shouldRemove);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setShouldRemove(false);
    onHide();
  };

  return (
    <>
      <ConfirmPopup />
      <Dialog
        header="Manage Your CV"
        visible={visible}
        style={{ width: "500px" }}
        onHide={handleClose}
        closable={!isSaving}
      >
        <div className="cv-upload-modal">
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
                className="rn-button-style--2 rn-btn-small rn-btn-reverse-red"
                onClick={handleRemove}
                disabled={isSaving}
                style={{ fontSize: "12px", padding: "5px 12px" }}
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
          <div className="file-upload-wrapper">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isSaving}
              style={{ display: "none" }}
              id="cv-file-input"
            />
            <label
              htmlFor="cv-file-input"
              className="rn-button-style--2 rn-btn-green"
              style={{
                display: "inline-block",
                cursor: isSaving ? "not-allowed" : "pointer",
                fontSize: "14px",
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
                style={{ fontSize: "14px", color: "#017363" }}
              >
                <FiFile size={14} style={{ marginRight: "5px" }} />
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>
          <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
            Maximum file size: 5MB. Accepted format: PDF only.
          </p>
        </div>

        {/* Action Buttons */}
        <div
          className="d-flex justify-content-end"
          style={{ gap: "10px", marginTop: "30px" }}
        >
          <button
            className="rn-button-style--2 rn-btn-reverse"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="rn-button-style--2 rn-btn-green"
            onClick={handleSave}
            disabled={isSaving || !selectedFile}
          >
            {isSaving ? (
              <>
                <i
                  className="pi pi-spin pi-spinner"
                  style={{ marginRight: "8px" }}
                ></i>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </Dialog>
    </>
  );
};

CVUploadModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  currentCV: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
};

export default CVUploadModal;
