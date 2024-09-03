import React from "react";

const TeamMember = ({ member }) => {
  return (
    <div className="text-center">
        <img
          src={member.imgSrc}
          alt={`${member.name} Profile`}
          style={{ width: "100px", height: "100px", borderRadius: "50%" }}
        />
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
            {/* TODO: maybe add other images for other platforms? */}
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

export default TeamMember;