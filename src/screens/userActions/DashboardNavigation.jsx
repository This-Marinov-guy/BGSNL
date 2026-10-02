"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/user";
import { administrationAreas, canAdminister } from "@/util/administration.mjs";
import { FiArrowLeft, FiChevronDown } from "@/elements/ui/icons/IconlyIcons";
import styles from "./dashboard-workspace.module.scss";

export default function DashboardNavigation() {
  const pathname = usePathname();
  const user = useSelector(selectUser);
  const sections = [
    { href: "/user/dashboard", title: "Overview" },
    ...administrationAreas.filter(area => canAdminister(area, user.roles)).map(area => ({
      href: `/user/dashboard/${area.id}`, title: area.title,
    })),
  ];
  const current = sections.find(section => section.href === pathname);
  const overview = pathname === "/user/dashboard";
  const links = sections.map(section => <Link key={section.href} href={section.href}
    aria-current={section.href === pathname ? "page" : undefined}>{section.title}</Link>);

  return <nav className={styles.navigation} aria-label="Dashboard sections">
    <Link className={styles.back} href={overview ? "/user" : "/user/dashboard"}
      aria-label={overview ? "Back to your account" : "Back to dashboard overview"}>
      <FiArrowLeft aria-hidden />
    </Link>
    <div className={styles.desktopSections}>{links}</div>
    <details className={styles.mobileSections} key={pathname}>
      <summary>{current?.title || "Dashboard"}<FiChevronDown aria-hidden /></summary>
      <div className={styles.sectionOptions}>{links}</div>
    </details>
  </nav>;
}
