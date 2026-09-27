"use client";

import { useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { Dialog } from "@/compat/primereact";
import RegionOptionsUnstyled from "./buttons/RegionOptionsUnstyled";
import { showModal } from "@/redux/modal";
import { GOOGLE_CALENDAR_MODAL } from "@/util/defines/common";
import { REGION_INSTAGRAM } from "@/util/defines/REGIONS_DESIGN";
import styles from "./UpcomingEventsEmpty.module.scss";

export default function UpcomingEventsEmpty() {
  const dispatch = useDispatch();
  const [socialsOpen, setSocialsOpen] = useState(false);

  return <>
    <section className={styles.panel} aria-label="No upcoming events">
      <div className={styles.copy}>
        <h2>No upcoming events for now!</h2>
        <p>Keep yourself informed by following our socials or subscribing to our calendar.</p>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={() => setSocialsOpen(true)} aria-haspopup="dialog">
          <span className={styles.icon}><Image src="/assets/images/svg/3d/instagram.png" width={56} height={56} alt="" /></span>
        </button>
        <button type="button" onClick={() => dispatch(showModal(GOOGLE_CALENDAR_MODAL))} aria-haspopup="dialog">
          <span className={styles.icon}><Image src="/assets/images/svg/3d/calendar-3d.png" width={56} height={56} alt="" /></span>
        </button>
      </div>
    </section>
    <Dialog header="Follow our Instagram channels" visible={socialsOpen} onHide={() => setSocialsOpen(false)}
      style={{ width: "min(48rem, 94vw)" }} dismissableMask>
      <RegionOptionsUnstyled links={REGION_INSTAGRAM} withMain />
    </Dialog>
  </>;
}
