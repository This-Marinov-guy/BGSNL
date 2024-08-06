import React, { Fragment } from "react";
import packageJson from "../../../package.json";
import { Link, useParams } from "react-router-dom";
import Donation from "../../elements/Donation";
import { useDispatch, useSelector } from "react-redux";
import { selectDonation, showDonation } from "../../redux/donation";
import { REGION_EMAIL, REGION_MAIN_COLOR, REGION_SECOND_COLOR, REGION_SOCIALS } from "../../util/defines/REGIONS_DESIGN";

const Footer = () => {

  const { region } = useParams();

  const donation = useSelector(selectDonation)
  const dispatch = useDispatch();

  return (
    <Fragment>
      {/* {donation && <Donation />} */}
      <footer className="footer-area">
        {donation && <Donation />}
        <div className="footer-wrapper">
          <div className="row align-items-end row--0">
            <div className="col-lg-6">
              <div className="footer-left" style={{ background: `linear-gradient(145deg, ${REGION_MAIN_COLOR[region] || '#f81f01'} 0%, #ab1c02 100%)` }}>
                <div className="inner">
                  <span>Have a Question?</span>
                  <h2>
                    Do not <br />
                    hesitate to contact us
                  </h2>
                  <button className="rn-button-style--2 rn-btn-reverse-green" onClick={() => dispatch(showDonation())}>Support us</button>

                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="footer-right" data-black-overlay="6" style={{ backgroundColor: `${REGION_SECOND_COLOR[region] || '#25632d'}` }}>
                <div className="row">
                  {/* Start Single Widget  */}
                  <div className="col-lg-6 col-sm-6 col-12">
                    <div className="footer-link">
                      <h4>Quick Link</h4>
                      <ul className="ft-link">
                        <li>
                          <Link to='/about'>About</Link>
                        </li>
                        <li>
                          <Link to={`/${region}/past-events`}>Events</Link>
                        </li>
                        <li>
                          <Link to={`/${region}/contact`}>Contact</Link>
                        </li>
                        <li>
                          <Link to="/rules-and-regulations" target="_blank">
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
                      <h4>Find us</h4>
                      <ul className="ft-link">
                        <li>
                          <a href={`mailto:${REGION_EMAIL[region]}`}>
                            {REGION_EMAIL[region]}
                          </a>
                        </li>
                      </ul>

                      <div className="social-share-inner">
                        <ul className="social-share social-style--2 d-flex justify-content-start liststyle mt--15">
                          {REGION_SOCIALS[region] && REGION_SOCIALS[region || `default`].map((val, i) => (
                            <li key={i}>
                              <a href={`${val.link}`}>{val.Social}</a>
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
                        Copyright © 2022 Bulgarian Society Groningen. All
                        Rights Reserved.
                      </p>

                      <p className="information">{`Version ${packageJson.version}`}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </Fragment>
  );
}

export default Footer;
