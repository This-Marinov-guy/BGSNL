import React from "react";
import Card2 from "../cards/Card2";
import { useDispatch, useSelector } from "react-redux";
import { showModal } from "../../../redux/modal";
import { DONATION_MODAL, WEB_DEV_MODAL } from "../../../util/defines/common";
import { REGION_INSTAGRAM } from "../../../util/defines/REGIONS_DESIGN";
import { selectIsAuth } from "../../../redux/user";
import { useLocation } from "react-router-dom";
import Slider from "react-slick";
import { slickDot2 } from "../../../page-demo/script";
import { CAMPAIGNS } from "../../../util/defines/CAMPAIGNS";

const NewsList = () => {
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

  return (
    <div className="rn-featured-service-area bg_color--5 pb--40">
      <div className="container">
        <div className="row">
          {/* Start Single Service  */}
          <div className="col-lg-3 col-md-6 col-12 mt--30">
            <div className="section-title">
              <h2 className="title">News</h2>
              <p>
                Find everything recent with the society here or on our social
                media channels.
              </p>
              <div className="service-btn">
                {/* //add link */}
                <a
                  className="btn-transparent rn-btn-dark"
                  href={REGION_INSTAGRAM["netherlands"] ?? ""}
                  target="_blank"
                >
                  <span className="text">Social media</span>
                </a>
              </div>
            </div>
          </div>
          {/* End Single Service  */}

          {/* Start Single Service  */}
          <div className="col-lg-9">
            {newsArray.length ? (
              <Slider {...slickDot2} className="pl--20 pr--20">
                {newsArray.map((value, index) => (
                  <Card2 key={index} {...value} />
                ))}
              </Slider>
            ) : (
              <p>No recent news - stay tuned for updates!</p>
            )}
          </div>
          {/* End Single Service  */}
        </div>
      </div>
    </div>
  );
};

export default NewsList;
