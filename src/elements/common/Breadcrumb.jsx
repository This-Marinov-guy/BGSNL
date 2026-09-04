"use client";

import PropTypes from "prop-types";
import { IconlyArrowRight } from "@/elements/ui/icons/IconlyIcons";
import { Link, usePathname } from "@/util/navigation";
import LegacyBreadcrumb from "./LegacyBreadcrumb";

const NON_NAVIGABLE_SEGMENTS = new Set([
  "event-details",
  "events",
  "other-event-details",
]);
const REGION_NAMES = {
  amsterdam: "Amsterdam",
  breda: "Breda",
  breda_tilburg: "Breda & Tilburg",
  eindhoven: "Eindhoven",
  groningen: "Groningen",
  leiden_hague: "Leiden & The Hague",
  leeuwarden: "Leeuwarden",
  maastricht: "Maastricht",
  rotterdam: "Rotterdam",
  "the-hague": "The Hague",
};

const titleCaseSegment = (segment) => {
  const decoded = decodeURIComponent(segment);

  if (REGION_NAMES[decoded]) return REGION_NAMES[decoded];

  return decoded
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
};

const buildPathItems = (pathname, title) => {
  const segments = (pathname ?? "/").split("/").filter(Boolean);

  return [
    { href: "/", label: "Home" },
    ...segments
      .map((segment, index) => ({
        href: `/${segments.slice(0, index + 1).join("/")}`,
        label:
          index === segments.length - 1 ? title : titleCaseSegment(segment),
        segment,
      }))
      .filter(({ segment }) => !NON_NAVIGABLE_SEGMENTS.has(segment)),
  ];
};

const normaliseItems = (items, pathname, title) => {
  if (!items?.length) return buildPathItems(pathname, title);

  const hasHome = items[0]?.href === "/";
  const navigationItems = hasHome
    ? items
    : [{ href: "/", label: "Home" }, ...items];

  return navigationItems.map((item, index) => ({
    ...item,
    current: index === navigationItems.length - 1,
  }));
};

const Breadcrumb = ({
  description,
  extraElement,
  items,
  title,
}) => {
  const pathname = usePathname();
  const navigationItems = normaliseItems(items, pathname, title);

  return (
    <section className="page-breadcrumb" aria-labelledby="page-breadcrumb-title">
      <div className="container page-breadcrumb__container">
        <div className="page-breadcrumb__grid">
          <div className="page-breadcrumb__copy">
            <h1
              id="page-breadcrumb-title"
              className="page-breadcrumb__title archive"
            >
              {title}
            </h1>
            {description ? (
              <p className="page-breadcrumb__description type-lead">
                {description}
              </p>
            ) : null}
          </div>

          <div className="page-breadcrumb__rail">
            <nav className="page-breadcrumb__nav" aria-label="Breadcrumb">
              <ol className="page-breadcrumb__list type-caption weight-semibold">
                {navigationItems.map((item, index) => {
                  const current =
                    item.current ?? index === navigationItems.length - 1;

                  return (
                    <li
                      className="page-breadcrumb__item"
                      key={`${item.href}-${item.label}`}
                    >
                      {index > 0 ? (
                        <IconlyArrowRight
                          className="page-breadcrumb__separator"
                          aria-hidden="true"
                        />
                      ) : null}
                      {current ? (
                        <span aria-current="page">{item.label}</span>
                      ) : (
                        <Link to={item.href}>{item.label}</Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </div>

        {extraElement ? (
          <div className="page-breadcrumb__extra">{extraElement}</div>
        ) : null}
      </div>
    </section>
  );
};

Breadcrumb.propTypes = {
  description: PropTypes.node,
  extraElement: PropTypes.node,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      current: PropTypes.bool,
      href: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  title: PropTypes.string.isRequired,
};

export { LegacyBreadcrumb };
export default Breadcrumb;
