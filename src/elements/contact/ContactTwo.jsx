import React from "react";
import PropTypes from "prop-types";
import { IconlyArrowRight, IconlySend } from "@/elements/ui/icons/IconlyIcons";
import {
  getSocialAriaLabel,
  getSocialPlatformName,
} from "../../util/functions/seo-helpers";
import ImageFb from "../ui/media/ImageFb";
import ContactForm from "./ContactForm";

const ContactTwo = ({
  contactEmail,
  regionKey,
  regionLogo,
  regionName,
  socialLinks,
}) => {
  const categorizedLinks = socialLinks.map((item) => ({
    ...item,
    link: item.link.trim(),
    platform: getSocialPlatformName(item.link),
  }));
  const networkLinks = categorizedLinks.filter(
    ({ platform }) => platform !== "Email" && platform !== "GoFundMe"
  );
  const supportLink = categorizedLinks.find(
    ({ platform }) => platform === "GoFundMe"
  );
  const regionLogoSource = `/assets/images/logo/${regionLogo}.${
    regionLogo === "logo-nl" ? "png" : "webp"
  }`;
  const regionLogoFallback =
    {
      breda_tilburg: "/assets/images/logo/breda_tilburg.png",
      eindhoven: "/assets/images/logo/eindhoven.webp",
      "logo-nl": "/assets/images/logo/logo-nl.png",
    }[regionLogo] || `/assets/images/logo/${regionLogo}.jpg`;

  return (
    <section className="contact-content" aria-label="Contact options">
      <div className="container">
        <div className="contact-layout">
          <section
            className="contact-form-panel"
            aria-labelledby="contact-form-title"
          >
            <div className="contact-section-heading">
              <IconlySend size={32} />
              <div>
                <h2 id="contact-form-title">Send a message</h2>
                <p className="type-body">
                  Share enough detail for the team to route your question to
                  the right person.
                </p>
              </div>
            </div>
            <ContactForm />
          </section>

          <aside
            className="contact-details-panel"
            aria-labelledby="contact-details-title"
          >
            <div className="contact-details-panel__heading">
              <h2 id="contact-details-title">Contact {regionName}</h2>
            </div>

            <div className="contact-details-panel__identity">
              <ImageFb
                alt={`Bulgarian Society ${regionName} logo`}
                className="contact-details-panel__logo"
                eager
                fallback={regionLogoFallback}
                fetchPriority="high"
                height={160}
                src={regionLogoSource}
                type={regionLogo === "logo-nl" ? "image/png" : "image/webp"}
                width={160}
              />

              <a className="contact-email-link" href={`mailto:${contactEmail}`}>
                <span className="type-body">{contactEmail}</span>
              </a>
            </div>

            {networkLinks.length > 0 ? (
              <div className="contact-link-group">
                <h3 className="contact-link-group__title type-subheading">
                  Find us online
                </h3>
                <ul className="contact-social-links">
                  {networkLinks.map((item) => (
                    <li key={item.link}>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={getSocialAriaLabel(item.link, regionKey)}
                      >
                        <span aria-hidden="true">{item.Social}</span>
                        <span>{item.platform}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {supportLink ? (
              <div className="contact-link-group contact-support-link">
                <h3 className="contact-link-group__title type-subheading">
                  Support our work
                </h3>
                <a
                  href={supportLink.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span aria-hidden="true">{supportLink.Social}</span>
                  <span>Contribute on GoFundMe</span>
                  <IconlyArrowRight size={20} />
                </a>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
};

ContactTwo.propTypes = {
  contactEmail: PropTypes.string.isRequired,
  regionKey: PropTypes.string.isRequired,
  regionLogo: PropTypes.string.isRequired,
  regionName: PropTypes.string.isRequired,
  socialLinks: PropTypes.arrayOf(
    PropTypes.shape({
      link: PropTypes.string.isRequired,
      Social: PropTypes.node.isRequired,
    })
  ).isRequired,
};

export default ContactTwo;
