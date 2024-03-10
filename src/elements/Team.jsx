import React from "react";
import ImageFb from "./ui/ImageFb";
import { useParams } from "react-router-dom";
import { REGION_BOARD_MEMBERS } from "../util/REGIONS_STRUCTURE";

const Team = () => {

  const {region} = useParams();

    return (
      <React.Fragment>
        <div className="container bg_color--1">
          <div className="column">
            {REGION_BOARD_MEMBERS[region] ? REGION_BOARD_MEMBERS[region].map((value) => (
              <div
                className={
                  value.id % 2 !== 0
                    ? "team_member_container flex_left"
                    : "team_member_container flex_right"
                }
                key={value.id}
              >
                <ImageFb
                  className="team_img"
                  src={`/assets/images/team/${region}/board/${value.id}.webp`}
                  fallback={`/assets/images/team/${region}/board/${value.id}.jpg`}
                  alt="Team Images"
                />
                <div
                  className={
                    value.id % 2 !== 0
                      ? "team_member_border-1"
                      : "team_member_border-2"
                  }
                >
                  <h2 className="title">{value.name}</h2>
                  <h3 className="title">{value.title}</h3>
                  {value.designation.map((value, index) => (
                    <p key={index} className="designation">
                      {value}
                    </p>
                  ))}

                  {value.socialNetwork.map((social, index) => (
                    <a
                      style={{ margin: "20px" }}
                      key={index}
                      href={`${social.url}`}
                      target="_blank"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            )): <h2>Coming Soon</h2>}
          </div>
        </div>
      </React.Fragment>
    );
  }

export default Team;
