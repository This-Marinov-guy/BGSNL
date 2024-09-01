import React, { useState, useEffect } from "react";
import ImageFb from "../../../elements/ui/ImageFb";
import TypewriterEffect from '../../../elements/ui/TypewriterEffect';
import TeamMember from '../../../pages/information/devteam/DevTeamMembers';
import teamMembersData from '../../../pages/information/devteam/TeamMemberInfo'; // Ensure this is correctly imported

const Devs = () => {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    setTeamMembers(teamMembersData || []);
  }, []);

  return (
    <React.Fragment>
      <div className="about-wrapper mb--80">
        <div className="container mt-5">
          <div className="row row--35 align-items-center">
            {/* About the team section */}
            <div className="col-lg-7 col-md-12 mb-5">
              <div className="about-inner inner">
                <div className="section-title mt-3">
                  <TypewriterEffect text="/about us" speed={100} />
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
                  src="/assets/images/about/board.webp"
                  fallback="/assets/images/about/board.jpg"
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
                    <TypewriterEffect text="/our team" speed={100} />
                  </div>
                </div>
              </div>
              {/* Team Members */}
              <div className="col-12">
                <div className="team_member_container d-flex flex-wrap justify-content-start">
                  {teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
                      <div
                        className="team-member-wrapper mb-4 d-flex"
                        key={member.id}
                        style={{
                          width: '200px',
                          maxWidth: '100%',
                          marginRight: '20px',
                          marginLeft: '20px',
                        }}
                      >
                        <TeamMember member={member} />
                      </div>
                    ))
                  ) : (
                    <p>No team members available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Devs;