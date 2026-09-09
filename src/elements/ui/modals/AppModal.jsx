"use client";

import PropTypes from "prop-types";
import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { FiX } from "@/elements/ui/icons/IconlyIcons";

const CLOSE_ANIMATION_MS = 180;

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

/**
 * The single modal shell used across BGSNL.
 *
 * Feature components provide only their title, content and actions; this
 * component owns the overlay, focus/escape handling and shared presentation.
 */
const AppModal = ({
  open,
  onClose,
  title,
  actions,
  children,
  closable = true,
  dismissableMask = false,
  modal = true,
  blockScroll = true,
  className,
  contentClassName,
  headerClassName,
  footerClassName,
  maskClassName,
  style,
  contentStyle,
  headerStyle,
  ariaLabel,
  suspended = false,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isPresent, setIsPresent] = useState(open);
  const titleId = useId();
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setIsPresent(true);
      return undefined;
    }

    const timeout = window.setTimeout(
      () => setIsPresent(false),
      CLOSE_ANIMATION_MS
    );
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open || suspended) return undefined;

    const previouslyFocused = document.activeElement;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && closable) onClose?.();

      if (event.key === "Tab") {
        const focusable = Array.from(
          dialogRef.current?.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          ) ?? []
        );

        if (focusable.length === 0) {
          event.preventDefault();
          dialogRef.current?.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    (closeButtonRef.current ?? dialogRef.current)?.focus({
      preventScroll: true,
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [closable, onClose, open, suspended]);

  useEffect(() => {
    if (!open || !modal || !blockScroll) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [blockScroll, modal, open]);

  if (!isMounted || !isPresent) return null;

  const handleMaskClick = (event) => {
    if (dismissableMask && event.target === event.currentTarget) onClose?.();
  };
  const TitleElement = typeof title === "string" ? "h2" : "div";

  return createPortal(
    <div
      className={joinClasses(
        "bgsnl-modal-mask",
        "p-overlay-mask",
        maskClassName,
        !modal && "bgsnl-modal-mask--modeless",
        suspended && "bgsnl-modal-mask--suspended",
        open ? "is-open" : "is-closing"
      )}
      onMouseDown={handleMaskClick}
    >
      <section
        aria-label={title == null ? ariaLabel ?? "Dialog" : undefined}
        aria-labelledby={title != null ? titleId : undefined}
        aria-hidden={suspended ? "true" : undefined}
        aria-modal={modal && !suspended ? "true" : undefined}
        className={joinClasses("bgsnl-modal", "p-dialog", className)}
        inert={suspended ? true : undefined}
        ref={dialogRef}
        role="dialog"
        style={style}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {(title != null || closable) && (
          <header
            className={joinClasses(
              "bgsnl-modal__header",
              "p-dialog-header",
              headerClassName
            )}
            style={headerStyle}
          >
            {title != null && (
              <TitleElement
                className="bgsnl-modal__title p-dialog-title"
                id={titleId}
              >
                {title}
              </TitleElement>
            )}
            {closable && (
              <button
                aria-label="Close dialog"
                className="bgsnl-modal__close p-dialog-header-close"
                onClick={onClose}
                ref={closeButtonRef}
                type="button"
              >
                <FiX aria-hidden size={16} />
              </button>
            )}
          </header>
        )}

        <div
          className={joinClasses(
            "bgsnl-modal__body",
            "p-dialog-content",
            contentClassName
          )}
          style={contentStyle}
        >
          {children}
        </div>

        {actions != null && (
          <footer
            className={joinClasses(
              "bgsnl-modal__footer",
              "p-dialog-footer",
              footerClassName
            )}
          >
            {actions}
          </footer>
        )}
      </section>
    </div>,
    document.body
  );
};

AppModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.node,
  actions: PropTypes.node,
  children: PropTypes.node,
  closable: PropTypes.bool,
  dismissableMask: PropTypes.bool,
  modal: PropTypes.bool,
  blockScroll: PropTypes.bool,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  maskClassName: PropTypes.string,
  style: PropTypes.object,
  contentStyle: PropTypes.object,
  headerStyle: PropTypes.object,
  ariaLabel: PropTypes.string,
  suspended: PropTypes.bool,
};

export default AppModal;
