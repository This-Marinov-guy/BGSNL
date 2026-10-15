"use client";

import React from "react";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import HeaderTwo from "../../component/header/HeaderTwo";
import EventForm from "../../elements/actions/form/EventForm";

const AddEvent = () => {
  return (
    <React.Fragment>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <main className="container event-admin-page event-form-page">
        <EventForm />
      </main>

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>
    </React.Fragment>
  );
}

export default AddEvent;
