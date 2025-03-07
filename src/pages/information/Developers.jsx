import React from "react";
import PageHelmet from "../../component/common/Helmet";
import Breadcrumb from "../../elements/common/Breadcrumb";
import Devs from "../../component/HomeLayout/homeOne/Devs";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import Header from "../../component/header/Header";
import FooterTwo from "../../component/footer/FooterTwo";

const Developers = React.memo(() => {
  return (
    <React.Fragment>
      <PageHelmet pageTitle="Developers" />
      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      {/* Start Breadcrump Area */}
      <Breadcrumb title={"Developers"} />
      {/* End Breadcrump Area */}

      {/* Start About Area  */}
      <Devs />
      {/* End About Area  */}

      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <FooterTwo />
    </React.Fragment>
  );
});

export default Developers;
