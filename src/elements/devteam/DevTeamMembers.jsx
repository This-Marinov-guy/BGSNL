import React from "react";
import { Image } from "primereact/image";
import { replaceSpaceWithNewLine } from "../../util/functions/capitalize";

const TeamMember = ({ member }) => {
  return (
    <div className="text-center dev-team-member">
      <Image
        src={member.imgSrc}
        alt={`${member.name} Profile`}
        preview
      />
      <div className="content">
        <h3 className="fs-3 mb-2 word-break">
          {replaceSpaceWithNewLine(member.name)}
        </h3>
        <h4 className="fs-6 text-muted word-break">
          {replaceSpaceWithNewLine(member.title)}
        </h4>
      </div>

      <ul className="list-unstyled d-flex justify-content-center p-0 m-0">
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

export default TeamMember;