import React, { useState, Fragment, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiX, FiMenu } from "react-icons/fi";
import ImageFb from "../../elements/ui/media/ImageFb";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import { useParams } from "react-router-dom";
import HeaderContent from "./HeaderContent";
import { HOLIDAYS } from "../../util/configs/common";
import { getActiveStrap } from "../../util/defines/CAMPAIGNS";

const HeaderTwo = (props) => {
  const [isMenuOpened, setIsMenuOpened] = useState();

  const region = props.forceRegion ?? useParams().region;

  const activeStrap = getActiveStrap();

  // strap
  useEffect(() => {
    const redHeader = document.querySelector(".header-red");
    
    if (activeStrap) {
      const initBannerHeight = document.querySelector(".nav-strap").clientHeight;
      redHeader.style.top = initBannerHeight + "px";

      window.addEventListener("scroll", function () {
        const scrollPosition = window.scrollY;
        const bannerHeight = initBannerHeight; 

        if (scrollPosition >= bannerHeight) {
          redHeader.style.top = "0px";
        } else {
          // Banner is still partially visible, calculate position
          // This creates a smooth transition as you scroll
          const newPosition = bannerHeight - scrollPosition;
          redHeader.style.top = newPosition + "px";
        }
      });
    }

    return () => {
      window.removeEventListener("scroll", function () {});
    };
  }, []);

  //droupdown
  var elements = document.querySelectorAll(".has-dropdown > a");
  for (var i in elements) {
    if (elements.hasOwnProperty(i)) {
      elements[i].onclick = function () {
        this.parentElement.querySelector(".submenu").classList.toggle("active");
        this.classList.toggle("open");
      };
    }
  }
  let logoUrl = (
    <ImageFb
      className="logo"
      src={`/assets/images/logo/${
        region && REGIONS.includes(region)
          ? region
          : HOLIDAYS.isWinter
          ? "logo-xmas"
          : "logo"
      }.webp`}
      fallback={`/assets/images/logo/${
        region && REGIONS.includes(region)
          ? region
          : HOLIDAYS.isWinter
          ? "logo-xmas"
          : "logo"
      }.jpg`}
      alt="Logo"
    />
  );

  return (
    <Fragment>
      <header
        className={`header-area formobile-menu header--transparent default-color ${
          activeStrap && "m--25"
        }`}
      >
        <div
          className={(isMenuOpened && "menu-open") + " header-wrapper"}
          id="header-wrapper"
        >
          <div className="header-left">
            <Link className="logo" to={region ? `/${region}` : "/"}>
              {logoUrl}
            </Link>
          </div>

          <div className="header-right header-red">
            <HeaderContent />

            {/* Start Humberger Menu  */}
            <div className="humberger-menu d-block d-xl-none pl--20">
              <span
                onClick={() => {
                  setIsMenuOpened(true);
                }}
                className="menutrigger text-red"
              >
                <FiMenu />
              </span>
            </div>
            {/* End Humberger Menu  */}
            <div className="close-menu d-block d-xl-none">
              <span
                onClick={() => {
                  setIsMenuOpened(false);
                }}
                className="closeTrigger"
              >
                <FiX />
              </span>
            </div>
          </div>
        </div>
      </header>
      <div className="container header-middle"></div>
    </Fragment>
  );
};

export default HeaderTwo;
