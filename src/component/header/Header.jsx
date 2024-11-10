import React, { Fragment, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/user";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import ImageFb from "../../elements/ui/media/ImageFb";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import { useParams } from "react-router-dom";
import { capitalizeFirstLetter } from "../../util/functions/capitalize";
import {
  checkAuthorization,
  decodeJWT,
} from "../../util/functions/authorization";
import NewBadge from "../../elements/ui/badges/NewBadge";
import { ACCESS_2, ACCESS_3, ACCESS_4 } from "../../util/defines/common";
import LogoutAlert from "../../elements/ui/alerts/Logout";
import { selectArticles } from "../../redux/articles";
import { encodeForURL } from "../../util/functions/helpers";
import HeaderContent from "./HeaderContent";

const Header = (props) => {
  const [isMenuOpened, setIsMenuOpened] = useState();
  const [logoutAlert, setLogoutAlert] = useState(false);

  const user = useSelector(selectUser);
  const userRegion = user.token ? decodeJWT(user.token).region : "";

  const articles = useSelector(selectArticles);

  const region = props.forceRegion ?? useParams().region;

  const navigate = useNavigate();
  const location = useLocation();
  const routePath = location.pathname;

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
        REGIONS.includes(region) ? region : "logo"
      }.webp`}
      fallback={`/assets/images/logo/${
        REGIONS.includes(region) ? region : "logo"
      }.jpg`}
      alt="Logo"
    />
  );

  return (
    <Fragment>
      <LogoutAlert visible={logoutAlert} onHide={() => setLogoutAlert(false)} />
      <header
        className={`header-area formobile-menu header--transparent default-color`}
      >
        <div
          className={(isMenuOpened && "menu-open") + " header-wrapper"}
          id="header-wrapper"
        >
          <div className="header-left">
            <div className="logo">
              <Link to={region ? `/${region}` : "/"}>{logoUrl}</Link>
            </div>
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
