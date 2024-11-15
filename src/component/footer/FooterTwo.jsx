import React from "react";
import ImageFb from "../../elements/ui/media/ImageFb";
import packageJson from "../../../package.json";
import { Link, useParams } from "react-router-dom";
import { REGIONS, REGION_SECOND_COLOR, REGION_SOCIALS, KVK } from "../../util/defines/REGIONS_DESIGN";
import { showModal } from "../../redux/modal";
import { DONATION_MODAL } from "../../util/defines/common";
import { useDispatch } from "react-redux";

const FooterTwo = ({ forceRegion }) => {
  const region = forceRegion ?? useParams().region;

  const dispatch = useDispatch();

  return (
    <div
      className="footer-style-2 ptb--30 bg_image"
      data-black-overlay="6"
      style={{ backgroundColor: `${REGION_SECOND_COLOR[region] || "grey"}` }}
    >
      <div className="wrapper plr--50 plr_sm--20">
        <div className="row align-items-center justify-content-between">
          <div className="col-lg-4 col-md-6 col-sm-6 col-12">
            <div className="footer-btns">
              <div className="inner">
                <div className="logo text-center text-sm-left mb_sm--20">
                  <Link to="/">
                    <ImageFb
                      style={{ borderRadius: "50%" }}
                      src={`/assets/images/logo/logo.webp`}
                      fallback={`/assets/images/logo/logo.jpg`}
                      alt="Logo images"
                    />
                  </Link>
                </div>
              </div>
              <div className="button-container">
                <button
                  className="rn-button-style--2 rn-btn-reverse-green"
                  onClick={() => dispatch(showModal(DONATION_MODAL))}
                >
                  Support us
                </button>
                <Link style={{ height: "73px" }} to="/developers">
                  <button className="rn-button-style--2 rn-btn-reverse-green">
                    Developers
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-6 col-12">
            <div className="inner text-center">
              <ul className="social-share rn-lg-size d-flex justify-content-center liststyle">
                {REGION_SOCIALS["netherlands"].map((val, i) => (
                  <li key={i}>
                    <a href={`${val.link}`}>{val.Social}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-4 col-md-12 col-sm-12 col-12">
            <div className="inner text-lg-right text-center mt_md--20 mt_sm--20">
              <div className="text">
                <p>
                  Copyright ©️ 2022 Bulgarian Society Netherlands. All Rights
                  Reserved.
                </p>
              </div>
              <p className="information">{`KVK: ${KVK.netherlands} | Version ${packageJson.version}`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FooterTwo;
