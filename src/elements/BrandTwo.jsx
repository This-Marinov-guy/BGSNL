import React from "react";

const BRAND_TWO_PARTNERS = [
  {
    href: "https://www.cooltravel.bg/",
    src: "/assets/images/brand/brand-06.png",
    alt: "Cool Travel logo",
    style: { backgroundColor: "#77a02e", borderRadius: "47%", padding: "16px" },
  },
  {
    href: "https://domakin.nl/",
    src: "/assets/images/brand/brand-07.png",
    alt: "Domakin logo",
    style: { borderRadius: "5%" },
  },
  {
    href: "https://ilikemedia.nl/",
    src: "/assets/images/brand/brand-14.png",
    alt: "ILikeMedia logo",
    style: { scale: "1.0" },
  },
  {
    href: "https://studybuddy.bg/",
    src: "/assets/images/brand/brand-04.png",
    alt: "Study Buddy logo",
  },
  {
    href: "https://www.unify.bg/",
    src: "/assets/images/brand/brand-02.png",
    alt: "Unify logo",
  },
  {
    href: "https://www.bghub-eindhoven.nl/",
    src: "/assets/images/brand/brand-11.png",
    alt: "BG Hub Eindhoven logo",
  },
  {
    href: "https://bulgariawantsyou.com/en",
    src: "https://bulgariawantsyou.com/themes/custom/bwy/logo.svg",
    alt: "Bulgaria Wants You logo",
    style: { backgroundColor: "#BFBFBF", padding: "10px", borderRadius: "10px" },
  },
  {
    href: "https://www.societasbulgarica.org/",
    src: "/assets/images/brand/brand-12.png",
    alt: "Societas Bulgarica logo",
    style: { scale: "0.8" },
  },
  {
    href: "https://www.pwc.bg/",
    src: "/assets/images/brand/brand-13.png",
    alt: "PwC logo",
    style: { scale: "1.25" },
  },
  {
    href: "https://sunnybeach-groningen.nl",
    src: "/assets/images/brand/brand-10.png",
    alt: "Sunny Beach Groningen logo",
    style: { scale: "0.88" },
  },
];

const BrandTwo = () => {
  return (
    <div className="rn-brand-area brand-separation brand-two-compact bg_color--5">
      <h3 className="brand-two-title">Partners</h3>
      <ul className="brand-two-grid">
        {BRAND_TWO_PARTNERS.map((partner) => (
          <li key={partner.href} className="brand-two-grid-item">
            <a href={partner.href} target="_blank" rel="noreferrer">
              <span className="brand-two-logo-card">
                <img
                  className="brand-two-logo-image"
                  src={partner.src}
                  alt={partner.alt}
                  style={partner.style || {}}
                />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BrandTwo;
