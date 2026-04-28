import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useHttpClient } from "../../../hooks/common/http-hook";
import { useDispatch } from "react-redux";
import { showNotification } from "../../../redux/notification";
import { useNavigate } from "react-router-dom";
import ImageInput from "../../inputs/common/ImageInput";
import { FiChevronDown, FiCheck, FiX } from "react-icons/fi";

const LABELS = ["Bulgarian", "International & Remote"];

const EMPTY_FORM = {
  company: "",
  specialty: "",
  location: "",
  label: "Bulgarian",
  duration: "",
  description: "",
  bonuses: "",
  requirements: "",
  languages: "",
  contactMail: "",
  website: "",
  applyLink: "",
};

const InternshipForm = ({ internship }) => {
  const isEdit = !!internship;
  const { sendRequest, loading } = useHttpClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [selectedLogoUrl, setSelectedLogoUrl] = useState(null);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [existingLogos, setExistingLogos] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    if (pickerOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerOpen]);

  useEffect(() => {
    const fetchExistingLogos = async () => {
      try {
        const data = await sendRequest("internship/admin-list");
        const seen = new Set();
        const logos = (data?.internships ?? []).reduce((acc, i) => {
          if (i.logo && !seen.has(i.logo)) {
            seen.add(i.logo);
            acc.push({ url: i.logo, company: i.company });
          }
          return acc;
        }, []);
        setExistingLogos(logos);
      } catch {
        // non-critical
      }
    };
    fetchExistingLogos();
  }, []);

  useEffect(() => {
    if (internship) {
      setForm({
        company: internship.company ?? "",
        specialty: internship.specialty ?? "",
        location: internship.location ?? "",
        label: internship.label ?? "Bulgarian",
        duration: internship.duration ?? "",
        description: internship.description ?? "",
        bonuses: internship.bonuses ?? "",
        requirements: internship.requirements ?? "",
        languages: internship.languages ?? "",
        contactMail: internship.contactMail ?? "",
        website: internship.website ?? "",
        applyLink: internship.applyLink ?? "",
      });
    }
  }, [internship]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setSelectedLogoUrl(null);
    }
  };

  const handleSelectExistingLogo = (url) => {
    setSelectedLogoUrl(url);
    setLogoFile(null);
    setImageInputKey((k) => k + 1);
    setPickerOpen(false);
  };

  const handleClearSelectedLogo = () => {
    setSelectedLogoUrl(null);
    setImageInputKey((k) => k + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.specialty || !form.location || !form.label) {
      dispatch(showNotification({ severity: "warn", detail: "Company, specialty, location and label are required." }));
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (logoFile) {
      formData.append("logo", logoFile);
    } else if (selectedLogoUrl) {
      formData.append("existingLogoUrl", selectedLogoUrl);
    }

    try {
      if (isEdit) {
        await sendRequest(`internship/edit/${internship._id}`, "PATCH", formData);
        dispatch(showNotification({ severity: "success", summary: "Internship updated" }));
      } else {
        await sendRequest("internship/add", "POST", formData);
        dispatch(showNotification({ severity: "success", summary: "Internship created" }));
      }
      navigate("/user/internships-dashboard");
    } catch {
      dispatch(showNotification({ severity: "error", detail: "Something went wrong. Please try again." }));
    }
  };

  const labelStyle = { display: "block", width: "fit-content", fontWeight: 600, marginBottom: "6px", color: "#374151" };
  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "15px", marginBottom: "20px" };
  const textareaStyle = { ...inputStyle, minHeight: "110px", resize: "vertical" };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        {/* Left column */}
        <div className="col-md-6">
          <div>
            <label style={labelStyle}>Company *</label>
            <input name="company" value={form.company} onChange={handleChange} style={inputStyle} required />
          </div>

          <div>
            <label style={labelStyle}>Specialty / Position *</label>
            <input name="specialty" value={form.specialty} onChange={handleChange} style={inputStyle} required />
          </div>

          <div>
            <label style={labelStyle}>Location *</label>
            <input name="location" value={form.location} onChange={handleChange} style={inputStyle} required />
          </div>

          <div>
            <label style={labelStyle}>Label *</label>
            <select name="label" value={form.label} onChange={handleChange} style={inputStyle}>
              {LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Duration</label>
            <input name="duration" value={form.duration} onChange={handleChange} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Languages</label>
            <input name="languages" value={form.languages} onChange={handleChange} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Contact Email</label>
            <input name="contactMail" type="email" value={form.contactMail} onChange={handleChange} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Website</label>
            <input name="website" value={form.website} onChange={handleChange} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Apply Link (external, optional)</label>
            <input name="applyLink" value={form.applyLink} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        {/* Right column */}
        <div className="col-md-6">
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Company Logo</label>

            <ImageInput
              key={imageInputKey}
              initialImage={selectedLogoUrl ? "" : (internship?.logo ?? "")}
              onChange={handleLogoChange}
            />

            {existingLogos.length > 0 && (
              <div ref={pickerRef} style={{ position: "relative", marginTop: "10px", display: "flex", justifyContent: "center" }}>
                {selectedLogoUrl ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img
                      src={selectedLogoUrl}
                      alt="Selected logo"
                      style={{ width: "48px", height: "34px", objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "3px", backgroundColor: "#fff" }}
                    />
                    <button
                      type="button"
                      onClick={() => setPickerOpen((v) => !v)}
                      style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#017363", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 500 }}
                    >
                      Change <FiChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleClearSelectedLogo}
                      title="Clear selected logo"
                      style={{ display: "flex", alignItems: "center", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <FiX size={15} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPickerOpen((v) => !v)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      color: "#374151",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      cursor: "pointer",
                      padding: "7px 14px",
                      fontWeight: 500,
                    }}
                  >
                    Reuse existing logo <FiChevronDown size={14} />
                  </button>
                )}

                {pickerOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 100,
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      padding: "12px",
                      width: "260px",
                    }}
                  >
                    <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "10px", fontWeight: 500 }}>
                      Select a logo
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "8px",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {existingLogos.map(({ url, company }) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => handleSelectExistingLogo(url)}
                          title={company}
                          style={{
                            position: "relative",
                            padding: "5px",
                            borderRadius: "8px",
                            border: selectedLogoUrl === url ? "2px solid #017363" : "2px solid #e5e7eb",
                            backgroundColor: selectedLogoUrl === url ? "#f0f8f6" : "#fff",
                            cursor: "pointer",
                            transition: "border-color 0.15s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {selectedLogoUrl === url && (
                            <span style={{ position: "absolute", top: "2px", right: "2px", color: "#017363", lineHeight: 1 }}>
                              <FiCheck size={10} />
                            </span>
                          )}
                          <img
                            src={url}
                            alt={company}
                            style={{ width: "44px", height: "30px", objectFit: "contain", display: "block" }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} style={textareaStyle} />
          </div>

          <div>
            <label style={labelStyle}>Bonuses / Benefits</label>
            <textarea name="bonuses" value={form.bonuses} onChange={handleChange} style={textareaStyle} />
          </div>

          <div>
            <label style={labelStyle}>Requirements</label>
            <textarea name="requirements" value={form.requirements} onChange={handleChange} style={textareaStyle} />
          </div>
        </div>
      </div>

      <div className="d-flex" style={{ gap: "12px", marginTop: "8px" }}>
        <button
          type="submit"
          disabled={loading}
          className="rn-button-style--2 rn-btn-green"
          style={{ minWidth: "140px" }}
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Internship"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/user/internships-dashboard")}
          className="rn-button-style--2"
          style={{ minWidth: "100px" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

InternshipForm.propTypes = {
  internship: PropTypes.object,
};

export default InternshipForm;
