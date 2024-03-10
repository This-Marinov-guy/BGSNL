import React from "react";
import Breadcrumb from "../../elements/common/Breadcrumb";
import PageHelmet from "../../component/common/Helmet";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import Header from "../../component/header/Header";
import Footer from "../../component/footer/Footer";
import WindowShift from "../../elements/ui/WindowShift";
import TeamTwo from "../../elements/TeamTwo";
import { useParams } from "react-router-dom";
import { REGION_COMMITTEE_MEMBERS } from "../../util/REGIONS_STRUCTURE";


const Committees = React.memo(() => {

  const { region } = useParams();

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Committees" />
      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      {/* Start Breadcrump Area */}
      <Breadcrumb title={"Meet the Committees"} />
      {/* End Breadcrump Area */}

      {/* Start Team Area  */}
      {REGION_COMMITTEE_MEMBERS[region] ? <div className=" ptb--120 bg_color--5">
        <WindowShift
          main={REGION_COMMITTEE_MEMBERS[region][0].name}
          secondary={REGION_COMMITTEE_MEMBERS[region][1].name}
          mainContent={
            <div>
              <h2 className="center_text mb--20">
                {REGION_COMMITTEE_MEMBERS[region][0].name}
              </h2>
              <br />
              <TeamTwo folder={REGION_COMMITTEE_MEMBERS[region][0].folder} teamPhoto={REGION_COMMITTEE_MEMBERS[region][0].teamPhoto} target={REGION_COMMITTEE_MEMBERS[region][0].team} />
            </div>
          }
          secondaryContent={
            <div>
              <h2 className="center_text mb--20">{REGION_COMMITTEE_MEMBERS[region][1].name}
              </h2>
              <br />
              <TeamTwo folder={REGION_COMMITTEE_MEMBERS[region][1].folder} teamPhoto={REGION_COMMITTEE_MEMBERS[region][1].teamPhoto} target={REGION_COMMITTEE_MEMBERS[region][1].team} />
            </div>
          }
        />
      </div>: <h1 className="mt--100 mb--100 ml--20">Coming Soon</h1>}
      {/* End Team Area  */}

      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <Footer />
    </React.Fragment>
  );
});

export default Committees;
