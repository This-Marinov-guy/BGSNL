import React, { useState, useEffect, Fragment } from "react";
import { Link } from "@/util/navigation";
import { FiX, FiMenu } from "react-icons/fi";
import ImageFb from "../../elements/ui/media/ImageFb";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import { useParams } from "@/util/navigation";
import HeaderContent from "./HeaderContent";
import { HOLIDAYS } from "../../util/configs/common";
import { getActiveStrap } from "../../util/defines/CAMPAIGNS";

const Header = (props) => {
  const [isMenuOpened, setIsMenuOpened] = useState();

  const region = props.forceRegion ?? useParams().region;

  const activeStrap = getActiveStrap();

  // Was executed straight in the render body, which crashes server rendering.
  useEffect(() => {
    const elements = document.querySelectorAll(".has-dropdown > a");
    elements.forEach((element) => {
      element.onclick = function () {
        this.parentElement.querySelector(".submenu").classList.toggle("active");
        this.classList.toggle("open");
      };
    });
  });

  let logoUrl = (
    <ImageFb
      className="logo"
      src={`/assets/images/logo/${
        REGIONS.includes(region)
          ? region
          : HOLIDAYS.isWinter
          ? "logo-xmas"
          : "logo"
      }.webp`}
      fallback={`/assets/images/logo/${
        REGIONS.includes(region)
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
        className={`header-area formobile-menu header--transparent default-color ${activeStrap && 'm--25'}`}
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
          <div className="header-right">
            <HeaderContent />

            {/* Start Humberger Menu  */}
            <div className="humberger-menu d-block d-xl-none pl--20">
              <span
                onClick={() => {
                  setIsMenuOpened(true);
                }}
                className="menutrigger text-white"
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
    </Fragment>
  );
};

export default Header;
