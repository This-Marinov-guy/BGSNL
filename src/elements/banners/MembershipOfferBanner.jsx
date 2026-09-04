import PropTypes from "prop-types";
import TicketMotionIcon from "@/elements/ui/icons/TicketMotionIcon";
import { Link } from "@/util/navigation";

const DEFAULT_BENEFITS = [
  "exclusive access to events and merchandise",
  "internship opportunities",
  "ticket collection that lasts",
];

const MembershipOfferBanner = ({
  actionHref = "/signup",
  actionLabel = "Become a member",
  benefits = DEFAULT_BENEFITS,
  buttonVariant = "red",
  className = "",
  description = "With your membership you also receive",
  onAction,
  title,
}) => {
  const buttonClass =
    buttonVariant === "green" ? "rn-btn-reverse-green" : "rn-btn-reverse-red";

  return (
    <aside
      className={`membership-offer-banner ${className}`.trim()}
      aria-label="Membership benefits"
    >
      <div className="membership-offer-copy type-caption">
        <div className="membership-banner-heading">
          <span className="membership-offer-icon" aria-hidden="true">
            <TicketMotionIcon className="membership-offer-motion-icon" />
          </span>
          <strong className="membership-banner-title">{title}</strong>
        </div>

        {actionHref && (
          <Link
            to={actionHref}
            onClick={onAction}
            className={`rn-button-style--2 ${buttonClass} membership-offer-action type-caption`}
          >
            {actionLabel}
          </Link>
        )}

        <p className="type-caption">{description}</p>
        <ul className="type-caption">
          {benefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

MembershipOfferBanner.propTypes = {
  actionHref: PropTypes.string,
  actionLabel: PropTypes.string,
  benefits: PropTypes.arrayOf(PropTypes.string),
  buttonVariant: PropTypes.oneOf(["green", "red"]),
  className: PropTypes.string,
  description: PropTypes.string,
  onAction: PropTypes.func,
  title: PropTypes.string.isRequired,
};

export default MembershipOfferBanner;
