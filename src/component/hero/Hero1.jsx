import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/user";
import { Link, useParams } from "react-router-dom";
import ImageFb from "../../elements/ui/media/ImageFb";
import SnowBackground from "../../elements/ui/backgrounds/SnowBackground";

const Hero1 = () => {
  const user = useSelector(selectUser);
  const { region } = useParams();

  const SlideList = [
    {
      textPosition: "text-center",
      category: "",
      title: `Bulgarian Society ${region || "Netherlands"}`,
      description: "",
      buttonText: user.token ? "Go To Profile" : "Become a Member",
      style: " rn-btn-reverse-green",
      buttonLink: user.token ? `/user` : "/signup",
    },
  ];

  return (
    <div
      style={{ height: "100vh" }}
      className="slider-activation slider-creative-agency"
    >
      <SnowBackground />
      <ImageFb
        src={`/assets/images/bg/paralax/${region || "netherlands"}.webp`}
        fallback={`/assets/images/bg/paralax/${region || "netherlands"}.jpg`}
        className="home_bg"
      />
      {SlideList.map((value, index) => (
        <div
          className="slide slide-style-2 slider-paralax d-flex align-items-center justify-content-center"
          key={index}
        >
          <div className="">
            <div className="row">
              <div className="col-lg-12">
                <div className={`inner ${value.textPosition}`}>
                  {value.category ? <span>{value.category}</span> : ""}
                  {value.title ? (
                    <h1 className="title theme-gradient">
                      {value.title}
                    </h1>
                  ) : (
                    ""
                  )}
                  {value.description ? (
                    <p className="description">{value.description}</p>
                  ) : (
                    ""
                  )}
                  {value.buttonText && (
                    <div className="slide-btn">
                      <Link
                        style={{ fontSize: "24px" }}
                        className={"rn-button-style--2" + value.style}
                        to={value.buttonLink}
                      >
                        {value.buttonText}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Hero1;
