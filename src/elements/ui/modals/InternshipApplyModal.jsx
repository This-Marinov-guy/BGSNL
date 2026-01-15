import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { FiUpload, FiFile, FiX } from "react-icons/fi";
import PropTypes from "prop-types";
import { DOCUMENT_TYPES } from "../../../util/defines/enum";
import { useHttpClient } from "../../../hooks/common/http-hook";
import { useDispatch } from "react-redux";
import { showNotification } from "../../../redux/notification";
import { useRefreshUser } from "../../../hooks/common/api-hooks";

const InternshipApplyModal = ({
  visible,
  onHide,
  internship,
  user,
  cvDocument,
  onApply,
  onUserRefresh,
}) => {
  const [selectedCV, setSelectedCV] = useState(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendRequest } = useHttpClient();
  const dispatch = useDispatch();
  const { refreshUser } = useRefreshUser();


  useEffect(() => {
    if (!visible) {
      // Reset state when modal closes
      setSelectedCV(null);
      setSelectedCoverLetter(null);
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleCVChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file only");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setSelectedCV(file);
    }
  };

  const handleCoverLetterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file only");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setSelectedCoverLetter(file);
    }
  };

  const handleRemoveCoverLetter = () => {
    setSelectedCoverLetter(null);
  };

  const handleSaveDocument = async (file, documentType, existingDocument) => {
    const formData = new FormData();
    let response;

    if (file && existingDocument?.id) {
      // Edit existing document
      formData.append("type", documentType);
      formData.append("content", file);
      response = await sendRequest(
        `user/edit-document/${existingDocument.id}`,
        "PATCH",
        formData
      );
    } else if (file) {
      // Add new document
      formData.append("type", documentType);
      formData.append("content", file);
      response = await sendRequest("user/add-document", "POST", formData);
    }

    return response;
  };

  const handleApply = async () => {
    if (!cvDocument && !selectedCV) {
      dispatch(
        showNotification({
          severity: "error",
          detail: "Please upload a CV to apply for this internship.",
        })
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare promises for CV and cover letter uploads
      const promises = [];

      // Handle CV upload/update if a new CV is selected
      if (selectedCV) {
        promises.push(
          handleSaveDocument(selectedCV, DOCUMENT_TYPES.CV, cvDocument)
        );
      } else {
        // If no new CV selected, resolve with success (using existing CV)
        promises.push(Promise.resolve({ status: true }));
      }

      // Wait for both requests to complete simultaneously
      const [cvResponse] = await Promise.all(promises);

      // Check if both requests were successful
      if (cvResponse?.status === true) {
        const formData = new FormData();
        formData.append("companyId", internship.id);
        formData.append("companyName", internship.company);
        formData.append("position", internship.specialty);
        formData.append("skipCoverLetter", !selectedCoverLetter);
        if (selectedCoverLetter) {
          formData.append("coverLetter", selectedCoverLetter);
        }
        // Both documents saved successfully, now submit the application
        const applicationResponse = await sendRequest(
          "internship/member-apply",
          "POST",
          formData
        );

        if (applicationResponse?.status === true) {
          dispatch(
            showNotification({
              severity: "success",
              detail: "Application submitted successfully!",
            })
          );
          
          // Refresh user data in the background
          if (onUserRefresh) {
            refreshUser(onUserRefresh);
          }
          
          handleClose();
          if (onApply) {
            onApply({
              cv: selectedCV,
              coverLetter: selectedCoverLetter,
            });
          }
        } else {
          dispatch(
            showNotification({
              severity: "error",
              detail: "Failed to submit application. Please try again.",
            })
          );
        }
      } else {
        // Handle errors from document uploads
        if (cvResponse?.status !== true) {
          dispatch(
            showNotification({
              severity: "error",
              detail: "Failed to save CV. Please try again.",
            })
          );
        }
        if (coverLetterResponse?.status !== true) {
          dispatch(
            showNotification({
              severity: "error",
              detail: "Failed to save cover letter. Please try again.",
            })
          );
        }
      }
    } catch (err) {
      console.error("Error applying for internship:", err);
      dispatch(
        showNotification({
          severity: "error",
          detail: "An error occurred while applying. Please try again.",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCV(null);
    setSelectedCoverLetter(null);
    onHide();
  };

  return (
    <Dialog
      header={
        <div className="d-flex align-items-center" style={{ gap: "15px" }}>
          <img
            src={
              internship.logo ||
              "https://t2.uc.ltmcdn.com/en/posts/2/8/0/how_do_internships_work_11082_orig.jpg"
            }
            alt={internship.company}
            style={{ width: "100px", objectFit: "contain" }}
          />
          <div>
            <h4 style={{ margin: 0 }}>
              Apply for {internship.company} | {internship.specialty}
            </h4>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "600px", maxWidth: "90vw" }}
      onHide={handleClose}
      closable={!isSubmitting}
    >
      <div className="internship-apply-modal" style={{ padding: "10px 0" }}>
        {/* CV Section */}
        <div className="mb--30">
          <h5 style={{ marginBottom: "15px", fontWeight: 600 }}>Your CV</h5>
          {cvDocument ? (
            <div
              className="d-flex align-items-center justify-content-between"
              style={{
                background: "#f5f5f5",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <div
                className="d-flex align-items-center"
                style={{ gap: "10px" }}
              >
                <FiFile size={20} style={{ color: "#017363" }} />
                <div>
                  <strong>
                    {cvDocument.name && cvDocument.name.length > 50
                      ? `${cvDocument.name.substring(0, 50)}...`
                      : cvDocument.name}
                  </strong>
                  <p style={{ margin: 0, color: "#666" }}>
                    Current CV will be sent with your application
                  </p>
                </div>
              </div>
              <a
                href={cvDocument.content}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#017363", textDecoration: "none" }}
              >
                View
              </a>
            </div>
          ) : (
            <div
              style={{
                background: "#fff3cd",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px",
                border: "1px solid #ffc107",
              }}
            >
              <p style={{ margin: 0, color: "#856404" }}>
                You have no CV uploaded. Please upload a CV to apply.
              </p>
            </div>
          )}

          <div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleCVChange}
              disabled={isSubmitting}
              style={{ display: "none" }}
              id="cv-file-input-apply"
            />
            <label
              htmlFor="cv-file-input-apply"
              className="rn-button-style--2 rn-btn-green"
              style={{
                display: "inline-block",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                padding: "10px 20px",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              <FiUpload size={14} style={{ marginRight: "8px" }} />
              {cvDocument ? "Change CV" : "Upload CV"}
            </label>
            {selectedCV && (
              <div
                className="mt--10"
                style={{
                  color: "#017363",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <FiFile size={14} />
                <span>
                  {selectedCV.name} ({(selectedCV.size / 1024).toFixed(2)} KB)
                </span>
                <button
                  onClick={() => setSelectedCV(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#dc3545",
                    cursor: "pointer",
                    padding: "0",
                    marginLeft: "10px",
                  }}
                >
                  <FiX size={16} />
                </button>
              </div>
            )}
          </div>
          <small style={{ color: "#666", marginTop: "8px", marginBottom: 0 }}>
            Maximum file size: 5MB. Accepted format: PDF only.
          </small>
        </div>

        {/* Cover Letter Section */}
        <div className="mb--30">
          <h5 style={{ marginBottom: "15px", fontWeight: 600 }}>
            Cover Letter (Optional)
          </h5>
          {selectedCoverLetter && (
            <div
              className="d-flex align-items-center justify-content-between"
              style={{
                background: "#f5f5f5",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <div
                className="d-flex align-items-center"
                style={{ gap: "10px" }}
              >
                <FiFile size={20} style={{ color: "#017363" }} />
                <div>
                  <strong>
                    {selectedCoverLetter.name &&
                    selectedCoverLetter.name.length > 50
                      ? `${selectedCoverLetter.name.substring(0, 50)}...`
                      : selectedCoverLetter.name}
                  </strong>
                  <p style={{ margin: 0, color: "#666" }}>
                    This cover letter will be sent with your application
                  </p>
                </div>
              </div>
              <a
                href={selectedCoverLetter.content}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#017363", textDecoration: "none" }}
              >
                View
              </a>
            </div>
          )}
          <div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleCoverLetterChange}
              disabled={isSubmitting}
              style={{ display: "none" }}
              id="cover-letter-input"
            />
            <label
              htmlFor="cover-letter-input"
              className="rn-button-style--2 rn-btn-reverse"
              style={{
                display: "inline-block",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                padding: "10px 20px",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              <FiUpload size={14} style={{ marginRight: "8px" }} />
              {selectedCoverLetter
                ? "Change Cover Letter"
                : selectedCoverLetter
                ? "Change Cover Letter"
                : "Upload Cover Letter"}
            </label>
            {selectedCoverLetter && (
              <div
                className="mt--10"
                style={{
                  color: "#017363",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <FiFile size={14} />
                <span>
                  {selectedCoverLetter.name} (
                  {(selectedCoverLetter.size / 1024).toFixed(2)} KB)
                </span>
                <button
                  onClick={handleRemoveCoverLetter}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#dc3545",
                    cursor: "pointer",
                    padding: "0",
                    marginLeft: "10px",
                  }}
                >
                  <FiX size={16} />
                </button>
              </div>
            )}
          </div>
          <small style={{ color: "#666", marginTop: "8px", marginBottom: 0 }}>
            Maximum file size: 5MB. Accepted format: PDF only.
          </small>
        </div>

        {/* Action Buttons */}
        <div
          className="d-flex justify-content-end"
          style={{ gap: "10px", marginTop: "30px" }}
        >
          <button
            className="rn-button-style--2 rn-btn-reverse"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="rn-button-style--2 rn-btn-green"
            onClick={handleApply}
            disabled={isSubmitting || (!cvDocument && !selectedCV)}
          >
            {isSubmitting ? (
              <>
                <i
                  className="pi pi-spin pi-spinner"
                  style={{ marginRight: "8px" }}
                ></i>
                Applying...
              </>
            ) : (
              "Apply for Internship"
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

InternshipApplyModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  internship: PropTypes.shape({
    logo: PropTypes.string,
    company: PropTypes.string.isRequired,
    specialty: PropTypes.string.isRequired,
  }).isRequired,
  user: PropTypes.object,
  cvDocument: PropTypes.object,
  onApply: PropTypes.func.isRequired,
  onUserRefresh: PropTypes.func,
};

export default InternshipApplyModal;
