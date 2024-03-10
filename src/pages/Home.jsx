import React, { Fragment, useEffect } from "react";
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
import ImageFb from "../elements/ui/ImageFb";
import { Link, useNavigate, useParams } from "react-router-dom";
import { REGIONS } from "../util/REGIONS_DESIGN";
import RegionLogos from "../elements/RegionLogos";

const Home = () => {
  const user = useSelector(selectUser);

  const { region } = useParams();

  const navigate = useNavigate()

  useEffect(() => {
    if (region && !REGIONS.includes(region)) {
      navigate('/404')
    }
  }, [region])

  const SlideList = [
    {
      textPosition: "text-center",
      category: "",
      title: `Bulgarian Society ${region || 'Netherlands'}`,
      description: "",
      buttonText: user.token ? "Go To Profile" : "Become a Member",
      style: user.token ? " rn-btn-reverse-green" : " btn-primary-color",
      buttonLink: user.token ? `/user` : "/signup",
    },
  ];

  return (
    <Fragment>
      <Helmet pageTitle="Welcome" />
      <Header logo="light" />
      {/* Start Slider Area   */}
      <div className="slider-activation slider-creative-agency">
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
        <ul>
          <li className="mt--40">
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
