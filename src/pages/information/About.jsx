import React from "react";
import PageHelmet from "../../component/common/Helmet";
import Breadcrumb from "../../elements/common/Breadcrumb";
import BrandTwo from "../../elements/BrandTwo";
import CounterOne from "../../elements/counters/CounterOne";
import AboutUs from "../../component/HomeLayout/homeOne/AboutUs";
import ScrollToTop from "react-scroll-up";
import { FiCheckCircle, FiChevronUp } from "react-icons/fi";
import Header from "../../component/header/Header";
import FooterTwo from "../../component/footer/FooterTwo";

const About = React.memo(() => {
  return (
    <React.Fragment>
      <PageHelmet pageTitle="About" />
      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      {/* Start Breadcrump Area */}
      <Breadcrumb title={"About"} />
      {/* End Breadcrump Area */}

      {/* Start About Area  */}
      <AboutUs />
      {/* End About Area  */}

      {/* Start Extended About Area  */}
      <div className="container mb--40">
        <p className="mb--40">
          Welcome to the Bulgarian Society Netherlands (BGSNL)! 🇧🇬 Your home
          away from home. We know the unique challenges that Bulgarian students
          face when studying abroad, and we’re here to support you every step of
          the way. From exploring career opportunities to fostering a strong
          community, we’re here to help you thrive and make the most of your
          experience in the Netherlands. 🇳🇱
        </p>

        <p className="mb--40">
          We’re more than just a student organisation—we’re a vibrant network
          focused on supporting and empowering Bulgarians to succeed
          academically, professionally, and personally. Our mission is to help
          you navigate life abroad, build meaningful connections, and make the
          most of your time here.
        </p>
      </div>
      {/* End Extended About Area  */}

      {/* Start CounterUp Area */}
      <div className="rn-counterup-area pt--40 p pb--40 bg_color--1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <CounterOne />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End CounterUp Area */}

      {/* Start Speech Area */}
      <div className="mt--40 mb--60">
        <div className="container">
          <p className="mb--20">
            <FiCheckCircle />
            &nbsp;&nbsp; We are Bulgarian Society Netherlands.
          </p>
          <p className="mb--20">
            <FiCheckCircle />
            &nbsp;&nbsp; We saw the need to bring Bulgarian students away from
            home together by creating a second home for them.
          </p>
          <p className="mb--20">
            <FiCheckCircle />
            &nbsp;&nbsp; We saw the need to create an environment that will
            stimulate the Bulgarians in the Netherlands to develop and reach
            their goals and to become the best version of themselves.
          </p>
          <p className="mb--20">
            <FiCheckCircle />
            &nbsp;&nbsp; We saw the need in the Netherlands to celebrate and
            develop Bulgarian culture and to showcase it among internationals.
          </p>

          <h2 className="center_text mt--40">
            This is why we created Bulgarian Society Netherlands!
          </h2>
        </div>
      </div>
      {/* End Speech Area */}
      {/* Start Sponsor Area */}

      <BrandTwo />

      {/* End Sponsor Area */}
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

export default About;
