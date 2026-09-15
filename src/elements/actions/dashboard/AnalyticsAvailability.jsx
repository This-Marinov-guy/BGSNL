"use client";

import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/user";
import { ADMIN, SUPER_ADMIN } from "@/util/defines/common";
import { checkAuthorization } from "@/util/functions/authorization";
import { ANALYTICS_COMING_SOON } from "@/util/configs/feature-flags";
import styles from "./analytics-availability.module.scss";

export default function AnalyticsAvailability({ title, children }) {
  const user = useSelector(selectUser);
  const canPreview = checkAuthorization(user.session, [ADMIN, SUPER_ADMIN]);

  if (!ANALYTICS_COMING_SOON || canPreview) return children;

  return (
    <section className={styles.panel} aria-label={title}>
      <h2>Coming soon</h2>
      <p>{title} will be available here soon.</p>
    </section>
  );
}

AnalyticsAvailability.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
