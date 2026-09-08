import { useEffect, useRef, useState } from "react";
import { useHttpClient } from "@/hooks/common/http-hook";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import {
  FiExternalLink,
  IconlyCopy,
  IconlyDiscount,
  IconlyLocation,
} from "@/elements/ui/icons/IconlyIcons";
import { showNotification } from "../../../redux/notification";
import UserTabHeader from "./UserTabHeader";

const capitalizeCity = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const getPromosByCity = (codes = {}) => {
  return Object.entries(codes).map(([city, value]) => {
    const promos = Array.isArray(value) ? value : [value];
    return { city, promos };
  });
};

const PromotionCard = ({ promo }) => {
  const dispatch = useDispatch();

  const copyCode = async () => {
    if (!promo.code || !navigator.clipboard) {
      dispatch(
        showNotification({
          severity: "error",
          detail: "Could not copy the discount code. Please try again.",
        })
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(promo.code);
      dispatch(
        showNotification({
          severity: "info",
          detail: "Discount code copied to your clipboard.",
        })
      );
    } catch {
      dispatch(
        showNotification({
          severity: "error",
          detail: "Could not copy the discount code. Please try again.",
        })
      );
    }
  };

  return (
    <article className="promotion-card">
      <header className="promotion-card__header">
        <span className="promotion-card__icon" aria-hidden="true">
          <IconlyDiscount size={22} />
        </span>
        <h3>{promo.name}</h3>
        {promo?.discount && (
          <p className="promotion-card__offer archive">
            <span>Save</span>
            <strong>{promo.discount}</strong>
          </p>
        )}
      </header>

      {(promo.code || promo.link) && (
        <div className="promotion-card__actions">
          {promo.code && (
            <div className="promotion-card__code">
              <span className="promotion-card__code-label">Code</span>
              <code>{promo.code}</code>
              <button
                aria-label={`Copy ${promo.name} discount code`}
                className="promotion-card__copy"
                onClick={copyCode}
                title="Copy discount code"
                type="button"
              >
                <IconlyCopy aria-hidden size={18} />
              </button>
            </div>
          )}

          {promo.link && (
            <a
              href={promo.link}
              target="_blank"
              rel="noreferrer"
              className="rn-button-style--2 rn-btn-reverse-green rn-btn-small promotion-card__link"
            >
              Open offer
              <FiExternalLink size={16} aria-hidden />
            </a>
          )}
        </div>
      )}
    </article>
  );
};

PromotionCard.propTypes = {
  promo: PropTypes.shape({
    name: PropTypes.string,
    code: PropTypes.string,
    link: PropTypes.string,
    discount: PropTypes.string,
  }).isRequired,
};

const PromotionsTab = () => {
  const { sendRequest } = useHttpClient();
  const request = useRef(sendRequest);
  request.current = sendRequest;
  const [codes, setCodes] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let mounted = true;
    setFailed(false);
    request.current("user/promotions", "GET", null, {}, false, false).then((response) => {
      if (!mounted) return;
      if (!response?.promotions) { setFailed(true); return; }
      setCodes(response.promotions);
    });
    return () => { mounted = false; };
  }, [attempt]);
  const byCity = getPromosByCity(codes || {});

  return (
    <div className="tab-content-wrapper">
      <UserTabHeader title="Promotions" />
      <div className="tab-body">
        {failed ? <div role="status"><p>Promotions could not be loaded. An active subscription is required.</p><button className="rn-button-style--2 rn-btn-reverse-green rn-btn-small" onClick={() => setAttempt((value) => value + 1)} type="button">Try again</button></div> : !codes ? <p role="status">Loading your promotions…</p> : byCity.length > 0 ? (
          <div className="promotions-by-city">
            {byCity.map(({ city, promos }) => (
              <section key={city} className="promotions-city-section">
                <h3 className="promotions-city-title archive">
                  <IconlyLocation aria-hidden size={20} />
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
