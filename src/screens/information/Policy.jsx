"use client";

/* eslint-disable react/display-name */
import React, {
  useEffect,
  useState,
} from "react";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import { Link } from "@/util/navigation";
import PageHelmet from "../../component/common/Helmet";
import FooterTwo from "../../component/footer/FooterTwo";
import HeaderTwo from "../../component/header/HeaderTwo";
import Cookies from "../../elements/legals/Cookies";
import Privacy from "../../elements/legals/Privacy";
import Rules from "../../elements/legals/Rules";
import Terms from "../../elements/legals/Terms";
import {
  COOKIES,
  LEGAL_TABS,
  PRIVACY,
  RULES,
  TERMS,
} from "../../util/defines/enum";

const Policy = React.memo(() => {
  // The hash is only known on the client; reading it during render crashed SSR.
  const [tab, setTab] = useState("rules");
  let activeTab = null;

  useEffect(() => {
    const hash = window.location.hash.substring(1).split("?")[0];
    if (hash) setTab(hash);
  }, []);

  switch (tab) {
    case PRIVACY:
      activeTab = <Privacy />;
      break;
    case RULES:
      activeTab = <Rules />;
      break;
    case COOKIES:
      activeTab = <Cookies />;
      break;
    case TERMS:
      activeTab = <Terms />;
      break;
    default:
      activeTab = null;
  }

  return (
    <div className="watermark">
      <PageHelmet pageTitle="Policy" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <div className="mt--200 mb--40 btn_row row">
        {LEGAL_TABS.map((t, i) => (
          <Link
            key={i}
            to={`#${t}`}
            className={`col-lg-2 col-md-4 col-sm-12 center_text rn-button-style--2 ${
              tab === t || (tab === "" && t === LEGAL_TABS[0])
                ? "rn-btn-solid-green"
                : "rn-btn-green"
            }`}
            onClick={() => {
              setTab(t);
            }}
          >
            {t}
          </Link>
        ))}
      </div>
      {activeTab}
      {/* Start Footer Style  */}
      <FooterTwo />
      {/* End Footer Style  */}
      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </div>
  );
});

export default Policy;
