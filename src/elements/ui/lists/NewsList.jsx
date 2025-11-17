import React from "react";
import Card2 from "../cards/Card2";
import { useDispatch, useSelector } from "react-redux";
import { showModal } from "../../../redux/modal";
import { DONATION_MODAL, WEB_DEV_MODAL } from "../../../util/defines/common";
import { REGION_INSTAGRAM } from "../../../util/defines/REGIONS_DESIGN";
import { selectIsAuth } from "../../../redux/user";
import { useLocation } from "react-router-dom";
import Slider from "react-slick";
import { CAMPAIGNS } from "../../../util/defines/CAMPAIGNS";
import "./NewsList.css";

const NewsList = ({ withTitle = true }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAuth = useSelector(selectIsAuth);

  const activeCampaignNews = CAMPAIGNS.filter((c) => c?.modal.active).map(
    (c) => c.news
  );

  const NEWS = [
    ...activeCampaignNews,
    {
      image: "/assets/images/news/internships.jpg",
      title: "BGSNL Internships",
      description:
        "Fancy an entry job or an internship? Check out what are organization has to offer in our member-exclusive section and sign for your area of interest!",
      links: [{ name: "", href: "/user#internships", isExternal: false }],
      action: ``,
      isForMember: true,
    },
    {
      image:
        "https://images.gofundme.com/3DeeQatkuCV2f1cFGQpHo_V8lao=/720x405/https://d2g8igdw686xgo.cloudfront.net/83216271_172803224437761_r.png",
      title: "Support our mission",
      description:
        "Want to help but do not how? Our Support system is now live with GoFundMe integration!",
      links: [{ name: "", href: "", isExternal: false }],
      action: () => dispatch(showModal(DONATION_MODAL)),
      isForMember: true,
    },
    {
      image: "/assets/images/profile/from-bg-to-nl/1.webp",
      title: "From Bulgaria To The Netherlands",
      description: "Why are more and more young people emigrating?",
      links: [
        {
          name: "",
          href: "/articles/from-bulgaria-to-the-netherlands",
          isExternal: false,
        },
      ],
      action: ``,
      isForMember: true,
    },
    {
      image: "/assets/images/bg/bg-image-9.webp",
      title: "Sign up!",
      description: "Membership 2024-2025 are officially open.",
      links: [{ name: "", href: "/signup", isExternal: false }],
      action: ``,
      isForMember: true,
    },
    {
      image: "/assets/images/news/designer.png",
      title: "Web recruit",
      description:
        "Contribute to this amazing platform and support the society. Apply now!",
      links: [{ name: "", href: "", isExternal: false }],
      action: () => dispatch(showModal(WEB_DEV_MODAL)),
      isForMember: true,
    },
  ];

  const MEMBER_NEWS = [...NEWS.filter((n) => n.isForMember)];

  const newsArray =
    isAuth && location.pathname === "/user" ? MEMBER_NEWS : NEWS;

  const arcCarouselSettings = {
    centerMode: true,
    centerPadding: "0",
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 600,
    arrows: true,
    dots: true,
    focusOnSelect: true,
    pauseOnHover: true,
    pauseOnFocus: true,
    pauseOnDotsHover: true,
    swipeToSlide: true,
    touchThreshold: 10,
    cssEase: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    lazyLoad: "progressive",
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          centerPadding: "0",
          speed: 500,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          centerPadding: "20px",
          centerMode: true,
          speed: 500,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: "40px",
          centerMode: true,
          speed: 400,
          arrows: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          centerPadding: "20px",
          centerMode: true,
          speed: 400,
          arrows: false,
        },
      },
    ],
  };

  return (
    <div className="rn-featured-service-area pb--10">
      <div className="container-fluid news-full-width-container">
        <div className="row g-0">
          {/* Start Single Service  */}
          {withTitle && (
            <div className="col-12">
              <div className="section-title text-center mb--10">
                <h2 className="title">Latest News</h2>
                <p className="subtitle">
                  Stay updated with everything happening in our community
                </p>
                <div className="service-btn-center">
                  <a
                    className="btn-transparent rn-btn-dark"
                    href={REGION_INSTAGRAM["netherlands"] ?? ""}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="text">Follow us on Social Media</span>
                  </a>
                </div>
              </div>
            </div>
          )}
          {/* End Single Service  */}

          {/* Start Arc Carousel - Full Width */}
          <div className="col-12">
            {newsArray.length ? (
              <div className="news-arc-carousel-wrapper">
                <Slider {...arcCarouselSettings} className="news-arc-carousel">
                  {newsArray.map((value, index) => (
                    <div key={index} className="arc-slide-wrapper">
                      <Card2 {...value} />
                    </div>
                  ))}
                </Slider>
              </div>
            ) : (
              <p className="text-center">
                No recent news - stay tuned for updates!
              </p>
            )}
          </div>
          {/* End Arc Carousel  */}
        </div>
      </div>
    </div>
  );
};

export default NewsList;
