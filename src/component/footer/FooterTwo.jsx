import React from "react";
import ImageFb from "../../elements/ui/media/ImageFb";
import packageJson from "../../../package.json";
import { Link, useParams } from "react-router-dom";
import {
  REGION_EMAIL,
  REGION_MAIN_COLOR,
  REGION_SECOND_COLOR,
  REGION_SOCIALS,
  KVK,
} from "../../util/defines/REGIONS_DESIGN";
import { getSocialAriaLabel } from "../../util/functions/seo-helpers";
import { showModal } from "../../redux/modal";
import { DONATION_MODAL } from "../../util/defines/common";
import { useDispatch } from "react-redux";

// Copy of Footer - footer needs to be bigger in order to be on the bottom of the page
const FooterTwo = ({ forceRegion }) => {
  const region = forceRegion ?? useParams().region;

  const dispatch = useDispatch();

  return (
    <>
      <footer className="footer-area">
        <div className="footer-wrapper">
          <div className="row align-items-end row--0">
            <div className="col-lg-6">
              <div
                className="footer-left"
                style={{
                  background: `linear-gradient(145deg, ${
                    REGION_MAIN_COLOR[region] ?? "#f81f01"
                  } 0%, #ab1c02 100%)`,
                }}
              >
                <div className="inner">
                  <h2>
                    Bulgarian <br />
                    Society <br />
                    Netherlands
                  </h2>
                  <div className="button-container-2">
                    <button
                      className="rn-button-style--2 rn-btn-reverse-green"
                      onClick={() => dispatch(showModal(DONATION_MODAL))}
                    >
                      Support us
                    </button>
                    <Link
                      className="rn-button-style--2 rn-btn-reverse-green"
                      to="/developers"
                    >
                      Developers
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div
                className="footer-right"
                data-black-overlay="6"
                style={{
                  backgroundColor: `${
                    REGION_SECOND_COLOR[region] ?? "#25632d"
                  }`,
                }}
              >
                <div className="row">
                  {/* Start Single Widget  */}
                  <div className="col-lg-6 col-sm-6 col-12">
                    <div className="footer-link">
                      <h4>Quick Link</h4>
                      <ul className="ft-link">
                        <li>
                          <Link
                            to={
                              region
                                ? `/${region}/events/future-events`
                                : `/events/future-events`
                            }
                          >
                            Events
                          </Link>
                        </li>
                        <li>
                          <Link to={`/${region}/contact`}>Contact</Link>
                        </li>
                        <li>
                          <Link to="/terms-and-legals" target="_blank" rel="noopener noreferrer">
                            Terms and policy
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {/* End Single Widget  */}
                  {/* Start Single Widget  */}
                  <div className="col-lg-6 col-sm-6 col-12 mt_mobile--30">
                    <div className="footer-link">
                      <h4>Find the society on</h4>
                      <ul className="ft-link">
                        <li>
                          <a href={`mailto:${REGION_EMAIL["netherlands"]}`}>
                            {REGION_EMAIL["netherlands"]}
                          </a>
                        </li>
                      </ul>

                      <div className="social-share-inner">
                        <ul className="social-share social-style--2 d-flex justify-content-start liststyle mt--15">
                          {REGION_SOCIALS[`netherlands`].map((val, i) => (
                            <li key={i}>
                              <a 
                                href={`${val.link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={getSocialAriaLabel(val.link, 'Netherlands')}
                              >
                                {val.Social}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  {/* End Single Widget  */}

                  <div className="col-lg-12">
                    <div className="copyright-text">
                      <p>
                        Copyright ©️ {new Date().getFullYear()} Bulgarian
                        Society Netherlands. All Rights Reserved.
                      </p>

                      <p className="information">{`KVK: ${KVK.netherlands} | Version ${packageJson.version}`}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
export default FooterTwo;
