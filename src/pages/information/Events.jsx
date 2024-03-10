import React from "react";
import PageHelmet from "../../component/common/Helmet";
import Breadcrumb from "../../elements/common/Breadcrumb";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import { FutureEventsContent } from "./FutureEvents";
import { FutureOtherEventsContent } from "./FutureEvents";
import Header from "../../component/header/Header";
import Footer from "../../component/footer/Footer";
import { PastEventsContent, PastEventsListed } from "./PastEvents";
import { useParams } from "react-router-dom";
import { PAST_EVENTS } from "../../util/PAST_EVENTS";

const Events = () => {

  const {region} = useParams();

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Events" />

      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      {/* Start Breadcrump Area */}
      <Breadcrumb title={"Events"} />
      {/* End Breadcrump Area */}

      {/* Start Future Events Area */}
      <FutureEventsContent/>
      <FutureOtherEventsContent
       
      />
      {/* End Future Events Area */}

      {/* Start Past Events Area */}
      {PAST_EVENTS[region].length <= 3 ? <PastEventsListed/> :  <PastEventsContent />}
      {/* End Past Events Area */}

      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <Footer />
    </React.Fragment>
  );
};
export default Events;
