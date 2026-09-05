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
        <header className="event-workspace-heading">
          <div>
            <span className="event-workspace-heading__eyebrow">Events</span>
            <h1>Create an event</h1>
          </div>
          <p>Build the event in three focused steps. Progress is saved as a draft as you continue.</p>
        </header>
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
