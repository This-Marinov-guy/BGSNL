import { LoadingSkeleton, LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import {
  FiEdit2,
  FiTrash2,
} from "@/elements/ui/icons/IconlyIcons";
import { useSearchParams } from "next/navigation";
import styles from "./internship-list.module.scss";
import workspace from "@/screens/userActions/dashboard-workspace.module.scss";
import InternshipForm from "../../form/InternshipForm";
import { useHttpClient } from "../../../../hooks/common/http-hook";
import { showNotification } from "../../../../redux/notification";
import ConfirmCenterModal from "../../../ui/modals/ConfirmCenterModal";

const FALLBACK_INTERNSHIP_IMAGE = "/assets/images/news/internships.jpg";
const getOrderSignature = (items = []) => items.map((item) => item._id).join("|");

const ReorderGripIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
  <path fillRule="evenodd" clipRule="evenodd" d="M11.9583 16.7617C11.2633 16.7617 10.6973 17.3267 10.6973 18.0227C10.6973 18.7177 11.2633 19.2827 11.9583 19.2827C12.6533 19.2827 13.2193 18.7177 13.2193 18.0227C13.2193 17.3267 12.6533 16.7617 11.9583 16.7617Z" fill="currentColor" />
  <path fillRule="evenodd" clipRule="evenodd" d="M11.9583 10.7402C11.2633 10.7402 10.6973 11.3052 10.6973 12.0012C10.6973 12.6962 11.2633 13.2622 11.9583 13.2622C12.6533 13.2622 13.2193 12.6962 13.2193 12.0012C13.2193 11.3052 12.6533 10.7402 11.9583 10.7402Z" fill="currentColor" />
  <path fillRule="evenodd" clipRule="evenodd" d="M11.9583 4.71875C11.2633 4.71875 10.6973 5.28375 10.6973 5.97975C10.6973 6.67475 11.2633 7.23975 11.9583 7.23975C12.6533 7.23975 13.2193 6.67475 13.2193 5.97975C13.2193 5.28375 12.6533 4.71875 11.9583 4.71875Z" fill="currentColor" />
  <path fillRule="evenodd" clipRule="evenodd" d="M17.9964 16.7617C17.3014 16.7617 16.7354 17.3267 16.7354 18.0227C16.7354 18.7177 17.3014 19.2827 17.9964 19.2827C18.6904 19.2827 19.2564 18.7177 19.2564 18.0227C19.2564 17.3267 18.6904 16.7617 17.9964 16.7617Z" fill="currentColor" />
  <path fillRule="evenodd" clipRule="evenodd" d="M17.9964 10.7402C17.3014 10.7402 16.7354 11.3052 16.7354 12.0012C16.7354 12.6962 17.3014 13.2622 17.9964 13.2622C18.6904 13.2622 19.2564 12.6962 19.2564 12.0012C19.2564 11.3052 18.6904 10.7402 17.9964 10.7402Z" fill="currentColor" />
  <path fillRule="evenodd" clipRule="evenodd" d="M17.9964 7.23975C18.6904 7.23975 19.2564 6.67475 19.2564 5.97875C19.2564 5.28375 18.6904 4.71875 17.9964 4.71875C17.3014 4.71875 16.7354 5.28375 16.7354 5.97875C16.7354 6.67475 17.3014 7.23975 17.9964 7.23975Z" fill="currentColor" />
  <path fillRule="evenodd" clipRule="evenodd" d="M6.00514 16.7617C5.31014 16.7617 4.74414 17.3267 4.74414 18.0227C4.74414 18.7177 5.31014 19.2827 6.00514 19.2827C6.70014 19.2827 7.26614 18.7177 7.26614 18.0227C7.26614 17.3267 6.70014 16.7617 6.00514 16.7617Z" fill="currentColor" />
  <path fillRule="evenodd" clipRule="evenodd" d="M6.00514 10.7402C5.31014 10.7402 4.74414 11.3052 4.74414 12.0012C4.74414 12.6962 5.31014 13.2622 6.00514 13.2622C6.70014 13.2622 7.26614 12.6962 7.26614 12.0012C7.26614 11.3052 6.70014 10.7402 6.00514 10.7402Z" fill="currentColor" />
  <path fillRule="evenodd" clipRule="evenodd" d="M6.00514 4.71875C5.31014 4.71875 4.74414 5.28375 4.74414 5.97975C4.74414 6.67475 5.31014 7.23975 6.00514 7.23975C6.70014 7.23975 7.26614 6.67475 7.26614 5.97975C7.26614 5.28375 6.70014 4.71875 6.00514 4.71875Z" fill="currentColor" />
</svg>;

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
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [actionError, setActionError] = useState("");
  const [editor, setEditor] = useState({ open: false, internship: null });
  const searchParams = useSearchParams();
  const requestedEditor = searchParams.get("edit");
  const handledEditor = useRef(null);
  const closeEditor = useCallback(() => {
    setEditor(current => ({ ...current, open: false }));
    const url = new URL(window.location.href);
    if (url.searchParams.has("edit")) {
      url.searchParams.delete("edit");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggling, setToggling] = useState(new Set());
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [reorderAnnouncement, setReorderAnnouncement] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);
  const dragPointerRef = useRef(null);
  const persistedInternshipsRef = useRef([]);
  const autoSaveTimeoutRef = useRef(null);

  const setLoadedInternships = (items) => {
    const nextItems = items ?? [];
    setInternships(nextItems);
    persistedInternshipsRef.current = nextItems;
    dragPointerRef.current = null;
    setDraggedId(null);
    setDragOverId(null);
  };

  const loadInternships = async () => {
    setLoadFailed(false);
    try {
      const data = await sendRequest("internship/admin-list");
      if (!data) { setLoadFailed(true); return; }
      setLoadedInternships(data?.internships ?? []);
      setLoaded(true);
    } catch {
      setLoadFailed(true);
    }
  };

  useEffect(() => {
    loadInternships();
  }, []);

  useEffect(() => {
    if (!requestedEditor) { handledEditor.current = null; return; }
    if (handledEditor.current === requestedEditor || (requestedEditor !== "new" && !loaded)) return;
    handledEditor.current = requestedEditor;
    const internship = requestedEditor === "new" ? null : internships.find(item => item._id === requestedEditor);
    if (requestedEditor !== "new" && !internship) {
      dispatch(showNotification({ severity: "error", detail: "Internship not found." }));
      closeEditor();
      return;
    }
    setEditor({ open: true, internship });
  }, [requestedEditor, loaded, internships, dispatch, closeEditor]);

  const handleToggleActive = async (item) => {
    if (toggling.has(item._id)) return;
    setActionError("");

    setToggling((prev) => new Set(prev).add(item._id));
    setInternships((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, isActive: !i.isActive } : i))
    );

    try {
      const formData = new FormData();
      formData.append("isActive", String(!item.isActive));
      const response = await sendRequest(`internship/edit/${item._id}`, "PATCH", formData);
      if (!response?.status) throw new Error("Internship update failed");
    } catch {
      // revert on failure
      setInternships((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, isActive: item.isActive } : i))
      );
      setActionError("Internship status could not be updated. Please try again.");
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
    setActionError("");
    try {
      const response = await sendRequest(`internship/delete/${deleteTarget._id}`, "DELETE");
      if (!response?.status) throw new Error("Internship deletion failed");
      dispatch(showNotification({ severity: "success", summary: "Internship deleted" }));
      setDeleteTarget(null);
      loadInternships();
    } catch {
      setActionError("Internship could not be deleted. Please try again.");
    }
  };

  const persistOrder = async (items) => {
    if (savingOrder || items.length === 0) return;

    setSavingOrder(true);
    setActionError("");

    try {
      const data = await sendRequest(
        "internship/reorder",
        "PATCH",
        { internshipIds: items.map((item) => item._id) },
        {},
        false
      );

      if (!data?.status) {
        throw new Error("Failed to save internship order.");
      }

      setLoadedInternships(data?.internships ?? items);
    } catch {
      setActionError("Internship order could not be saved. Please try again.");
    } finally {
      setSavingOrder(false);
    }
  };

  const stopDragging = () => {
    dragPointerRef.current = null;
    setDraggedId(null);
    setDragOverId(null);
  };

  const rowUnderPointer = (event) => document.elementFromPoint(event.clientX, event.clientY)
    ?.closest("[data-internship-id]")?.dataset.internshipId;

  const handlePointerDown = (event, itemId) => {
    if (savingOrder || (event.pointerType === "mouse" && event.button !== 0)) return;
    dragPointerRef.current = { pointerId: event.pointerId, itemId };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggedId(itemId);
    setDragOverId(itemId);
  };

  const handlePointerMove = (event) => {
    if (dragPointerRef.current?.pointerId !== event.pointerId) return;
    setDragOverId(rowUnderPointer(event) || null);
  };

  const handlePointerUp = (event) => {
    const drag = dragPointerRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    const targetId = rowUnderPointer(event);
    if (targetId && targetId !== drag.itemId) {
      const targetIndex = internships.findIndex(item => item._id === targetId);
      const item = internships.find(entry => entry._id === drag.itemId);
      setInternships(items => moveInternship(items, drag.itemId, targetId));
      if (item) setReorderAnnouncement(`${item.company} moved to position ${targetIndex + 1} of ${internships.length}.`);
    }
    stopDragging();
  };

  const handlePointerCancel = (event) => {
    if (dragPointerRef.current?.pointerId === event.pointerId) stopDragging();
  };

  const handleReorderKeyDown = (event, item, index) => {
    if (savingOrder || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = index + (event.key === "ArrowUp" ? -1 : 1);
    const target = internships[nextIndex];
    if (!target) return;
    setInternships(items => moveInternship(items, item._id, target._id));
    setReorderAnnouncement(`${item.company} moved to position ${nextIndex + 1} of ${internships.length}.`);
  };

  const hasOrderChanges =
    internships.length > 0 &&
    getOrderSignature(internships) !== getOrderSignature(persistedInternshipsRef.current);

  useEffect(() => {
    if (!hasOrderChanges || savingOrder || draggedId) return;

    autoSaveTimeoutRef.current = window.setTimeout(() => {
      autoSaveTimeoutRef.current = null;
      persistOrder(internships);
    }, 500);

    return () => {
      if (autoSaveTimeoutRef.current) {
        window.clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
    };
  }, [draggedId, hasOrderChanges, internships, savingOrder]);

  return (
    <>
      <h1 className="visually-hidden">Internships</h1>
      <div className={workspace.toolbar}>
        <button type="button" onClick={() => setEditor({ open: true, internship: null })} className="rn-button-style--2 rn-btn-reverse-green">
          <span>Add internship</span>
        </button>
      </div>

      {!loadFailed && (!loaded || loading) && internships.length === 0 && <LoadingSkeleton label="Loading internships" variant="cards" count={4} />}
      {loadFailed && <LoadErrorBanner message="Internships could not be loaded." onRetry={loadInternships} />}
      {actionError && <p role="alert">{actionError}</p>}
      <p className={styles.srOnly} role="status">{reorderAnnouncement}</p>
      <p className={styles.srOnly} id="internship-reorder-instructions">Drag to reorder, or use the up and down arrow keys when the handle is focused.</p>

      {loaded && !loadFailed && !loading && internships.length === 0 && (
        <div className="empty-state">
          <p>No internships yet. Add the first one above.</p>
        </div>
      )}

      <div className={styles.list}>
        {internships.map((item, index) => (
          <article key={item._id} className={styles.row} data-internship-id={item._id}
            data-dragging={draggedId === item._id || undefined}
            data-drop-target={dragOverId === item._id && draggedId !== item._id || undefined}
            data-inactive={!item.isActive || undefined}>
            <img className={styles.logo} src={item.logo || FALLBACK_INTERNSHIP_IMAGE} alt="" loading="lazy" />
            <div className={styles.identity}><strong>{item.company}</strong><p>{item.specialty}</p></div>
            <span className={styles.badge} data-local={item.label === "Bulgarian" || undefined}>{item.label}</span>
            <button type="button" className={styles.visibility} aria-pressed={item.isActive}
              aria-label={`Show ${item.company} internship`} disabled={toggling.has(item._id)}
              onClick={() => handleToggleActive(item)}>
              <span className={styles.track} aria-hidden /><span>{item.isActive ? "Active" : "Inactive"}</span>
            </button>
            <button type="button" className={styles.order} aria-disabled={savingOrder} aria-busy={savingOrder}
              aria-label={`Reorder ${item.company} internship, position ${index + 1} of ${internships.length}`}
              aria-describedby="internship-reorder-instructions" title="Drag to reorder"
              onPointerDown={event => handlePointerDown(event, item._id)} onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp} onPointerCancel={handlePointerCancel} onLostPointerCapture={handlePointerCancel}
              onKeyDown={event => handleReorderKeyDown(event, item, index)}><ReorderGripIcon /></button>
            <div className={styles.actions}>
              <button type="button" onClick={() => setEditor({ open: true, internship: item })}
                aria-label={`Edit ${item.company} internship`} title="Edit"><FiEdit2 aria-hidden /></button>
              <button type="button" className={styles.danger} onClick={() => setDeleteTarget(item)}
                aria-label={`Delete ${item.company} internship`} title="Delete"><FiTrash2 aria-hidden /></button>
            </div>
          </article>
        ))}
      </div>

      <InternshipForm visible={editor.open} internship={editor.internship} onClose={closeEditor}
        onSaved={() => { closeEditor(); loadInternships(); }} />

      <ConfirmCenterModal
        visible={!!deleteTarget}
        setVisible={(v) => {
          if (!v) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        text={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.company} — ${deleteTarget.specialty}"? This cannot be undone.`
            : ""
        }
        loading={loading}
      />
    </>
  );
};

export default InternshipList;
