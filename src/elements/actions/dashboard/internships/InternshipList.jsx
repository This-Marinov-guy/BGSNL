import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useHttpClient } from "../../../../hooks/common/http-hook";
import { useDispatch } from "react-redux";
import { showNotification } from "../../../../redux/notification";
import ConfirmCenterModal from "../../../ui/modals/ConfirmCenterModal";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

const FALLBACK_INTERNSHIP_IMAGE = "/assets/images/news/internships.jpg";
const getOrderSignature = (items = []) => items.map((item) => item._id).join("|");

const moveInternship = (items, draggedId, targetId) => {
  const draggedIndex = items.findIndex((item) => item._id === draggedId);
  const targetIndex = items.findIndex((item) => item._id === targetId);

  if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
    return items;
  }

  const nextItems = [...items];
  const [draggedItem] = nextItems.splice(draggedIndex, 1);
  nextItems.splice(targetIndex, 0, draggedItem);

  return nextItems;
};

const InternshipList = () => {
  const { sendRequest, loading } = useHttpClient();
  const dispatch = useDispatch();

  const [internships, setInternships] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggling, setToggling] = useState(new Set());
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const persistedInternshipsRef = useRef([]);

  const setLoadedInternships = (items) => {
    const nextItems = items ?? [];
    setInternships(nextItems);
    persistedInternshipsRef.current = nextItems;
    setDraggedId(null);
    setDragOverId(null);
  };

  const loadInternships = async () => {
    try {
      const data = await sendRequest("internship/admin-list");
      setLoadedInternships(data?.internships ?? []);
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

  const handleSaveOrder = async () => {
    if (savingOrder || internships.length === 0) return;

    setSavingOrder(true);

    try {
      const data = await sendRequest(
        "internship/reorder",
        "PATCH",
        { internshipIds: internships.map((item) => item._id) },
        {},
        false
      );

      if (!data?.status) {
        throw new Error("Failed to save internship order.");
      }

      setLoadedInternships(data?.internships ?? internships);
      dispatch(showNotification({ severity: "success", summary: "Internship order saved" }));
    } catch {
      dispatch(showNotification({ severity: "error", detail: "Failed to save internship order." }));
    } finally {
      setSavingOrder(false);
    }
  };

  const handleResetOrder = () => {
    setInternships(persistedInternshipsRef.current);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragStart = (event, itemId) => {
    if (savingOrder) return;

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", itemId);
    setDraggedId(itemId);
    setDragOverId(itemId);
  };

  const handleDragOver = (event, itemId) => {
    event.preventDefault();

    if (!draggedId || draggedId === itemId) return;

    event.dataTransfer.dropEffect = "move";
    setDragOverId(itemId);
  };

  const handleDrop = (event, itemId) => {
    event.preventDefault();

    const sourceId = draggedId || event.dataTransfer.getData("text/plain");

    if (!sourceId || sourceId === itemId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    setInternships((prev) => moveInternship(prev, sourceId, itemId));
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const hasOrderChanges =
    internships.length > 0 &&
    getOrderSignature(internships) !== getOrderSignature(persistedInternshipsRef.current);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb--30 flex-wrap" style={{ gap: "15px" }}>
        <div>
          <h3 style={{ margin: 0 }}>Internships Dashboard</h3>
          <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#6b7280" }}>
            Drag rows to reorder internships, then save the new order.
          </p>
        </div>
        <div className="d-flex flex-wrap align-items-center" style={{ gap: "10px" }}>
          {hasOrderChanges && (
            <button
              type="button"
              className="rn-button-style--2"
              style={{ padding: "10px 16px", border: "none", cursor: "pointer" }}
              onClick={handleResetOrder}
              disabled={savingOrder}
            >
              Reset order
            </button>
          )}
          <button
            type="button"
            className="rn-button-style--2 rn-btn-green"
            style={{ padding: "10px 16px", border: "none", cursor: hasOrderChanges && !savingOrder ? "pointer" : "default", opacity: hasOrderChanges ? 1 : 0.65 }}
            onClick={handleSaveOrder}
            disabled={!hasOrderChanges || savingOrder}
          >
            {savingOrder ? "Saving..." : "Save order"}
          </button>
          <Link to="/user/add-internship" className="rn-button-style--2 rn-btn-green">
            <FiPlus style={{ marginRight: "6px" }} />
            Add Internship
          </Link>
        </div>
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
          draggable={!savingOrder}
          onDragStart={(event) => handleDragStart(event, item._id)}
          onDragOver={(event) => handleDragOver(event, item._id)}
          onDrop={(event) => handleDrop(event, item._id)}
          onDragEnd={handleDragEnd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "14px 20px",
            marginBottom: "12px",
            borderRadius: "10px",
            border: dragOverId === item._id && draggedId !== item._id ? "1px solid #017363" : "1px solid #e5e7eb",
            backgroundColor: item.isActive ? "#fff" : "#f9fafb",
            transition: "background-color 0.2s, border-color 0.2s, box-shadow 0.2s",
            cursor: savingOrder ? "default" : "grab",
            opacity: draggedId === item._id ? 0.65 : 1,
            boxShadow: dragOverId === item._id && draggedId !== item._id ? "0 0 0 3px rgba(1,115,99,0.12)" : "none",
          }}
        >
          <div style={{ flex: "0 0 70px", display: "flex", alignItems: "center", gap: "10px", color: "#6b7280" }}>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "18px",
                letterSpacing: "1px",
                userSelect: "none",
              }}
              title="Drag to reorder"
            >
              |||
            </span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#9ca3af", minWidth: "22px" }}>
              {internships.findIndex((internship) => internship._id === item._id) + 1}
            </span>
          </div>

          {/* Logo */}
          <div style={{ flex: "0 0 60px" }}>
            <img
              src={item.logo || FALLBACK_INTERNSHIP_IMAGE}
              alt={item.company}
              style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "4px" }}
            />
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
