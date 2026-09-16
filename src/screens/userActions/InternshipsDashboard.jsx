"use client";

import React from "react";
import Link from "next/link";
import styles from "./administration.module.scss";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiArrowLeft, FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import HeaderTwo from "../../component/header/HeaderTwo";
import InternshipList from "../../elements/actions/dashboard/internships/InternshipList";

const InternshipsDashboard = () => {
  return (
    <React.Fragment>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <main className="container user-workspace-page event-admin-page">
        <nav className={styles.views} aria-label="Internship administration">
          <Link className={styles.backLink} href="/user/dashboard" aria-label="Back to administration">
            <FiArrowLeft size={24} aria-hidden />
            <span>Administration</span>
          </Link>
        </nav>
        <InternshipList />
      </main>

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>
    </React.Fragment>
  );
};

export default InternshipsDashboard;
