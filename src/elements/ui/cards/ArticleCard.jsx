import PropTypes from "prop-types";
import { IconlyArrowRight } from "@/elements/ui/icons/IconlyIcons";
import { Link } from "@/util/navigation";

const ArticleCard = ({
  image,
  fallbackImage = "",
  title,
  description,
  link,
  action,
  isInsideLink = false,
}) => {
  const Destination = isInsideLink ? Link : "a";
  const destinationProps = isInsideLink ? { to: link } : { href: link };

  return (
    <article className="article-card">
      {link ? (
        <Destination
          {...destinationProps}
          className="article-card-image"
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            src={image}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallbackImage;
            }}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </Destination>
      ) : (
        <div className="article-card-image">
          <img src={image} alt="" loading="lazy" decoding="async" />
        </div>
      )}
      <div className="article-card-content">
        <h3>
          {link ? (
            <Destination {...destinationProps}>{title}</Destination>
          ) : (
            title
          )}
        </h3>
        <p>{description}</p>
        {action ? (
          <button type="button" className="article-card-link" onClick={action}>
            Read more
            <IconlyArrowRight size={18} aria-hidden />
          </button>
        ) : link ? (
          <Destination {...destinationProps} className="article-card-link">
            Read more
            <IconlyArrowRight size={18} aria-hidden />
          </Destination>
        ) : null}
      </div>
    </article>
  );
};

ArticleCard.propTypes = {
  image: PropTypes.string,
  fallbackImage: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  link: PropTypes.string,
  action: PropTypes.func,
  isInsideLink: PropTypes.bool,
};

export default ArticleCard;
