import React, { Component } from "react";

class BrandTwo extends Component {
  render() {
    return (
      <div
        style={{ padding: "40px 40px 5px", marginBottom: "20px" }}
        className="rn-brand-area brand-separation bg_color--5"
      >
        <h3 style={{ textAlign: "center", fontFamily: "Archive" }}>Partners</h3>
        <ul className="brand-style-2">
          <li>
            <a href="https://www.cooltravel.bg/" target="_blank">
              <img
                className="splash-li"
                src="/assets/images/brand/brand-06.png"
                alt="Logo Images"
              />
            </a>
          </li>
          <li>
            <a href="https://domakin.nl/" target="_blank">
              <img
                src="/assets/images/brand/brand-07.png"
                alt="Logo Images"
                style={{ borderRadius: "5%" }}
              />
            </a>
          </li>
          <li>
            <a href="https://studybuddy.bg/" target="_blank">
              <img src="/assets/images/brand/brand-04.png" alt="Logo Images" />
            </a>
          </li>
          {/* <li>
                        <a href='https://www.integral.bg/' target='_blank'><img src="/assets/images/brand/brand-05.png" alt="Logo Images" /></a>
                    </li> */}
          <li>
            <a href="https://www.unify.bg/" target="_blank">
              <img src="/assets/images/brand/brand-02.png" alt="Logo Images" />
            </a>
          </li>
          <li>
            <a href="https://www.bghub-eindhoven.nl/" target="_blank">
              <img src="/assets/images/brand/brand-11.png" alt="Logo Images" />
            </a>
          </li>
          <li className="mt--20 mb--10">
            <a href="https://bulgariawantsyou.com/en" target="_blank">
              <img
                src="https://bulgariawantsyou.com/themes/custom/bwy/logo.svg"
                style={{
                  scale: "1.5",
                  backgroundColor: "#BFBFBF",
                  padding: "10px",
                  borderRadius: "10px",
                }}
                alt="Logo Images"
              />
            </a>
          </li>
          <li>
            <a href="https://www.societasbulgarica.org/" target="_blank">
              <img
                src="/assets/images/brand/brand-12.png"
                style={{ scale: "0.6" }}
                alt="Logo Images"
              />
            </a>
          </li>
          <li>
            <a href="https://www.pwc.bg/" target="_blank">
              <img
                src="/assets/images/brand/brand-13.png"
                style={{ scale: "1.4" }}
                alt="Logo Images"
              />
            </a>
          </li>
          <li>
            <a href="https://sunnybeach-groningen.nl" target="_blank">
              <img
                src="/assets/images/brand/brand-10.png"
                style={{ scale: "0.7" }}
                alt="Logo Images"
              />
            </a>
          </li>
        </ul>
      </div>
    );
  }
}
export default BrandTwo;
