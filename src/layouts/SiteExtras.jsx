"use client";

import { useEffect } from "react";
import PropTypes from "prop-types";
import { clarityTrack, gaTrack } from "../util/functions/helpers";
import BirthdayModal from "../elements/ui/modals/BirthdayModal";
import RecruitModal from "../elements/ui/modals/RecruitModal";
import DonationModal from "../elements/ui/modals/DonationModal";
import { useArticlesLoad } from "../hooks/common/api-hooks";
import CookiesModal from "../elements/ui/modals/CookiesModal";
import GoogleCalendarModal from "../elements/ui/modals/GoogleCalendarModal";
import { getActiveStrap } from "../util/defines/CAMPAIGNS";
import Strap from "../elements/banners/Strap";
import { InternshipApplyModalProvider } from "../hooks/common/use-internship-apply-modal";
import GlobalFormValidation from "../elements/ui/forms/GlobalFormValidation";

// Marketing content and its requests are unnecessary at the check-in desk.
export default function SiteExtras({ children }) {
  const { reloadArticles } = useArticlesLoad();
  useEffect(() => {
    const startOptionalAnalytics = () => {
      if (process.env.NEXT_PUBLIC_CLARITY_ENABLE == "1") clarityTrack();
      if (process.env.NEXT_PUBLIC_GTM_ENABLE == "1") gaTrack();
    };
    startOptionalAnalytics();
    window.addEventListener("bgsnl-cookie-consent-change", startOptionalAnalytics);
    reloadArticles();
    return () => window.removeEventListener("bgsnl-cookie-consent-change", startOptionalAnalytics);
  }, []);

  return <InternshipApplyModalProvider>
    <DonationModal />
    <RecruitModal />
    <BirthdayModal />
    <CookiesModal />
    <GoogleCalendarModal />
    <GlobalFormValidation />
    <Strap strap={getActiveStrap()} />
    {children}
  </InternshipApplyModalProvider>;
}

SiteExtras.propTypes = { children: PropTypes.node };
