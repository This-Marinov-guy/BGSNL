import { LoadingSkeleton, LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import {
  FaGripVertical,
  FiChevronUp,
  FiChevronDown,
  FiEdit2,
  FiTrash2,
} from "@/elements/ui/icons/IconlyIcons";
import { useSearchParams } from "next/navigation";
import styles from "./internship-list.module.scss";
import InternshipForm from "../../form/InternshipForm";
import { useHttpClient } from "../../../../hooks/common/http-hook";
import { showNotification } from "../../../../redux/notification";
import ConfirmCenterModal from "../../../ui/modals/ConfirmCenterModal";

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
  const [savingOrder, setSavingOrder] = useState(false);
  const persistedInternshipsRef = useRef([]);
  const autoSaveTimeoutRef = useRef(null);

  const setLoadedInternships = (items) => {
    const nextItems = items ?? [];
    setInternships(nextItems);
    persistedInternshipsRef.current = nextItems;
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
      <header className="event-workspace-heading event-dashboard-heading">
        <div>
          <h1>Internships dashboard</h1>
        </div>
        <div className="workspace-heading-actions">
          <button type="button" onClick={() => setEditor({ open: true, internship: null })} className="rn-button-style--2 rn-btn-reverse-green">
            <span>Add internship</span>
          </button>
        </div>
      </header>

      {!loadFailed && (!loaded || loading) && internships.length === 0 && <LoadingSkeleton label="Loading internships" variant="cards" count={4} />}
      {loadFailed && <LoadErrorBanner message="Internships could not be loaded." onRetry={loadInternships} />}
      {actionError && <p role="alert">{actionError}</p>}

      {loaded && !loadFailed && !loading && internships.length === 0 && (
        <div className="empty-state">
          <p>No internships yet. Add the first one above.</p>
        </div>
      )}

      <div className={styles.list}>
        {internships.map((item, index) => (
          <article key={item._id} className={styles.row} draggable={!savingOrder}
            data-dragging={draggedId === item._id || undefined}
            data-drop-target={dragOverId === item._id && draggedId !== item._id || undefined}
            data-inactive={!item.isActive || undefined}
            onDragStart={event => handleDragStart(event, item._id)}
            onDragOver={event => handleDragOver(event, item._id)}
            onDrop={event => handleDrop(event, item._id)} onDragEnd={handleDragEnd}>
            <img className={styles.logo} src={item.logo || FALLBACK_INTERNSHIP_IMAGE} alt="" loading="lazy" />
            <div className={styles.identity}><strong>{item.company}</strong><p>{item.specialty}</p></div>
            <span className={styles.badge} data-local={item.label === "Bulgarian" || undefined}>{item.label}</span>
            <button type="button" className={styles.visibility} aria-pressed={item.isActive}
              aria-label={`Show ${item.company} internship`} disabled={toggling.has(item._id)}
              onClick={() => handleToggleActive(item)}>
              <span className={styles.track} aria-hidden /><span>{item.isActive ? "Active" : "Inactive"}</span>
            </button>
            <div className={styles.order} aria-label={`Reorder ${item.company}`}>
              <FaGripVertical aria-hidden /><span>{index + 1}</span>
              <button type="button" disabled={savingOrder || index === 0}
                aria-label={`Move ${item.company} up`}
                onClick={() => setInternships(items => moveInternship(items, item._id, internships[index - 1]._id))}><FiChevronUp aria-hidden /></button>
              <button type="button" disabled={savingOrder || index === internships.length - 1}
                aria-label={`Move ${item.company} down`}
                onClick={() => setInternships(items => moveInternship(items, item._id, internships[index + 1]._id))}><FiChevronDown aria-hidden /></button>
            </div>
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
