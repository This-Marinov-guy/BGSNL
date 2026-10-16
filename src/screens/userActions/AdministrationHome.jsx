"use client";
import Link from "next/link";
import { useSelector } from "react-redux";
import DashboardNavigation from "@/screens/userActions/DashboardNavigation";
import workspace from "@/screens/userActions/dashboard-workspace.module.scss";
import HeaderTwo from "@/component/header/HeaderTwo";
import { selectUser } from "@/redux/user";
import { IconlyArrowUpRight, IconlyYouTube } from "@/elements/ui/icons/IconlyIcons";
import AccessRequestBanner from "@/elements/backoffice/AccessRequestBanner";
import { administrationAreas, canAdminister, TREASURY_URL, TUTORIAL_PLAYLIST_URL } from "@/util/administration.mjs";
import styles from "./administration.module.scss";

export default function AdministrationHome() {
  const user = useSelector(selectUser);
  const available = administrationAreas.filter((area) => canAdminister(area, user.roles));
  const management = available.filter((area) => area.section !== "metrics");
  const hasMetrics = available.some((area) => area.section === "metrics");
  const cards = [
    ...management.map((area) => ({ id: area.id, title: area.title, description: area.description,
      href: `/user/dashboard/${area.id}`, action: `Open ${area.title.toLowerCase()}` })),
    ...(hasMetrics ? [{ id: "metrics", title: "Metrics", description: "Explore event and member metrics for your regions.",
      href: "/user/dashboard/metrics/events", action: "Open metrics" }] : []),
    ...(available.length ? [{ id: "treasury", title: "Treasury", description: "View the Society’s financial dashboard.",
      href: TREASURY_URL, action: "Open Treasury", external: true }] : []),
  ];
  const cardContent = (card) => <>
    <h2>{card.title}</h2><p>{card.description}</p>
    <span>{card.action} <span aria-hidden="true"><IconlyArrowUpRight /></span></span>
  </>;
  return <><HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className={`container user-workspace-page ${styles.page} ${workspace.page}`}>
      <DashboardNavigation />
      <h1 className="visually-hidden">Overview</h1>
      <div className={styles.bannerGrid}>
        <AccessRequestBanner />
        <section className={`${styles.banner} ${styles.tutorialBanner}`} aria-labelledby="dashboard-tutorials-title">
          <div className={styles.tutorialHeading}>
            <IconlyYouTube aria-hidden="true" size="2rem" />
            <div>
              <h2 id="dashboard-tutorials-title">Dashboard tutorials</h2>
              <p>Watch the video guides to get familiar with the dashboard.</p>
            </div>
          </div>
          <a className={styles.bannerAction} href={TUTORIAL_PLAYLIST_URL} target="_blank" rel="noopener noreferrer"
            aria-label="Watch dashboard tutorials on YouTube (opens in a new tab)">
            Watch tutorials <IconlyArrowUpRight size="1.25rem" aria-hidden="true" />
          </a>
        </section>
      </div>
      {cards.length > 0 && <section className={styles.areaSection} aria-label="Available dashboard areas">
        <div className={styles.grid}>{cards.map((card) => card.external
          ? <a className={styles.card} href={card.href} key={card.id} target="_blank" rel="noopener noreferrer" aria-label={`${card.title} (opens in a new tab)`}>{cardContent(card)}</a>
          : <Link className={styles.card} href={card.href} key={card.id}>{cardContent(card)}</Link>)}</div>
      </section>}
    </main>
  </>;
}
