"use client";

import React from "react";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import { useParams } from "@/util/navigation";
import PageHelmet from "../../component/common/Helmet";
import Footer from "../../component/footer/Footer";
import HeaderTwo from "../../component/header/HeaderTwo";
import Breadcrumb from "../../elements/common/Breadcrumb";
import ContactTwo from "../../elements/contact/ContactTwo";
import {
  DEFAULT_REGION,
  REGIONS,
  REGION_EMAIL,
  REGION_SOCIALS,
} from "../../util/defines/REGIONS_DESIGN";
import { humanizeRegion } from "../../util/seo/site";

const Contact = () => {
  const { region } = useParams();
  const regionKey = REGION_SOCIALS[region] ? region : DEFAULT_REGION;
  const regionName = humanizeRegion(regionKey);
  const contactEmail = REGION_EMAIL[regionKey];
  const regionLogo = REGIONS.includes(regionKey) ? regionKey : "logo-nl";

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Contact Us" />

      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      <main className="contact-page">
        <Breadcrumb
          title="Contact us"
          description="Questions about events, membership, partnerships, or your local Bulgarian community? Send us a message or contact the team directly."
        />

        <ContactTwo
          contactEmail={contactEmail}
          regionKey={regionKey}
          regionLogo={regionLogo}
          regionName={regionName}
          socialLinks={REGION_SOCIALS[regionKey] || []}
        />
      </main>

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <button
            type="button"
            className="contact-back-to-top"
            aria-label="Back to top"
          >
            <FiChevronUp size={26} />
          </button>
        </ScrollToTop>
      </div>

      <Footer />
    </React.Fragment>
  );
};

export default Contact;
