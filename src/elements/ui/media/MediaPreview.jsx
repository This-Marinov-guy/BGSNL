"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import {
  FiDownload,
  FiRotateCw,
  FiShare2,
  FiX,
  IconlyMinus,
  IconlyPlus,
} from "@/elements/ui/icons/IconlyIcons";
import { showNotification } from "@/redux/notification";

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.25;

const clampZoom = (value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

/**
 * Fullscreen image viewer with zoom, rotate, download and share.
 *
 * Deliberately not folded into the compat <Image preview> shim: that shim
 * mirrors PrimeReact's API and is used by seven other call sites which should
 * keep their plain lightbox.
 */
const MediaPreview = ({ src, alt = "", fileName = "image", open, onClose }) => {
  const dispatch = useDispatch();
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);
  const dragState = useRef(null);
  const dialogRef = useRef(null);
  // Focus has to return to whatever opened the viewer once it closes.
  const lastFocused = useRef(null);

  const reset = useCallback(() => {
    setZoom(MIN_ZOOM);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }, []);

  const zoomBy = useCallback((delta) => {
    setZoom((current) => {
      const next = clampZoom(current + delta);
      // Panning only means anything while zoomed in; recentre on the way out.
      if (next === MIN_ZOOM) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    reset();
    lastFocused.current = document.activeElement;
    dialogRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
      lastFocused.current?.focus?.();
    };
  }, [open, reset]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "+":
        case "=":
          zoomBy(ZOOM_STEP);
          break;
        case "-":
          zoomBy(-ZOOM_STEP);
          break;
        case "r":
        case "R":
          setRotation((value) => value + 90);
          break;
        case "0":
          reset();
          break;
        default:
          return;
      }
      event.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, zoomBy, reset]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      /*
       * A plain <a download> is ignored for cross-origin URLs — the browser
       * navigates instead of saving — and ticket images are served off another
       * origin. Fetching to a blob keeps the save behaviour; if CORS blocks the
       * fetch, opening the image in a new tab at least lets the user save it.
       */
      const response = await fetch(src, { mode: "cors" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(src, "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: alt || "Ticket", url: src });
        return;
      }
      await navigator.clipboard.writeText(src);
      dispatch(
        showNotification({
          severity: "success",
          detail: "Link copied to your clipboard.",
        })
      );
    } catch (error) {
      // Dismissing the native share sheet rejects; that is not a failure.
      if (error?.name === "AbortError") return;
      dispatch(
        showNotification({
          severity: "error",
          detail: "Could not share this image. Please try again.",
        })
      );
    }
  };

  const startDrag = (event) => {
    if (zoom === MIN_ZOOM) return;
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX - offset.x,
      startY: event.clientY - offset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onDrag = (event) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) {
      return;
    }
    setOffset({
      x: event.clientX - dragState.current.startX,
      y: event.clientY - dragState.current.startY,
    });
  };

  const endDrag = (event) => {
    if (!dragState.current) return;
    event.currentTarget.releasePointerCapture?.(dragState.current.pointerId);
    dragState.current = null;
  };

  if (!open) return null;

  const isZoomed = zoom > MIN_ZOOM;

  return (
    <div
      aria-label={alt || "Image preview"}
      aria-modal="true"
      className="media-preview"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={dialogRef}
      role="dialog"
      tabIndex={-1}
    >
      <div className="media-preview__toolbar">
        <button
          aria-label="Zoom out"
          className="media-preview__btn"
          disabled={zoom <= MIN_ZOOM}
          onClick={() => zoomBy(-ZOOM_STEP)}
          type="button"
        >
          <IconlyMinus size="1.15rem" />
        </button>

        <button
          className="media-preview__zoom-label"
          onClick={reset}
          title="Reset view"
          type="button"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          aria-label="Zoom in"
          className="media-preview__btn"
          disabled={zoom >= MAX_ZOOM}
          onClick={() => zoomBy(ZOOM_STEP)}
          type="button"
        >
          <IconlyPlus size="1.15rem" />
        </button>

        <span aria-hidden="true" className="media-preview__divider" />

        <button
          aria-label="Rotate"
          className="media-preview__btn"
          onClick={() => setRotation((value) => value + 90)}
          type="button"
        >
          <FiRotateCw size="1.15rem" />
        </button>

        <button
          aria-label="Download"
          className="media-preview__btn"
          disabled={isDownloading}
          onClick={handleDownload}
          type="button"
        >
          <FiDownload size="1.15rem" />
        </button>

        <button
          aria-label="Share"
          className="media-preview__btn"
          onClick={handleShare}
          type="button"
        >
          <FiShare2 size="1.15rem" />
        </button>

        <span aria-hidden="true" className="media-preview__divider" />

        <button
          aria-label="Close preview"
          className="media-preview__btn"
          onClick={onClose}
          type="button"
        >
          <FiX size="1.15rem" />
        </button>
      </div>

      <div className="media-preview__stage">
        <img
          alt={alt}
          className="media-preview__image"
          data-zoomed={isZoomed ? "true" : "false"}
          draggable="false"
          onPointerCancel={endDrag}
          onPointerDown={startDrag}
          onPointerMove={onDrag}
          onPointerUp={endDrag}
          src={src}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
          }}
        />
      </div>

      <p className="media-preview__hint">
        Scroll-free zoom with the toolbar · drag to pan · Esc to close
      </p>
    </div>
  );
};

MediaPreview.propTypes = {
  alt: PropTypes.string,
  fileName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  src: PropTypes.string.isRequired,
};

export default MediaPreview;
