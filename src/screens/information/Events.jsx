"use client";

import React from "react";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import { useParams } from "@/util/navigation";
import PageHelmet from "../../component/common/Helmet";
import Footer from "../../component/footer/Footer";
import Header from "../../component/header/Header";
import Breadcrumb from "../../elements/common/Breadcrumb";
import {
  FutureEventsContent,
  FutureOtherEventsContent,
} from "./FutureEvents";

const Events = () => {
  const { region } = useParams();

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Events" />

      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <Breadcrumb
        title="Events"
        description="Find cultural, social, and professional events hosted by Bulgarian communities across the Netherlands."
      />

      {/* Start Future Events Area */}
      <FutureEventsContent />
      <FutureOtherEventsContent />
      {/* End Future Events Area */}

      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <Footer />
    </React.Fragment>
  );
};
export default Events;
