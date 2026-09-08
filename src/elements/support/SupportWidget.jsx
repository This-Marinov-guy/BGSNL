"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconlyClose, IconlyHeadset } from "@/elements/ui/icons/IconlyIcons";
import styles from "./support.module.scss";

const SupportDesk = dynamic(() => import("./SupportDesk"), { ssr: false, loading: () => <p role="status">Opening support…</p> });

export default function SupportWidget() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [openedOnce, setOpenedOnce] = useState(false);
  const [mobile, setMobile] = useState(false);
  const root = useRef(null);
  const panel = useRef(null);
  const launcher = useRef(null);
  const closeButton = useRef(null);
  const titleId = useId();
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    closeButton.current?.focus({ preventScroll: true });
    const keydown = (event) => {
      if (event.defaultPrevented || (!mobile && !panel.current?.contains(document.activeElement))) return;
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key === "Tab" && mobile) {
        const focusable = [...(panel.current?.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]') || [])].filter((element) => element.getClientRects().length > 0);
        const first = focusable[0]; const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", keydown);
    const overflow = document.body.style.overflow;
    const background = mobile ? [...document.body.children].filter((element) => element !== root.current).map((element) => ({ element, inert: element.inert })) : [];
    if (mobile) { document.body.style.overflow = "hidden"; for (const { element } of background) element.inert = true; }
    return () => {
      document.removeEventListener("keydown", keydown);
      if (mobile) { document.body.style.overflow = overflow; for (const { element, inert } of background) element.inert = inert; }
      (previousFocus?.isConnected ? previousFocus : launcher.current)?.focus?.({ preventScroll: true });
    };
  }, [open, mobile, close]);

  if (!mounted) return null;
  return createPortal(<div ref={root} className={styles.widgetRoot} data-html2canvas-ignore="true" data-support-widget-root>
    {openedOnce && <section className={`${styles.widgetPanel} ${open ? styles.isOpen : ""}`} role="dialog" aria-labelledby={titleId} aria-modal={open && mobile ? true : undefined} aria-hidden={!open} inert={!open ? true : undefined} id={panelId} ref={panel} data-private data-hj-suppress data-clarity-mask data-support-widget-dialog>
      <header className={styles.widgetHeader}><div><h2 className="type-subheading" id={titleId}>Website support</h2><small>Report a problem. Follow the conversation.</small></div><button type="button" className={`${styles.iconButton} ${styles.closeButton}`} ref={closeButton} aria-label="Close support" onClick={close}><IconlyClose size="1.5rem" /></button></header>
      <SupportDesk active={open} />
    </section>}
    <button className={`rn-button-style--2 rn-btn-small ${styles.launcher} ${mobile && open ? styles.isLauncherHidden : ""}`} type="button" ref={launcher} onClick={() => { setOpenedOnce(true); setOpen((value) => !value); }} aria-label={open ? "Minimize website support" : "Report a website problem"} aria-controls={openedOnce ? panelId : undefined} aria-expanded={open} aria-hidden={mobile && open} tabIndex={mobile && open ? -1 : undefined}>
      <IconlyHeadset size="1.5rem" /> <span className={styles.launcherLabel}>Help</span>
    </button>
  </div>, document.body);
}
