import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/user";
import { Link, useParams } from "react-router-dom";
import ImageFb from "../../elements/ui/media/ImageFb";

const Hero2 = () => {
  const user = useSelector(selectUser);
  const { region } = useParams();

  return (
    <div className="mt--140">
      {/* <div className="hero-line mb--20" alt="line" /> */}
      <div className="hero slider-activation slider-creative-agency">
        <div className="left-container">
          <h1 className="title archive theme-gradient">
            {`Bulgarian Society ${region || "Netherlands"}`}
          </h1>
          <Link
            style={{ fontSize: "24px" }}
            className={"rn-button-style--2 rn-btn-reverse-green"}
            to={user.token ? `/user` : "/signup"}
          >
            {user.token ? "Go To Profile" : "Become a Member"}
          </Link>{" "}
        </div>

        <img
          src={`/assets/images/bg/paralax/${region || "netherlands"}.webp`}
          className="right-container"
        />
      </div>
      {/* <div className="hero-line mt--20" alt="line" /> */}
    </div>
  );
};

export default Hero2;
