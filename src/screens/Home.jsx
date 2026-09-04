"use client";

import {
  Fragment,
  useEffect,
  useRef,
} from "react";
import PropTypes from "prop-types";
import ScrollReveal from "@/component/common/ScrollReveal";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import {
  useNavigate,
  useParams,
} from "@/util/navigation";
import Helmet from "../component/common/Helmet";
import FooterTwo from "../component/footer/FooterTwo";
import HeaderTwo from "../component/header/HeaderTwo";
import Hero1 from "../component/hero/Hero1";
import Hero2 from "../component/hero/Hero2";
import AboutUs from "../component/HomeLayout/homeOne/AboutUs";
import BrandTwo from "../elements/BrandTwo";
import NewsList from "../elements/ui/lists/NewsList";
import { OTHER_EVENTS } from "../util/defines/OTHER_EVENTS";
import { REGIONS } from "../util/defines/REGIONS_DESIGN";
import {
  FutureEventsContent,
  FutureOtherEventsContent,
} from "./information/FutureEvents";

const Home = ({ initialEvents }) => {
  const navigate = useNavigate();
  const { region } = useParams();

  useEffect(() => {
    if (region && !REGIONS.includes(region)) {
      navigate("/");
    }
  }, [region]);

  const recruitRef = useRef(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const campaignQuery = searchParams.get("campaign");

    if (campaignQuery === "designer") {
      recruitRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <Fragment>
      <Helmet pageTitle="Welcome" />
      <HeaderTwo logo="light" />

      {/* Start Slider Area   */}
      {/* <Hero2 /> */}
      <Hero1 initialEvents={initialEvents} />
      {/* End Slider Area   */}

      {/* Start About Area  */}
      {!region && (
        <ScrollReveal>
          <AboutUs learnMore />
        </ScrollReveal>
      )}
      {/* End About Area  */}
      {/* <Greeting /> */}
      {/* Start News Area */}
      <ScrollReveal className="mt--40 mb--40">
        <NewsList />
      </ScrollReveal>
      {/* End News Area */}

      {/* Start Upcoming Events Area */}
      {region ? (
        <>
          {OTHER_EVENTS.length > 0 && (
            <ScrollReveal>
              <FutureOtherEventsContent />
            </ScrollReveal>
          )}
          <ScrollReveal>
            <FutureEventsContent initialEvents={initialEvents} />
          </ScrollReveal>
        </>
      ) : (
        <>
          {OTHER_EVENTS.length > 0 && (
            <ScrollReveal>
              <FutureOtherEventsContent />
            </ScrollReveal>
          )}
          <ScrollReveal>
            <FutureEventsContent displayAll initialEvents={initialEvents} />
          </ScrollReveal>
        </>
      )}
      {/* End Upcoming Events Area */}

      {/* Start Sponsor Area */}

      <ScrollReveal>
        <BrandTwo />
      </ScrollReveal>

      {/* End Sponsor Area */}

      {/* Start Footer Style  */}
      <FooterTwo />
      {/* End Footer Style  */}
      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </Fragment>
  );
};

Home.propTypes = {
  initialEvents: PropTypes.objectOf(
    PropTypes.arrayOf(PropTypes.object),
  ),
};

export default Home;
