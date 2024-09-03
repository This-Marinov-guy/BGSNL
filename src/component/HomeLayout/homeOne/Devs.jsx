import React, { useState, useEffect } from "react";
import { Col } from "react-bootstrap";
import ImageFb from "../../../elements/ui/media/ImageFb";
import TypewriterEffect from '../../../elements/ui/TypewriterEffect';
import TeamMember from '../../../pages/information/devteam/DevTeamMembers';
import teamMembersData from '../../../pages/information/devteam/TeamMemberInfo'; // Ensure this is correctly imported

const Devs = () => {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    setTeamMembers(teamMembersData || []);
  }, []);

  let teamSize = teamMembers.length;
  let columnSize = Math.floor(teamSize / 12);

  return (
    <React.Fragment>
      <div className="mb--20">
        <div className="container mt-5">
          <div className="row row--35 align-items-center">
            {/* About the team section */}
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
                </div>
              </div>
            </div>
            {/* Image Section */}
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
          {/* Our Team Section */}
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
                    <p>No team members available.</p>
                  )}
                </div>
              </div>


              <div className="col-lg-6 col-12 center_div_col">
                <a href="https://github.com/This-Marinov-guy/BGSNL" target="_blank" rel="noopener noreferrer">
                  <img
                    src="/assets/images/developers/github.png"
                    alt="Github"
                    style={{ width: "60px", height: "60px" }}
                  />
                </a>
                <h3 className="description mt--10">
                  We are an open-source project, feel free to contribute to our cause.
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Devs;