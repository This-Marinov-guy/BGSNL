import moment from "moment";
import PropTypes from "prop-types";
import { Dialog } from "@/compat/primereact";
import {
  IconlyCalendar,
  IconlyChessKing3D,
  IconlyChessKnight3D,
  IconlyChessPawn3D,
  IconlyChessQueen3D,
  IconlyChessRook3D,
} from "@/elements/ui/icons/IconlyIcons";

const getTierDetails = (tier) => {
  const normalizedTier = String(tier ?? "").trim().toLowerCase();
  const numericTier = Number.parseInt(normalizedTier, 10);

  if (normalizedTier === "platinum" || numericTier >= 4) {
    return {
      Icon: IconlyChessKing3D,
      key: "platinum",
      label: "Platinum alumni",
    };
  }
  if (normalizedTier === "gold" || numericTier === 3) {
    return {
      Icon: IconlyChessQueen3D,
      key: "gold",
      label: "Gold alumni",
    };
  }
  if (normalizedTier === "silver" || numericTier === 2) {
    return {
      Icon: IconlyChessRook3D,
      key: "silver",
      label: "Silver alumni",
    };
  }
  if (normalizedTier === "bronze" || numericTier === 1) {
    return {
      Icon: IconlyChessKnight3D,
      key: "bronze",
      label: "Bronze alumni",
    };
  }

  return {
    Icon: IconlyChessPawn3D,
    key: "standard",
    label: "BGSNL alumni",
  };
};

const AlumniUserModal = ({ isOpen, isClosing, user, onClose }) => {
  if (!user) return null;

  const tier = getTierDetails(user.tier);
  const TierIcon = tier.Icon;
  const name = user.name?.trim() || "BGSNL alumnus";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((namePart) => namePart.charAt(0))
    .join("")
    .toUpperCase();
  const joinDate = user.joinDate && moment(user.joinDate).isValid()
    ? moment(user.joinDate).format("DD MMM YYYY")
    : null;
  const quote = user.quote?.trim();

  return (
    <Dialog
      header={name}
      visible={isOpen && !isClosing}
      onHide={onClose}
      dismissableMask
      className={`alumni-profile-dialog alumni-profile-dialog--${tier.key}`}
      contentClassName="alumni-profile-dialog__content"
    >
      <article className="alumni-profile user-modal">
        <div className="alumni-profile__identity">
          <div className="alumni-profile__avatar">
            <span
              className="alumni-profile__initials type-heading-md weight-semibold"
              aria-hidden="true"
            >
              {initials}
            </span>
            {user.avatar && (
              <img
                src={user.avatar}
                alt={`${name} alumni portrait`}
                onError={(event) => {
                  event.currentTarget.hidden = true;
                }}
              />
            )}
          </div>

          <div className="alumni-profile__details">
            <span className="alumni-profile__tier type-caption weight-semibold">
              <TierIcon aria-hidden="true" />
              {tier.label}
            </span>

            {joinDate && (
              <div className="alumni-profile__membership">
                <IconlyCalendar size="1em" aria-hidden="true" />
                <dl>
                  <dt className="type-caption">Member since</dt>
                  <dd className="type-body weight-semibold">{joinDate}</dd>
                </dl>
              </div>
            )}

            <p className="alumni-profile__summary type-body">
              Part of the Bulgarian Society Netherlands alumni community.
            </p>
          </div>
        </div>

        {quote && (
          <figure className="alumni-profile__quote quote-container">
            <span
              className="alumni-profile__quote-mark type-display"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <blockquote className="type-subheading">{quote}</blockquote>
            <figcaption className="type-caption weight-semibold">
              {name}
            </figcaption>
          </figure>
        )}
      </article>
    </Dialog>
  );
};

AlumniUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isClosing: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    avatar: PropTypes.string,
    tier: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    quote: PropTypes.string,
    joinDate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
  }),
  onClose: PropTypes.func.isRequired,
};

export default AlumniUserModal;
