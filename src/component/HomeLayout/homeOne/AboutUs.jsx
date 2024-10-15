import React from "react";
import Slider from "react-slick";
import ImageFb from "../../../elements/ui/media/ImageFb";
import { presentation } from "../../../page-demo/script";
import { SLIDESHOW } from "../../../util/defines/GLOBAL_INFO";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";

const AboutUs = ({ learnMore }) => {
  let title = "About Us";

  return (
    <React.Fragment>
      <div className="about-wrapper mb--40">
        <div className="container">
          <div className="row row--35 align-items-center">
            <div className="col-lg-5 col-md-12">
              <Slider {...presentation}>
                {SLIDESHOW.map((image, index) => {
                  return (
                    <LazyLoadImage
                      key={index}
                      src={image.src}
                      alt={image.alt}
                      className="small-presentation soft-border"
                    />
                  );
                })}
              </Slider>
            </div>

            <div className="col-lg-7 col-md-12">
              <div className="about-inner inner">
                <div className="section-title">
                  {learnMore ? (
                    <div className="center_div j-start">
                      <h2 className="title mr--20">{title}</h2>
                      <Link style={{fontSize: '0.6em'}} to="/about">(Learn more)</Link>
                    </div>
                  ) : (
                    <h2 className="title">{title}</h2>
                  )}
                </div>
                <div className="row mt--30 mt_sm--10">
                  <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                    <div className="about-us-list">
                      <h3 className="title">Goal</h3>
                      <p>
                        We aim to bring the Bulgarian students of the
                        Netherlands together
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                    <div className="about-us-list">
                      <h3 className="title">Environment</h3>
                      <p>
                        Creating a supportive, welcoming and stimulating
                        environment
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row mt--30 mt_sm--10">
                  <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                    <div className="about-us-list">
                      <h3 className="title">Culture</h3>
                      <p>
                        We aim to nurture and develop the Bulgarian culture in
                        each city of the Netherlands
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                    <div className="about-us-list">
                      <h3 className="title">Representation</h3>
                      <p>
                        We aim to represent the Bulgarian culture in the
                        Netherlands
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AboutUs;
