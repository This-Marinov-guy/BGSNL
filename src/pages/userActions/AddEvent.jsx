import React from 'react'
import HeaderTwo from "../../component/header/HeaderTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import EventForm from '../../elements/actions/EventForm';

const AddEvent = () => {
  return (
    <React.Fragment>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <div className="container mt--200">
        <h3 className="center_text">Add an Event</h3>
      </div>
      <EventForm />

      {/* End Footer Style  */}
      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </React.Fragment>
  )
}

export default AddEvent