"use client";

import PropTypes from "prop-types";
import HeaderTwo from "@/component/header/HeaderTwo";
import { getRegionBadgeStyle } from "@/util/defines/REGION_BADGES";
import styles from "./check-ticket.module.scss";

export function ScannerEventBadge({ event }) {
  if (!event) return null;
  const name = String(event.title || event.name || "Untitled event").trim().replace(/\s+/g, " ");
  return <span className={styles.scannerEventBadge} style={getRegionBadgeStyle(event.region)} title={name}>{name}</span>;
}

export default function ScannerHeader({ event }) {
  return <HeaderTwo logoRegion={event?.region} centerContent={<div className={styles.mobileHeaderIdentity}>
    <h1 className={styles.mobileHeaderTitle}>Ticket scanner</h1>
    <ScannerEventBadge event={event} />
  </div>} />;
}

const eventPropType = PropTypes.shape({ title: PropTypes.string, name: PropTypes.string, region: PropTypes.string });
ScannerEventBadge.propTypes = { event: eventPropType };
ScannerHeader.propTypes = { event: eventPropType };
