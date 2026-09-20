import { Dialog, ProgressSpinner, SelectInput } from "@/compat/primereact";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import {
  FiCheck,
  FiChevronDown,
  FiX,
} from "@/elements/ui/icons/IconlyIcons";
import { useHttpClient } from "../../../hooks/common/http-hook";
import { showNotification } from "../../../redux/notification";
import ImageInput from "../../inputs/common/ImageInput";

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

const InternshipForm = ({ internship, visible, onClose, onSaved }) => {
  const isEdit = !!internship;
  const { sendRequest } = useHttpClient();
  const dispatch = useDispatch();
  const formId = useId();
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const close = useCallback(() => { if (!submitting.current) onClose(); }, [onClose]);

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
    if (!visible) return;
    let cancelled = false;
    const fetchExistingLogos = async () => {
      try {
        const data = await sendRequest("internship/admin-list", "GET", null, {}, false, false);
        const seen = new Set();
        const logos = (data?.internships ?? []).reduce((acc, i) => {
          if (i.logo && !seen.has(i.logo)) {
            seen.add(i.logo);
            acc.push({ url: i.logo, company: i.company });
          }
          return acc;
        }, []);
        if (!cancelled) setExistingLogos(logos);
      } catch {
        // non-critical
      }
    };
    fetchExistingLogos();
    return () => { cancelled = true; };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    setLogoFile(null);
    setSelectedLogoUrl(null);
    setImageInputKey(key => key + 1);
    setPickerOpen(false);
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
    } else {
      setForm(EMPTY_FORM);
    }
  }, [internship, visible]);

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
    if (submitting.current) return;
    submitting.current = true;
    setSaving(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (logoFile) {
      formData.append("logo", logoFile);
    } else if (selectedLogoUrl) {
      formData.append("existingLogoUrl", selectedLogoUrl);
    }

    try {
      let responseData;
      if (isEdit) {
        responseData = await sendRequest(
          `internship/edit/${internship._id}`,
          "PATCH",
          formData, {}, true, false
        );
      } else {
        responseData = await sendRequest("internship/add", "POST", formData, {}, true, false);
      }

      if (responseData?.status !== true) return;

      dispatch(
        showNotification({
          severity: "success",
          summary: isEdit ? "Internship updated" : "Internship created",
        })
      );
      onSaved();
    } catch {
      dispatch(showNotification({ severity: "error", detail: "Something went wrong. Please try again." }));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  const labelStyle = { display: "block", width: "fit-content", marginBottom: "6px", color: "#374151" };
  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", marginBottom: "20px" };
  const textareaStyle = { ...inputStyle, minHeight: "110px", resize: "vertical" };

  return (
    <Dialog visible={visible} header={isEdit ? "Edit internship" : "Add internship"} onHide={close} closable={!saving}
      style={{ width: "min(960px, calc(100vw - 2rem))" }}
      footer={<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "12px" }}>
        <button type="button" disabled={saving} onClick={close} className="rn-button-style--2">Cancel</button>
        <button type="submit" form={formId} disabled={saving} className="rn-button-style--2 rn-btn-green" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: ".75rem" }}>
          {saving && <ProgressSpinner style={{ width: "20px", height: "20px" }} />}
          <span>{saving ? "Saving…" : isEdit ? "Save changes" : "Create internship"}</span>
        </button>
      </div>}>
    <form id={formId} onSubmit={handleSubmit} aria-busy={saving}>
      <fieldset disabled={saving} inert={saving || undefined} style={{ margin: 0, padding: 0, border: 0, minWidth: 0 }}>
      <div className="row">
        {/* Left column */}
        <div className="col-md-6">
          <div>
            <label htmlFor={`${formId}-company`} style={labelStyle}>Company *</label>
            <input id={`${formId}-company`} name="company" value={form.company} onChange={handleChange} style={inputStyle} required />
          </div>

          <div>
            <label htmlFor={`${formId}-specialty`} style={labelStyle}>Specialty / Position *</label>
            <input id={`${formId}-specialty`} name="specialty" value={form.specialty} onChange={handleChange} style={inputStyle} required />
          </div>

          <div>
            <label htmlFor={`${formId}-location`} style={labelStyle}>Location *</label>
            <input id={`${formId}-location`} name="location" value={form.location} onChange={handleChange} style={inputStyle} required />
          </div>

          <div>
            <label htmlFor={`${formId}-label`} style={labelStyle}>Label *</label>
            <SelectInput id={`${formId}-label`} name="label" value={form.label} onChange={handleChange} style={inputStyle} required>
              {LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </SelectInput>
          </div>

          <div>
            <label htmlFor={`${formId}-duration`} style={labelStyle}>Duration</label>
            <input id={`${formId}-duration`} name="duration" value={form.duration} onChange={handleChange} style={inputStyle} />
          </div>

          <div>
            <label htmlFor={`${formId}-languages`} style={labelStyle}>Languages</label>
            <input id={`${formId}-languages`} name="languages" value={form.languages} onChange={handleChange} style={inputStyle} />
          </div>

          <div>
            <label htmlFor={`${formId}-contactMail`} style={labelStyle}>Contact Email</label>
            <input id={`${formId}-contactMail`} name="contactMail" type="email" value={form.contactMail} onChange={handleChange} style={inputStyle} />
          </div>

          <div>
            <label htmlFor={`${formId}-website`} style={labelStyle}>Website</label>
            <input
              id={`${formId}-website`} name="website"
              type="url"
              maxLength={2048}
              value={form.website}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor={`${formId}-applyLink`} style={labelStyle}>Apply Link (external, optional)</label>
            <input
              id={`${formId}-applyLink`} name="applyLink"
              type="url"
              maxLength={2048}
              value={form.applyLink}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="col-md-6">
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Company Logo</label>

            <ImageInput
              name="logo"
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
                      style={{ display: "flex", alignItems: "center", gap: "5px", color: "#017363", background: "none", border: "none", cursor: "pointer", padding: 0 }}
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
                      color: "#374151",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      cursor: "pointer",
                      padding: "7px 14px",
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
                    <p style={{ color: "#6b7280", marginBottom: "10px" }}>
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
            <label htmlFor={`${formId}-description`} style={labelStyle}>Description</label>
            <textarea id={`${formId}-description`} name="description" value={form.description} onChange={handleChange} style={textareaStyle} />
          </div>

          <div>
            <label htmlFor={`${formId}-bonuses`} style={labelStyle}>Bonuses / Benefits</label>
            <textarea id={`${formId}-bonuses`} name="bonuses" value={form.bonuses} onChange={handleChange} style={textareaStyle} />
          </div>

          <div>
            <label htmlFor={`${formId}-requirements`} style={labelStyle}>Requirements</label>
            <textarea id={`${formId}-requirements`} name="requirements" value={form.requirements} onChange={handleChange} style={textareaStyle} />
          </div>
        </div>
      </div>

      </fieldset>
    </form>
    </Dialog>
  );
};

InternshipForm.propTypes = {
  internship: PropTypes.object,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

export default InternshipForm;
