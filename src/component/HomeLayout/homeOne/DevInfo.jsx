import React, { Component, useState, useEffect } from "react";
import ImageFb from "../../../elements/ui/ImageFb";

const TypewriterEffect = ({ text, speed = 100 }) => {
    const [typedText, setTypedText] = useState('');
    const [index, setIndex] = useState(0);
  
    useEffect(() => {
      const interval = setInterval(() => {
        if (index < text.length) {
          setTypedText((prev) => prev + text.charAt(index));
          setIndex((prevIndex) => prevIndex + 1);
        } else {
          clearInterval(interval);
        }
      }, speed);
  
      return () => clearInterval(interval);
    }, [index, text, speed]);
  
    const cursorStyle = {
      animation: 'blink 1s step-end infinite',
    };
  
    return (
      <h1 className="typed-text">
        {typedText}
        <span
          className="cursor"
          style={cursorStyle}
        >|</span>
  
        {/* Inline style for keyframes on blinking cursor */}
        <style>
          {`
            @keyframes blink {
              0% { opacity: 1; }
              50% { opacity: 0; }
              100% { opacity: 1; }
            }
            .cursor {
              animation: blink 1s step-end infinite;
            }
          `}
        </style>
      </h1>
    );
  };

  const teamMembers = [
    {
      id: 1,
      name: "John Doe",
      title: "CEO",
      imgSrc:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdEnuAJLWN_DdxE2nZyVUe2nfV7RknZMQXnw&s",
      socialLinks: [
        {
          platform: "linkedin",
          url: "https://www.linkedin.com/",
        },
      ],
    },
    {
        id: 2,
        name: "John Doe",
        title: "CFO",
        imgSrc:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdEnuAJLWN_DdxE2nZyVUe2nfV7RknZMQXnw&s",
        socialLinks: [
          {
            platform: "linkedin",
            url: "https://www.linkedin.com/",
          },
        ],
      },
      {
        id: 3,
        name: "John Doe",
        title: "Lead consultant",
        imgSrc:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdEnuAJLWN_DdxE2nZyVUe2nfV7RknZMQXnw&s",
        socialLinks: [
          {
            platform: "linkedin",
            url: "https://www.linkedin.com/",
          },
        ],
      },
      {
        id: 4,
        name: "John Doe",
        title: "Senior Developer",
        imgSrc:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdEnuAJLWN_DdxE2nZyVUe2nfV7RknZMQXnw&s",
        socialLinks: [
          {
            platform: "linkedin",
            url: "https://www.linkedin.com/",
          },
        ],
      },
      {
        id: 5,
        name: "John Doe",
        title: "Junior Developer",
        imgSrc:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdEnuAJLWN_DdxE2nZyVUe2nfV7RknZMQXnw&s",
        socialLinks: [
          {
            platform: "linkedin",
            url: "https://www.linkedin.com/",
          },
        ],
      },
      {
        id: 6,
        name: "John Doe",
        title: "Junior Developer",
        imgSrc:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdEnuAJLWN_DdxE2nZyVUe2nfV7RknZMQXnw&s",
        socialLinks: [
          {
            platform: "linkedin",
            url: "https://www.linkedin.com/",
          },
        ],
      }
  ];

  const TeamMember = ({ member }) => {
  return (
    <div className="text-center">
      <div>
        <img
          src={member.imgSrc}
          alt={`${member.name} Profile`}
          style={{ width: "100px", height: "100px", borderRadius: "50%" }}
        />
      </div>
      <div className="content">
        <h3 className="fs-3 mb-2">
          {member.name}
        </h3>
        <h4 className="designation fs-6 text-muted">
          {member.title}
        </h4>
      </div>

      <ul
        className="list-unstyled d-flex justify-content-center p-0 m-0"
      >
        {member.socialLinks.map((link, index) => (
          <li key={index} className="mx-2">
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <img
                src="/assets/images/developers/linkedin.png"
                alt="LinkedIn"
                style={{ width: "40px", height: "40px" }}
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

class DevInfo extends Component {
    render() {
      return (
        <React.Fragment>
          <div className="about-wrapper mb--80">
            <div className="container mt-5">
              <div className="row row--35 align-items-center">
                {/* About the team section */}
                <div className="col-lg-7 col-md-12 mb-5">
                  <div className="about-inner inner">
                    <div className="section-title mt-3">
                      <TypewriterEffect text={"/about us"} speed={100} />
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
                        <TypewriterEffect text={"/our team"} speed={100} />
                      </div>
                    </div>
                  </div>
                  {/* Team Members */}
                  <div className="col-12">
                    <div className="team_member_container d-flex flex-wrap">
                      {teamMembers.map((member) => (
                        <div className="team-member-wrapper mb-4" key={member.id}>
                          <TeamMember member={member} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    }
  }

export default DevInfo;
