"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/user";
import { administrationAreas, canAdminister, TREASURY_URL } from "@/util/administration.mjs";
import { FiArrowLeft, FiChevronDown, IconlyArrowUpRight } from "@/elements/ui/icons/IconlyIcons";
import { useSupportUnreadMessageCount } from "@/elements/support/SupportTicketAttentionProvider";
import styles from "./dashboard-workspace.module.scss";

export default function DashboardNavigation() {
  const pathname = usePathname();
  const user = useSelector(selectUser);
  const unreadCount = useSupportUnreadMessageCount();
  const unreadLabel = `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`;
  const available = administrationAreas.filter(area => canAdminister(area, user.roles));
  const management = available.filter(area => area.section !== "metrics")
    .map(area => ({ href: `/user/dashboard/${area.id}`, title: area.title }));
  const metrics = available.some(area => area.section === "metrics")
    ? { href: "/user/dashboard/metrics/events", title: "Metrics" } : null;
  const sections = [{ href: "/user/dashboard", title: "Overview" }, ...management, ...(metrics ? [metrics] : []),
    ...(available.length ? [{ href: TREASURY_URL, title: "Treasury", external: true }] : [])];
  const isCurrent = section => section.href === pathname ||
    (section === metrics && pathname.startsWith("/user/dashboard/metrics/"));
  const current = sections.find(isCurrent);
  const overview = pathname === "/user/dashboard";
  const link = section => {
    const showCount = section.href === "/user/dashboard/support" && unreadCount > 0;
    if (section.external) return <a className={styles.externalLink} key={section.href} href={section.href}
      target="_blank" rel="noopener noreferrer" aria-label={`${section.title} (opens in a new tab)`}>
      {section.title}<IconlyArrowUpRight size="1rem" aria-hidden="true" />
    </a>;
    return <Link key={section.href} href={section.href}
      aria-current={isCurrent(section) ? "page" : undefined}
      aria-label={showCount ? `Support tickets, ${unreadLabel}` : undefined}>
      {section.title}{showCount && <span className={styles.unreadCount} aria-hidden="true">{unreadCount > 99 ? "99+" : unreadCount}</span>}
    </Link>;
  };

  return <nav className={styles.navigation} aria-label="Dashboard sections">
    <Link className={styles.back} href={overview ? "/user" : "/user/dashboard"}
      aria-label={overview ? "Back to your account" : "Back to dashboard overview"}>
      <FiArrowLeft aria-hidden />
    </Link>
    <div className={styles.desktopSections}>
      {sections.map(link)}
    </div>
    <details className={styles.mobileSections} key={pathname}>
      <summary aria-label={current?.href === "/user/dashboard/support" && unreadCount > 0 ? `Support tickets, ${unreadLabel}` : undefined}>
        <span>{current?.title || "Dashboard"}{current?.href === "/user/dashboard/support" && unreadCount > 0 &&
          <span className={styles.unreadCount} aria-hidden="true">{unreadCount > 99 ? "99+" : unreadCount}</span>}</span><FiChevronDown aria-hidden />
      </summary>
      <div className={styles.sectionOptions}>
        {sections.map(link)}
      </div>
    </details>
  </nav>;
}
