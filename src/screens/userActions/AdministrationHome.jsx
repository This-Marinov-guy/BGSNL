"use client";
import Link from "next/link";
import { useSelector } from "react-redux";
import DashboardNavigation from "@/screens/userActions/DashboardNavigation";
import workspace from "@/screens/userActions/dashboard-workspace.module.scss";
import HeaderTwo from "@/component/header/HeaderTwo";
import { selectUser } from "@/redux/user";
import { IconlyArrowUpRight } from "@/elements/ui/icons/IconlyIcons";
import AccessRequestBanner from "@/elements/backoffice/AccessRequestBanner";
import { administrationAreas, canAdminister } from "@/util/administration.mjs";
import styles from "./administration.module.scss";

export default function AdministrationHome() {
  const user = useSelector(selectUser);
  const available = administrationAreas.filter((area) => canAdminister(area, user.roles));
  return <><HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className={`container user-workspace-page ${styles.page} ${workspace.page}`}>
      <DashboardNavigation />
      <header className={`event-workspace-heading ${styles.heading}`}><div><h1>Administration</h1></div></header>
      {available.length ? <div className={styles.grid}>{available.map((area) => <Link className={styles.card} href={`/user/dashboard/${area.id}`} key={area.id}>
        <h2>{area.title}</h2><p>{area.description}</p><span>Open {area.title.toLowerCase()} <span aria-hidden="true"><IconlyArrowUpRight /></span></span>
      </Link>)}</div> : <p className={styles.empty}>You don’t have administration access yet. Request the areas you need below.</p>}
      <AccessRequestBanner />
    </main>
  </>;
}
