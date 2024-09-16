import React, { Fragment, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeModal, selectModal, showModal } from '../redux/modal';
import { WEB_DEV_MODAL } from '../util/defines/common';
import { selectUser } from "../redux/user";
import Header from "../component/header/Header";
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
import ImageFb from "../elements/ui/media/ImageFb";
import { Link, useParams, useNavigate } from "react-router-dom";
import { REGIONS } from "../util/defines/REGIONS_DESIGN";
import RegionLogos from "../elements/RegionLogos";
import Recruit from "../elements/special/Recruite";
import NewsList from "../elements/ui/lists/NewsList";

const Home = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
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

  const SlideList = [
    {
      textPosition: "text-center",
      category: "",
      title: `Bulgarian Society ${region || 'Netherlands'}`,
      description: "",
      buttonText: user.token ? "Go To Profile" : "Become a Member",
      style: " rn-btn-reverse-green",
      buttonLink: user.token ? `/user` : "/signup",
    },
  ];

  return (
    <Fragment>
      <Helmet pageTitle="Welcome" />
      <Header logo="light" />
      {/* Start Slider Area   */}
      <div style={{ height: '100vh' }} className="slider-activation slider-creative-agency">
        <ImageFb
          src={`/assets/images/bg/paralax/${region || 'netherlands'}.webp`}
          fallback={`/assets/images/bg/paralax/${region || 'netherlands'}.jpg`}
          className="home_bg"
        />
        {SlideList.map((value, index) => (
          <div
            className="slide slide-style-2 slider-paralax d-flex align-items-center justify-content-center"
            key={index}
          >
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className={`inner ${value.textPosition}`}>
                    {value.category ? <span>{value.category}</span> : ""}
                    {value.title ? (
                      <h1 className="title theme-gradient">{value.title}</h1>
                    ) : (
                      ""
                    )}
                    {value.description ? (
                      <p className="description">{value.description}</p>
                    ) : (
                      ""
                    )}
                    {value.buttonText && (
                      <div className="slide-btn">
                        <Link
                          style={{ fontSize: "24px" }}
                          className={"rn-button-style--2" + value.style}
                          to={value.buttonLink}
                        >
                          {value.buttonText}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* End Slider Area   */}

      {/* Start About Area  */}
      {!region && <AboutUs />}
      {/* End About Area  */}
      {/* <Greeting /> */}
      {/* Start News Area */}
      <div className="mt--110 mb--80">
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

      {/* Start Sponsor Area */}

      <BrandTwo />

      {/* End Sponsor Area */}

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
