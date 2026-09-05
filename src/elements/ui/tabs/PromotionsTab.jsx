import PropTypes from "prop-types";
import {
  FiExternalLink,
  IconlyDiscount,
} from "@/elements/ui/icons/IconlyIcons";
import { PROMO_CODES } from "../../../util/defines/PROMO_CODES";
import UserTabHeader from "./UserTabHeader";

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
  <article className="promotion-card settings-card">
    <div className="promotion-card__header">
      <span className="promotion-card__icon" aria-hidden="true">
        <IconlyDiscount size={22} />
      </span>
      <h3>{promo.name}</h3>
    </div>
    {promo?.discount && (
      <p className="promotion-card__discount">
        <strong>Discount:</strong> {promo.discount}
      </p>
    )}
    {promo.code && (
      <div className="promotion-card__code">
        <strong>Code:</strong>
        <code>{promo.code}</code>
      </div>
    )}
    {promo.link && (
      <a
        href={promo.link}
        target="_blank"
        rel="noreferrer"
        className="rn-button-style--2 rn-btn-green promotion-card__link"
      >
        Visit store
        <FiExternalLink size={16} aria-hidden />
      </a>
    )}
  </article>
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
      <UserTabHeader title="Promotions" />
      <div className="tab-body">
        {byCity.length > 0 ? (
          <div className="promotions-by-city">
            {byCity.map(({ city, promos }) => (
              <section key={city} className="promotions-city-section">
                <h3 className="promotions-city-title archive">
                  {capitalizeCity(city)}
                </h3>
                <div className="promotions-grid">
                  {promos.map((promo, idx) => (
                    <PromotionCard key={promo.code || promo.name || idx} promo={promo} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">
              <IconlyDiscount size={44} />
            </div>
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
