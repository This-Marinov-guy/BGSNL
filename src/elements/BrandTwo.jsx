import React from "react";
import { PARTNERS } from "../util/defines/PARTNERS";

const BrandTwo = () => {
  return (
    <div className="rn-brand-area brand-separation brand-two-compact bg_color--5">
      <h3 className="brand-two-title">Partners</h3>
      <ul className="brand-two-grid">
        {PARTNERS.map((partner) => (
          <li key={partner.url} className="brand-two-grid-item">
            <a href={partner.url} target="_blank" rel="noreferrer">
              <span className="brand-two-logo-card">
                <img
                  className="brand-two-logo-image"
                  src={partner.logo}
                  alt={partner.name}
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
