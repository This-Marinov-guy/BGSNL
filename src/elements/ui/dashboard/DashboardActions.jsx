"use client";

import { useId, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Overlay from "react-bootstrap/Overlay";
import PropTypes from "prop-types";
import { FiPhone, IconlyChat, IconlyCopy, IconlyMessage } from "@/elements/ui/icons/IconlyIcons";
import { showNotification } from "@/redux/notification";
import styles from "./dashboard-actions.module.scss";

export function CopyableId({ value, label = "ID" }) {
  const dispatch = useDispatch();
  if (!value) return <span>None</span>;

  const copy = async (event) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(String(value));
      dispatch(showNotification({ severity: "info", detail: `${label} copied to clipboard.` }));
    } catch {
      dispatch(showNotification({ severity: "error", detail: `Could not copy ${label.toLowerCase()}. Please select and copy it manually.` }));
    }
  };

  return <span className={styles.copyable}>
    <span>{value}</span>
    <button type="button" className={styles.copyButton} onClick={copy} aria-label={`Copy ${label.toLowerCase()}`} title={`Copy ${label.toLowerCase()}`}>
      <IconlyCopy size={18} />
    </button>
  </span>;
}
CopyableId.propTypes = { value: PropTypes.string, label: PropTypes.string };

export function PhoneActions({ phone }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  const firstLink = useRef(null);
  const menuId = useId();
  const formatted = String(phone || "").trim();
  const number = formatted.replace(/[^+\d]/g, "").replace(/^00/, "+");
  const digits = number.replace(/\D/g, "");
  if (!digits) return <span>{formatted || "Not provided"}</span>;

  const close = () => {
    if (firstLink.current?.parentElement?.contains(document.activeElement)) trigger.current?.focus();
    setOpen(false);
  };

  const menuKeyDown = (event) => {
    event.stopPropagation();
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    const links = [...event.currentTarget.querySelectorAll('[role="menuitem"]')];
    const index = links.indexOf(document.activeElement);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
      links[next]?.focus();
    }
  };

  return <>
    <button type="button" ref={trigger} className={styles.phoneButton}
      aria-label={`Contact ${formatted}`} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined}
      onClick={(event) => { event.stopPropagation(); setOpen(current => !current); }}
      onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); event.stopPropagation(); setOpen(true); } }}>
      <span>{formatted}</span><IconlyChat size={18} />
    </button>
    <Overlay target={trigger.current} show={open} placement="bottom-start" flip rootClose onHide={close} offset={[0, 8]}
      onEntered={() => firstLink.current?.focus()}>
      {({ ref, style, className }) => <div ref={ref} style={style} className={`${styles.phoneMenu} ${className || ""}`}
        id={menuId} role="menu" aria-label={`Contact ${formatted}`} onClick={event => event.stopPropagation()} onKeyDown={menuKeyDown}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== trigger.current) setOpen(false); }}>
        <a ref={firstLink} role="menuitem" href={`tel:${number}`} onClick={close}><FiPhone size={18} />Call</a>
        <a role="menuitem" href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" onClick={close}><IconlyMessage size={18} />WhatsApp</a>
      </div>}
    </Overlay>
  </>;
}
PhoneActions.propTypes = { phone: PropTypes.string };
