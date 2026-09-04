"use client";

import React from "react";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import PageHelmet from "../../component/common/Helmet";
import FooterTwo from "../../component/footer/FooterTwo";
import Header from "../../component/header/Header";
import Devs from "../../component/HomeLayout/homeOne/Devs";
import Breadcrumb from "../../elements/common/Breadcrumb";

const Developers = React.memo(() => {
  return (
    <React.Fragment>
      <PageHelmet pageTitle="Developers" />
      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <Breadcrumb
        title="Developers"
        description="Meet the people building and maintaining the digital home of Bulgarian Society Netherlands."
      />

      {/* Start About Area  */}
      <Devs />
      {/* End About Area  */}

      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <FooterTwo />
    </React.Fragment>
  );
});

export default Developers;
