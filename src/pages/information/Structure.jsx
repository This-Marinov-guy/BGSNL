import React from "react";
import PageHelmet from "../../component/common/Helmet";
import Breadcrumb from "../../elements/common/Breadcrumb";
import BrandTwo from "../../elements/BrandTwo";
import { Image } from "primereact/image";
import ScrollToTop from "react-scroll-up";
import { FiCheckCircle, FiChevronUp } from "react-icons/fi";
import Header from "../../component/header/Header";
import FooterTwo from "../../component/footer/FooterTwo";
import ImageFb from "../../elements/ui/media/ImageFb";
import { BOARD_AND_COMMITTEES_IMAGES } from "../../util/defines/REGIONS_STRUCTURE";

const Structure = () => {
  return (
    <React.Fragment>
      <PageHelmet pageTitle="Boards & Committees" />
      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      {/* Start Breadcrump Area */}
      <Breadcrumb title={"Boards & Committees"} />
      {/* End Breadcrump Area */}

      {/* Start Board of NL */}
      <div className="about-wrapper mb--40">
        <div className="container">
          <div className="row row--35 align-items-center">
            <div className="col-lg-7 col-md-12">
              <div className="about-inner inner">
                <div className="row mt--30 mt_sm--10">
                  <div className="col-12">
                    <div className="about-us-list">
                      <h3 className="title">
                        What is the Bulgaria Society Netherlands Structure?
                      </h3>
                      <p>
                        As society that is ever-evolving and expanding, we have
                        developed a structure of independent city governance and
                        one board to support and monitor the rest. The BGSNL
                        Board was established as a supportive mechanism,
                        providing fresh ideas, sponsorships and financial aids,
                        maintaining the platform and most importantly -
                        expanding and helping city societies grow.
                      </p>

                      <h4>Click the image to get introduced!</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5 col-md-12">
              <a
                href="https://www.instagram.com/p/DCUfE39tnsZ/?hl=en&img_index=1"
                target="_blank"
              >
                <ImageFb src="/assets/images/team/1.jpg" alt="board" />
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* End Board of NL */}

      {/* Start Boards and Committiees of NL */}
      <div className="row container m--a">
        <div className="col-12 mb--40">
          <div className="about-us-list">
            <h3 className="title">
              How are city boards and committees structured and elected?
            </h3>
            <p>
              Boards are elected each year with a voting system in order to keep
              things democratic. The board consists of different roles but the
              main ones are usually - President, Secretary, Treasurer, Internal
              Relations, External Relations. They plan events, budget and find
              useful collaborations with other organizations.
            </p>
            <p>
              Committees are organized groups of people that are responsible for
              specific are of events. Each city decide what committees to
              establish but the most common ones are Cultural, PR, Sports and
              Personal Development. They are smaller than the board and are
              responsible for a specific task in order to be extremely
              efficient.
            </p>
          </div>
        </div>

        <div className="row col-12">
          {BOARD_AND_COMMITTEES_IMAGES.map((img, index) => {
            return (
              <div key={index} className="col-lg-6 col-md-6 col-12 m--a">
                <div className="mb--30 mb_sm--0 center_section">
                  <Image
                    style={{ width: "400px" }}
                    className={
                      index % 2 !== 0
                        ? "team_member_border-3 mb--20"
                        : "team_member_border-4 mb--20"
                    }
                    preview
                    src={`/assets/images/team/${img.id}.jpg`}
                    alt="Blog Images"
                  />
                  {img.text && (
                    <p style={{ fontStyle: "italic" }}>{`"${img.text}"`}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* End Boards and Committiees of NL */}

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
};

export default Structure;
