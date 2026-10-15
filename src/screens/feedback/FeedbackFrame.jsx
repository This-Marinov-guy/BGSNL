"use client";

import PropTypes from "prop-types";
import HeaderTwo from "@/component/header/HeaderTwo";
import Footer from "@/component/footer/Footer";
import DonationModal from "@/elements/ui/modals/DonationModal";
import styles from "./event-feedback.module.scss";

export default function FeedbackFrame({ children }) {
  return <div className={styles.page}>
    <HeaderTwo anonymous />
    <main className={styles.main}>{children}</main>
    <Footer />
    <DonationModal />
  </div>;
}

FeedbackFrame.propTypes = { children: PropTypes.node.isRequired };
