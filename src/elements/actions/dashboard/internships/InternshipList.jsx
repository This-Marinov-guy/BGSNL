import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useHttpClient } from "../../../../hooks/common/http-hook";
import { useDispatch } from "react-redux";
import { showNotification } from "../../../../redux/notification";
import ConfirmCenterModal from "../../../ui/modals/ConfirmCenterModal";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

const InternshipList = () => {
  const { sendRequest, loading } = useHttpClient();
  const dispatch = useDispatch();

  const [internships, setInternships] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggling, setToggling] = useState(new Set());

  const loadInternships = async () => {
    try {
      const data = await sendRequest("internship/admin-list");
      setInternships(data?.internships ?? []);
    } catch {
      dispatch(showNotification({ severity: "error", detail: "Failed to load internships." }));
    }
  };

  useEffect(() => {
    loadInternships();
  }, []);

  const handleToggleActive = async (item) => {
    if (toggling.has(item._id)) return;

    setToggling((prev) => new Set(prev).add(item._id));
    setInternships((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, isActive: !i.isActive } : i))
    );

    try {
      const formData = new FormData();
      formData.append("isActive", String(!item.isActive));
      await sendRequest(`internship/edit/${item._id}`, "PATCH", formData);
    } catch {
      // revert on failure
      setInternships((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, isActive: item.isActive } : i))
      );
      dispatch(showNotification({ severity: "error", detail: "Failed to update status." }));
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(item._id);
        return next;
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await sendRequest(`internship/delete/${deleteTarget._id}`, "DELETE");
      dispatch(showNotification({ severity: "success", summary: "Internship deleted" }));
      setDeleteTarget(null);
      loadInternships();
    } catch {
      dispatch(showNotification({ severity: "error", detail: "Failed to delete internship." }));
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb--30 flex-wrap" style={{ gap: "15px" }}>
        <h3 style={{ margin: 0 }}>Internships Dashboard</h3>
        <Link to="/user/add-internship" className="rn-button-style--2 rn-btn-green">
          <FiPlus style={{ marginRight: "6px" }} />
          Add Internship
        </Link>
      </div>

      {loading && internships.length === 0 && <p>Loading...</p>}

      {!loading && internships.length === 0 && (
        <div className="empty-state">
          <p>No internships yet. Add the first one above.</p>
        </div>
      )}

      {internships.map((item) => (
        <div
          key={item._id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "14px 20px",
            marginBottom: "12px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            backgroundColor: item.isActive ? "#fff" : "#f9fafb",
            transition: "background-color 0.2s",
          }}
        >
          {/* Logo */}
          <div style={{ flex: "0 0 60px" }}>
            {item.logo ? (
              <img
                src={item.logo}
                alt={item.company}
                style={{ width: "60px", height: "40px", objectFit: "contain", borderRadius: "4px" }}
              />
            ) : (
              <div style={{ width: "60px", height: "40px", background: "#f3f4f6", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#9ca3af" }}>
                No logo
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "15px", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.company}
            </div>
            <div style={{ fontSize: "13px", color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.specialty}
            </div>
          </div>

          {/* Label badge */}
          <span style={{
            flexShrink: 0,
            backgroundColor: item.label === "Bulgarian" ? "#dcfce7" : "#dbeafe",
            color: item.label === "Bulgarian" ? "#166534" : "#1e40af",
            borderRadius: "9999px",
            padding: "3px 10px",
            fontSize: "11px",
            fontWeight: 600,
          }}>
            {item.label}
          </span>

          {/* Active toggle */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "7px" }}>
            <button
              type="button"
              onClick={() => handleToggleActive(item)}
              disabled={toggling.has(item._id)}
              title={item.isActive ? "Deactivate" : "Activate"}
              style={{
                position: "relative",
                width: "40px",
                height: "22px",
                borderRadius: "11px",
                border: "none",
                backgroundColor: item.isActive ? "#017363" : "#d1d5db",
                cursor: toggling.has(item._id) ? "default" : "pointer",
                transition: "background-color 0.2s",
                opacity: toggling.has(item._id) ? 0.6 : 1,
                padding: 0,
                flexShrink: 0,
              }}
            >
              <span style={{
                position: "absolute",
                top: "2px",
                left: item.isActive ? "20px" : "2px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                backgroundColor: "#fff",
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
            </button>
            <span style={{ fontSize: "11px", fontWeight: 600, color: item.isActive ? "#166534" : "#9ca3af", minWidth: "46px" }}>
              {item.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Actions */}
          <div className="d-flex" style={{ gap: "8px", flexShrink: 0 }}>
            <Link
              to={`/user/edit-internship/${item._id}`}
              className="rn-button"
              style={{ padding: "6px 14px", fontSize: "13px" }}
              title="Edit"
            >
              <FiEdit2 />
            </Link>
            <button
              className="rn-button-style--2 rn-btn-solid-red"
              style={{ padding: "6px 14px", fontSize: "13px", border: "none", cursor: "pointer" }}
              onClick={() => setDeleteTarget(item)}
              title="Delete"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      ))}

      <ConfirmCenterModal
        visible={!!deleteTarget}
        setVisible={(v) => { if (!v) setDeleteTarget(null); }}
        onConfirm={handleDelete}
        text={deleteTarget ? `Are you sure you want to delete "${deleteTarget.company} — ${deleteTarget.specialty}"? This cannot be undone.` : ""}
        loading={loading}
      />
    </>
  );
};

export default InternshipList;
