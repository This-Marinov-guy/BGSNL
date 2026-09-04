"use client";

import React from "react";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import HeaderTwo from "../../component/header/HeaderTwo";
import MembersList from "../../elements/actions/dashboard/members/MembersList";

const MembersDashboard = () => {
  return (
    <React.Fragment>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <main className="container user-workspace-page mt--200">
        <MembersList />
      </main>

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>
    </React.Fragment>
  );
};

export default MembersDashboard;
