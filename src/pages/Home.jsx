import React, { Fragment, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
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

const Home = () => {
  const user = useSelector(selectUser);

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
          src={`/assets/images/bg/paralax/${region || 'netherlands'}.jpg`}
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
      {/* Start Sponsor Area */}

      <BrandTwo />

      {/* End Sponsor Area */}

      {/* Start About Area  */}
      {!region && <AboutUs />}
      {/* End About Area  */}
      {/* <Greeting /> */}
      {/* Start News Area */}
      <div className="container mt--110 mb--80">
        <h2 className="title">News</h2>
        <ul style={{ margin: '0', padding: '0' }}>
          <li className="mt--40">
            <p>Еxhibitions of Bulgarian students in Groningen <Link to='/articles/acedemie-minerva'>
              Check it out
            </Link>
            </p>
          </li>
          
          <li className="mt--40" ref={recruitRef}>
            <Recruit />
          </li>

          <li className="mt--40" ref={recruitRef} >
            <p> Membership 2023-2024 open. <Link to='/signup'>
              Sign up!
            </Link>
            </p>
          </li>

        </ul>

      </div>
      {/* End News Area */}

      {/* Start Upcoming Events Area */}
      {region && <Fragment>
        <FutureEventsContent />
        <FutureOtherEventsContent />
      </Fragment>}
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
    </Fragment >
  );
};

export default Home;
