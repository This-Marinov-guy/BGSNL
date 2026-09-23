"use client";

import PropTypes from "prop-types";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { FiX, FiMaximize2, FiMinimize2 } from "@/elements/ui/icons/IconlyIcons";

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
  maximizable = true,
  maximized,
  onMaximize,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isPresent, setIsPresent] = useState(open);
  const [fullscreen, setFullscreen] = useState(false);
  const isFullscreen = maximizable && (maximized ?? fullscreen);
  const titleId = useId();
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const fullscreenAnimationRef = useRef(null);
  const fullscreenOriginRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setIsPresent(true);
      return undefined;
    }

    setFullscreen(false);

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
      if (event.key === "Escape" && closable) onCloseRef.current?.();

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
  }, [closable, open, suspended]);

  useEffect(() => {
    if (!open || !modal || !blockScroll) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [blockScroll, modal, open]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const origin = fullscreenOriginRef.current;
    fullscreenOriginRef.current = null;

    if (!dialog || !origin) return undefined;

    fullscreenAnimationRef.current?.cancel();

    if (
      typeof dialog.animate !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const targetRect = dialog.getBoundingClientRect();
    if (targetRect.width === 0 || targetRect.height === 0) return undefined;

    const targetStyle = window.getComputedStyle(dialog);
    const translateX = origin.rect.left - targetRect.left;
    const translateY = origin.rect.top - targetRect.top;
    const scaleX = origin.rect.width / targetRect.width;
    const scaleY = origin.rect.height / targetRect.height;

    dialog.style.willChange = "transform, border-radius, box-shadow";
    const animation = dialog.animate(
      [
        {
          borderRadius: origin.borderRadius,
          boxShadow: origin.boxShadow,
          transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
          transformOrigin: "top left",
        },
        {
          borderRadius: targetStyle.borderRadius,
          boxShadow: targetStyle.boxShadow,
          transform: "translate(0, 0) scale(1, 1)",
          transformOrigin: "top left",
        },
      ],
      {
        duration: isFullscreen ? 340 : 260,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      }
    );

    fullscreenAnimationRef.current = animation;
    const clearAnimationState = () => {
      if (fullscreenAnimationRef.current === animation) {
        fullscreenAnimationRef.current = null;
        dialog.style.willChange = "";
      }
    };

    animation.addEventListener("finish", clearAnimationState, { once: true });
    animation.addEventListener("cancel", clearAnimationState, { once: true });

    return () => animation.cancel();
  }, [isFullscreen]);

  if (!isMounted || !isPresent) return null;

  const handleMaskClick = (event) => {
    if (dismissableMask && event.target === event.currentTarget) onClose?.();
  };

  const handleFullscreenToggle = (event) => {
    const dialog = dialogRef.current;
    if (dialog) {
      const currentStyle = window.getComputedStyle(dialog);
      fullscreenOriginRef.current = {
        borderRadius: currentStyle.borderRadius,
        boxShadow: currentStyle.boxShadow,
        rect: dialog.getBoundingClientRect(),
      };
    }

    const next = !isFullscreen;
    if (maximized === undefined) setFullscreen(next);
    onMaximize?.({ originalEvent: event, maximized: next });
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
        isFullscreen && "bgsnl-modal-mask--fullscreen",
        open ? "is-open" : "is-closing"
      )}
      onMouseDown={handleMaskClick}
    >
      <section
        aria-label={title == null ? ariaLabel ?? "Dialog" : undefined}
        aria-labelledby={title != null ? titleId : undefined}
        aria-hidden={suspended ? "true" : undefined}
        aria-modal={modal && !suspended ? "true" : undefined}
        className={joinClasses(
          "bgsnl-modal",
          "p-dialog",
          className,
          isFullscreen && "bgsnl-modal--fullscreen"
        )}
        inert={suspended ? true : undefined}
        ref={dialogRef}
        role="dialog"
        style={
          isFullscreen
            ? {
                ...style,
                borderRadius: 0,
                height: "100dvh",
                margin: 0,
                maxHeight: "100dvh",
                maxWidth: "none",
                minHeight: 0,
                width: "100%",
              }
            : style
        }
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {(title != null || closable || maximizable) && (
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
            <div className="bgsnl-modal__controls">
              {maximizable && (
                <button
                  aria-label={
                    isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                  }
                  aria-pressed={isFullscreen}
                  className="bgsnl-modal__maximize"
                  onClick={handleFullscreenToggle}
                  title={
                    isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                  }
                  type="button"
                >
                  {isFullscreen ? (
                    <FiMinimize2 aria-hidden size={16} />
                  ) : (
                    <FiMaximize2 aria-hidden size={16} />
                  )}
                </button>
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
            </div>
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
  maximizable: PropTypes.bool,
  maximized: PropTypes.bool,
  onMaximize: PropTypes.func,
};

export default AppModal;
