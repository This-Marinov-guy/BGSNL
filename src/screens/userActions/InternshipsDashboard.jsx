"use client";

import React, { Suspense } from "react";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import DashboardNavigation from "@/screens/userActions/DashboardNavigation";
import workspace from "@/screens/userActions/dashboard-workspace.module.scss";
import HeaderTwo from "../../component/header/HeaderTwo";
import InternshipList from "../../elements/actions/dashboard/internships/InternshipList";
import { LoadingSkeleton } from "@/elements/ui/loading/LoadState";

const InternshipsDashboard = () => {
  return (
    <React.Fragment>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <main className={`container user-workspace-page event-admin-page ${workspace.page}`}>
        <DashboardNavigation />
        <Suspense fallback={<LoadingSkeleton label="Loading internships" variant="cards" count={4} />}><InternshipList /></Suspense>
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
