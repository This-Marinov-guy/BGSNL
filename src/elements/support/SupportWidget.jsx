"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/user";
import { IconlyClose, IconlyHeadset } from "@/elements/ui/icons/IconlyIcons";
import { ANALYTICS_EVENTS } from "@/util/analytics/events.mjs";
import { clarityEvent } from "@/util/functions/helpers";
import styles from "./support.module.scss";
import SupportLoading from "./SupportLoading";
import { supportRequest } from "./support-api";
import { guestReports, supportScope } from "./support-state.mjs";
import { watchSupportLive } from "./support-live.mjs";
import { useSupportUnread } from "./use-support-unread";
import { supportTicketUnread } from "./support-unread.mjs";

const SupportDesk = dynamic(() => import("./SupportDesk"), { ssr: false, loading: () => <SupportLoading inset /> });

export default function SupportWidget() {
  const { session, authInitialized } = useSelector(selectUser);
  const { seen, ready: seenReady } = useSupportUnread(session);
  const ownerScope = supportScope(session);
  const [activity, setActivity] = useState({ scope: "", tickets: [] });
  const hasUnread = seenReady && activity.scope === ownerScope && activity.tickets.some(ticket => supportTicketUnread(ticket, seen));
  const pathname = usePathname();
  const supportPage = pathname === "/user/dashboard/support" || pathname?.startsWith("/user/dashboard/support/");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [openedOnce, setOpenedOnce] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const root = useRef(null);
  const panel = useRef(null);
  const launcher = useRef(null);
  const closeButton = useRef(null);
  const titleId = useId();
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  const toggle = () => {
    if (!open) clarityEvent(ANALYTICS_EVENTS.HELP_PANEL_OPENED);
    setOpenedOnce(true);
    setOpen((value) => !value);
  };

  useEffect(() => {
    if (!authInitialized || supportPage) return undefined;
    const controller = new AbortController();
    async function refresh() {
      try {
        const tickets = session
          ? (await supportRequest("conversations/activity", { signal: controller.signal })).conversations
          : (await Promise.all(guestReports().map(async ({ id, secret }) => {
            try { return (await supportRequest(`conversations/${id}`, { secret, signal: controller.signal })).conversation; }
            catch (error) { if ([401, 403, 404].includes(error.status)) return null; throw error; }
          }))).filter(Boolean);
        if (!controller.signal.aborted) setActivity({ scope: ownerScope, tickets });
      } catch (error) {
        if (!controller.signal.aborted && [401, 403].includes(error.status)) setActivity({ scope: ownerScope, tickets: [] });
      }
    }
    const stop = watchSupportLive({ refresh, subscription: () => {
      if (session) return {};
      const guests = guestReports().map(({ id, secret }) => ({ id, secret }));
      return guests.length ? { guests } : null;
    } });
    return () => { controller.abort(); stop(); };
  }, [session, authInitialized, ownerScope, supportPage]);

  useEffect(() => {
    setMounted(true);
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const hero = document.querySelector(".slider-activation");

    if (!hero) {
      setHeroVisible(false);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.02 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!open || supportPage) return undefined;
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
  }, [open, mobile, close, supportPage]);

  if (!mounted || supportPage) return null;
  const launcherHidden = (mobile && open) || heroVisible;

  return createPortal(<div ref={root} className={styles.widgetRoot} data-html2canvas-ignore="true" data-support-widget-root>
    {openedOnce && <section className={`${styles.widgetPanel} ${open ? styles.isOpen : ""}`} role="dialog" aria-labelledby={titleId} aria-modal={open && mobile ? true : undefined} aria-hidden={!open} inert={!open ? true : undefined} id={panelId} ref={panel} data-private data-hj-suppress data-clarity-mask data-support-widget-dialog>
      <header className={styles.widgetHeader}>
        <h2 className="type-subheading" id={titleId}>Website support</h2>
        <button type="button" className={`${styles.iconButton} ${styles.closeButton}`} ref={closeButton} aria-label="Close support" onClick={close}><IconlyClose size="1.5rem" /></button>
      </header>
      <SupportDesk active={open} listDecoration={<Image className={styles.welcomePortrait} src="/assets/images/vladi/welcome1.png" alt="" width={373} height={669} aria-hidden="true" />} />
    </section>}
    <button className={`rn-button-style--2 rn-btn-small ${styles.launcher} ${launcherHidden ? styles.isLauncherHidden : ""}`} type="button" ref={launcher} onClick={toggle} aria-label={`${open ? "Minimize website support" : "Report a website problem"}${hasUnread ? " — unread ticket updates" : ""}`} aria-controls={openedOnce ? panelId : undefined} aria-expanded={open} aria-hidden={launcherHidden} tabIndex={launcherHidden ? -1 : undefined}>
      {hasUnread && <span className={styles.unreadDot} aria-hidden="true" />}
      <IconlyHeadset size="1.5rem" /> <span className={styles.launcherLabel}>Help</span>
    </button>
  </div>, document.body);
}
