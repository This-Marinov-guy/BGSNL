import React from "react";
import PageHelmet from "../../component/common/Helmet";
import Breadcrumb from "../../elements/common/Breadcrumb";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import { FutureEventsContent } from "./FutureEvents";
import { FutureOtherEventsContent } from "./FutureEvents";
import Header from "../../component/header/Header";
import Footer from "../../component/footer/Footer";
import { useParams } from "react-router-dom";

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
      {/* Start Breadcrump Area */}
      <Breadcrumb title={"Events"} />
      {/* End Breadcrump Area */}

      {/* Start Future Events Area */}
      <FutureEventsContent />
      <FutureOtherEventsContent />
      {/* End Future Events Area */}

      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} style={{ fontSize: '26px' }} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <Footer />
    </React.Fragment>
  );
};
export default Events;
