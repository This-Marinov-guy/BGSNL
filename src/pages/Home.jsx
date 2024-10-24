import React, { Fragment, useEffect, useRef } from "react";
import HeaderTwo from "../component/header/HeaderTwo";
import AboutUs from "../component/HomeLayout/homeOne/AboutUs";
import FooterTwo from "../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import BrandTwo from "../elements/BrandTwo";
import { FiChevronUp } from "react-icons/fi";
import Helmet from "../component/common/Helmet";
import {
  FutureEventsContent,
  FutureOtherEventsContent,
} from "./information/FutureEvents";
import { useParams, useNavigate } from "react-router-dom";
import { REGIONS } from "../util/defines/REGIONS_DESIGN";
import NewsList from "../elements/ui/lists/NewsList";
import Hero2 from "../component/hero/Hero2";
import Hero1 from "../component/hero/Hero1";

const Home = () => {
  const navigate = useNavigate();
  const { region } = useParams();

  useEffect(() => {
    if (region && !REGIONS.includes(region)) {
      navigate('/');
    }
  }, [region])

  const recruitRef = useRef(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const campaignQuery = searchParams.get('campaign');

    if (campaignQuery === 'designer') {
      recruitRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <Fragment>
      <Helmet pageTitle="Welcome" />
      <HeaderTwo logo="light" />

      {/* Start Slider Area   */}
      {/* <Hero2 /> */}
      <Hero1/>
      {/* End Slider Area   */}

      {/* Start Sponsor Area */}

      <BrandTwo />

      {/* End Sponsor Area */}
      
      {/* Start About Area  */}
      {!region && <AboutUs learnMore/>}
      {/* End About Area  */}
      {/* <Greeting /> */}
      {/* Start News Area */}
      <div className="mt--40 mb--40">
        <NewsList />
      </div>
      {/* End News Area */}

      {/* Start Upcoming Events Area */}
      {region ?
        <Fragment>
          <FutureEventsContent />
          <FutureOtherEventsContent />
        </Fragment>
        :
        <FutureEventsContent displayAll />
      }
      {/* End Upcoming Events Area */}


      {/* Start Footer Style  */}
      <FooterTwo />
      {/* End Footer Style  */}
      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </Fragment>
  );
};

export default Home;
