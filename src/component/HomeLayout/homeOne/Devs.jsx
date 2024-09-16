import React from "react";
import { Col } from "react-bootstrap";
import ImageFb from "../../../elements/ui/media/ImageFb";
import TypewriterEffect from '../../../elements/ui/TypewriterEffect';
import TeamMember from '../../../elements/devteam/DevTeamMembers';
import { useDispatch } from "react-redux";
import { showModal } from "../../../redux/modal";
import { WEB_DEV_MODAL } from "../../../util/defines/common";

const teamMembers = [
  {
    id: 1,
    name: "Vladislav Marinov",
    title: "Web Developer",
    imgSrc: "/assets/images/developers/vladislav.png",
    socialLinks: [
      {
        platform: "linkedin",
        url: "https://www.linkedin.com/in/vladislav-marinov-122455208/",
      },
    ],
  },
  {
    id: 2,
    name: "Presiyan Penkov",
    title: "Software Developer",
    imgSrc: "/assets/images/developers/presiyan.png",
    socialLinks: [
      {
        platform: "linkedin",
        url: "https://www.linkedin.com/in/presiyan-penkov-6a7959299/",
      },
    ],
  },
  {
    id: 3,
    name: "Kaloyan Kulov",
    title: "Software Developer",
    imgSrc: "https://media.licdn.com/dms/image/v2/D4D03AQGUMq0cuqlFVA/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1718306073326?e=1731542400&v=beta&t=OLcIOFT1hXTY_iaR1Cn2c8hlBSdkSzRMEXwawfXCgQA",
    socialLinks: [
      {
        platform: "linkedin",
        url: "https://www.linkedin.com/in/kaloyan-kulov/",
      },
    ],
  }
];

const Devs = () => {
  let teamSize = teamMembers.length;
  let columnSize = Math.floor(teamSize / 12);

  const dispatch = useDispatch();

  return (
    <React.Fragment>
      <div className="mb--20">
        <div className="container mt-5">
          <div className="row row--35 align-items-center">
            <div className="col-lg-7 col-md-12 mb-5">
              <div className="about-inner inner">
                <div className="section-title mt-3">
                  <TypewriterEffect text="/dev team" speed={100} />
                </div>
                <div className="about-us-list">
                  <p className="description">
                    We are the developer team of Bulgarian Society Netherlands.
                    We help maintain the website, create new features, and ensure
                    the content is frequently updated.
                  </p>
                  <br/>
                  <h4>Care to join? Apply now by <a className="" onClick={() => dispatch(showModal(WEB_DEV_MODAL))}>Clicking here!</a></h4>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-md-12 mb-5">
              <div className="thumbnail">
                <ImageFb
                  className="w-100"
                  src="/assets/images/developers/developer.png"
                  alt="About Images"
                />
              </div>
            </div>
          </div>
          <div className="container mt-5">
            <div className="row row--35 align-items-center">
              <div className="col-lg-7 col-md-12">
                <div className="about-inner inner">
                  <div className="section-title">
                    <TypewriterEffect text="/contributors" speed={300} />
                  </div>
                </div>
              </div>
            </div>

            <div className="row">

              <div className="col-lg-6 col-12">
                <div className="d-flex flex-wrap center_div">
                  {teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
                      <Col key={member.id} md={columnSize}>
                        <div
                          className="team-member-wrapper d-flex"
                          key={member.id}
                        >
                          <TeamMember member={member} />
                        </div>
                      </Col>
                    ))
                  ) : (
                    <p>No team members yet.</p>
                  )}
                </div>
              </div>


              <a href="https://github.com/This-Marinov-guy/BGSNL" target="_blank" rel="noopener noreferrer" className="col-lg-6 col-12 center_div_col">
                <img
                  src="/assets/images/developers/github.png"
                  alt="Github"
                  style={{ width: "60px", height: "60px" }}
                />
                <div>
                  <h3 className="description mt--10">
                    We are an open-source project, feel free to contribute and gain your spot here.
                  </h3>
                  <small className="information">*At least the README.md file please</small>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Devs;