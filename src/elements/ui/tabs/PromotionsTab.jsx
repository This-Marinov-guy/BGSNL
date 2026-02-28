import React from "react";
import PropTypes from "prop-types";
import { PROMO_CODES } from "../../../util/defines/PROMO_CODES";
import { FiExternalLink, FiTag } from "react-icons/fi";

const capitalizeCity = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const getPromosByCity = () => {
  const codes = PROMO_CODES || {};
  return Object.entries(codes).map(([city, value]) => {
    const promos = Array.isArray(value) ? value : [value];
    return { city, promos };
  });
};

const PromotionCard = ({ promo }) => (
  <div
    className="promotion-card settings-card"
    style={{
      padding: "24px",
      borderRadius: "12px",
      border: "1px solid rgba(0,0,0,0.08)",
      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
      <span style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #017363, #025420)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FiTag size={20} color="#fff" />
      </span>
      <h3 style={{ margin: 0, fontWeight: 600, color: "var(--color-heading)" }}>
        {promo.name}
      </h3>
    </div>
    {promo?.discount && (
      <p style={{ margin: 0, color: "var(--color-body)" }}>
        <strong>Discount:</strong> {promo.discount}
      </p>
    )}
    {promo.code && (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <strong style={{ fontSize: "18px", color: "#374151" }}>Code:</strong>
        <code
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            background: "#f3f4f6",
            fontWeight: 600,
            letterSpacing: "0.5px",
            color: "#017363",
          }}
        >
          {promo.code}
        </code>
      </div>
    )}
    {promo.link && (
      <a
        href={promo.link}
        target="_blank"
        rel="noreferrer"
        className="rn-button-style--2 rn-btn-green"
        style={{
          marginTop: "auto",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          justifyContent: "center",
          textDecoration: "none",
        }}
      >
        Visit store
        <FiExternalLink size={16} />
      </a>
    )}
  </div>
);

PromotionCard.propTypes = {
  promo: PropTypes.shape({
    name: PropTypes.string,
    code: PropTypes.string,
    link: PropTypes.string,
    discount: PropTypes.string,
  }).isRequired,
};

const PromotionsTab = () => {
  const byCity = getPromosByCity();

  return (
    <div className="tab-content-wrapper">
      <div className="tab-header">
        <h2>Promotions</h2>
        <p>Exclusive discounts and offers for BGSNL members from our partners.</p>
      </div>
      <div className="tab-body">
        {byCity.length > 0 ? (
          <div className="promotions-by-city">
            {byCity.map(({ city, promos }) => (
              <section key={city} className="promotions-city-section" style={{ marginBottom: "32px" }}>
                <h3
                  className="promotions-city-title archive"
                  style={{
                    fontSize: "22px",
                    color: "var(--color-heading)",
                    marginBottom: "16px",
                    paddingBottom: "8px",
                    borderBottom: "2px solid rgba(1, 115, 99, 0.2)",
                  }}
                >
                  {capitalizeCity(city)}
                </h3>
                <div
                  className="promotions-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "24px",
                  }}
                >
                  {promos.map((promo, idx) => (
                    <PromotionCard key={promo.code || promo.name || idx} promo={promo} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎁</div>
            <h3>No promotions right now</h3>
            <p>Check back later for exclusive member discounts and offers.</p>
          </div>
        )}
      </div>
    </div>
  );
};

PromotionsTab.propTypes = {};

export default PromotionsTab;
