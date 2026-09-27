"use client";
import Link from "next/link";
import { useSelector } from "react-redux";
import HeaderTwo from "@/component/header/HeaderTwo";
import { selectUser } from "@/redux/user";
import AccessRequestBanner from "@/elements/backoffice/AccessRequestBanner";
import { administrationAreas, canAdminister } from "@/util/administration.mjs";
import styles from "./administration.module.scss";

export default function AdministrationHome() {
  const user = useSelector(selectUser);
  const available = administrationAreas.filter((area) => canAdminister(area, user.roles));
  return <><HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
    <main className={`container user-workspace-page ${styles.page}`}>
      <header className={styles.heading}><h1>Administration</h1>
        <p>Choose an area to manage. Your existing permissions and regional access apply.</p></header>
      {available.length ? <div className={styles.grid}>{available.map((area) => <Link className={styles.card} href={`/user/dashboard/${area.id}`} key={area.id}>
        <h2>{area.title}</h2><p>{area.description}</p><span>Open {area.title.toLowerCase()} <span aria-hidden>↗</span></span>
      </Link>)}</div> : <p className={styles.empty}>You don’t have administration access yet. Request the areas you need below.</p>}
      <AccessRequestBanner />
    </main>
  </>;
}
