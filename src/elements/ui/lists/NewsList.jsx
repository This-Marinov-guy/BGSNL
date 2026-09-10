"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import {
  IconlyArrowLeft,
  IconlyArrowRight,
  IconlyMaximize,
  IconlyMinimize,
} from "@/elements/ui/icons/IconlyIcons";
import {
  Link,
  useLocation,
} from "@/util/navigation";
import { showModal } from "../../../redux/modal";
import { selectIsAuth } from "../../../redux/user";
import { CAMPAIGNS } from "../../../util/defines/CAMPAIGNS";
import {
  DONATION_MODAL,
  WEB_DEV_MODAL,
} from "../../../util/defines/common";
import { REGION_INSTAGRAM } from "../../../util/defines/REGIONS_DESIGN";
import "./NewsList.css";

const NewsList = ({ withTitle = true }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAuth = useSelector(selectIsAuth);
  const pagesRef = useRef(null);
  const pendingPageRef = useRef(null);
  const scrollFrameRef = useRef(0);
  const [activePage, setActivePage] = useState(0);
  const [isFullView, setIsFullView] = useState(false);

  const activeCampaignNews = CAMPAIGNS.filter((campaign) =>
    Boolean(campaign?.modal.active)
  ).map((campaign) => campaign.news);

  const news = [
    ...activeCampaignNews,
    {
      image: "/assets/images/news/internships.jpg",
      title: "BGSNL Internships",
      description:
        "Looking for a first role or an internship? Explore opportunities selected for our members and register your area of interest.",
      links: [{ name: "Explore internships", href: "/user#internships" }],
      isForMember: true,
    },
    {
      image:
        "https://images.gofundme.com/3DeeQatkuCV2f1cFGQpHo_V8lao=/720x405/https://d2g8igdw686xgo.cloudfront.net/83216271_172803224437761_r.png",
      title: "Support our mission",
      description:
        "Help us keep building events, connections and practical support for Bulgarians across the Netherlands.",
      links: [{ name: "Support BGSNL", href: "" }],
      action: () => dispatch(showModal(DONATION_MODAL)),
      isForMember: true,
    },
    {
      image: "/assets/images/profile/from-bg-to-nl/1.webp",
      title: "From Bulgaria to the Netherlands",
      description:
        "Why are more young Bulgarians choosing the Netherlands, and what do they find after arriving?",
      links: [
        {
          name: "Read the story",
          href: "/articles/from-bulgaria-to-the-netherlands",
        },
      ],
      isForMember: true,
    },
    {
      image: "/assets/images/bg/bg-image-9.webp",
      title: "Membership is open",
      description:
        "Join the national Bulgarian student community and take part in events, partnerships and member opportunities.",
      links: [{ name: "Become a member", href: "/signup" }],
      isForMember: true,
    },
    {
      image: "/assets/images/news/designer.png",
      title: "Help build the platform",
      description:
        "Contribute your web and design experience to the platform that connects our community.",
      links: [{ name: "Apply to contribute", href: "" }],
      action: () => dispatch(showModal(WEB_DEV_MODAL)),
      isForMember: true,
    },
  ];

  const memberNews = news.filter((item) => item.isForMember);
  const newsItems =
    isAuth && location.pathname === "/user" ? memberNews : news;
  const pageCount = newsItems.length + 1;

  useEffect(() => {
    return () => window.cancelAnimationFrame(scrollFrameRef.current);
  }, []);

  useEffect(() => {
    if (!isFullView) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeFullView = (event) => {
      if (event.key === "Escape") {
        setIsFullView(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeFullView);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeFullView);
    };
  }, [isFullView]);

  const toggleFullscreen = () => {
    const pageToKeep = pendingPageRef.current ?? activePage;
    pendingPageRef.current = pageToKeep;
    setIsFullView((currentValue) => !currentValue);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const target = pagesRef.current?.children[pageToKeep];
        if (!target) return;

        target.scrollIntoView({
          behavior: "auto",
          block: "nearest",
          inline: "center",
        });
        setActivePage(pageToKeep);
      });
    });
  };

  const goToPage = (pageIndex) => {
    const track = pagesRef.current;
    const target = track?.children[pageIndex];
    if (!target) return;

    pendingPageRef.current = pageIndex;
    setActivePage(pageIndex);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const handlePagesScroll = () => {
    window.cancelAnimationFrame(scrollFrameRef.current);
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      const track = pagesRef.current;
      if (!track) return;

      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closestPage = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      Array.from(track.children).forEach((page, index) => {
        const pageCenter = page.offsetLeft + page.offsetWidth / 2;
        const distance = Math.abs(trackCenter - pageCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestPage = index;
        }
      });

      if (
        pendingPageRef.current !== null &&
        closestPage !== pendingPageRef.current
      ) {
        return;
      }

      pendingPageRef.current = null;

      setActivePage(closestPage);
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToPage(Math.min(pageCount - 1, activePage + 1));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPage(Math.max(0, activePage - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      goToPage(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goToPage(pageCount - 1);
    }
  };

  const renderStoryAction = (item) => {
    const link = item.links?.[0];
    const label = link?.name || "Read more";

    if (item.action) {
      return (
        <button className="newspaper-page__action" onClick={item.action}>
          {label}
        </button>
      );
    }

    if (!link?.href) return null;

    if (link.isExternal) {
      return (
        <a
          className="newspaper-page__action"
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      );
    }

    return (
      <Link className="newspaper-page__action" to={link.href}>
        {label}
      </Link>
    );
  };

  return (
    <section
      className={`news-newspaper${withTitle ? "" : " news-newspaper--embedded"}${isFullView ? " is-full-view" : ""}`}
      aria-labelledby="news-newspaper-title"
      aria-modal={isFullView ? "true" : undefined}
      role={isFullView ? "dialog" : undefined}
    >
      <div
        ref={pagesRef}
        className="news-newspaper__pages"
        onScroll={handlePagesScroll}
        onKeyDown={handleKeyDown}
        tabIndex="0"
        aria-label="BGSNL news pages"
      >
        <article className="newspaper-page newspaper-page--cover">
          <div className="newspaper-page__masthead">
            <span>The</span>
            <h2 id="news-newspaper-title">Bulgarian Bulletin</h2>
            <p>Netherlands</p>
          </div>

          <div className="newspaper-page__cover-grid">
            <div>
              <h3>News from across our community.</h3>
            </div>
            <div className="newspaper-page__introduction">
              <p>
                A living record of opportunities, stories and ways to take
                part in Bulgarian life across the Netherlands.
              </p>
              {/* <p className="newspaper-page__direction">
                Scroll, swipe or use the arrows to read the edition.
              </p> */}
            </div>
          </div>

          <div className="newspaper-page__cover-footer">
            <span>{newsItems.length} stories inside</span>
            {withTitle && (
              <a
                href={REGION_INSTAGRAM.netherlands ?? ""}
                target="_blank"
                rel="noopener noreferrer"
              >
                Follow the newsroom
              </a>
            )}
          </div>
        </article>

        {newsItems.map((item, index) => (
          <article
            className="newspaper-page newspaper-page--story"
            key={`${item.title}-${index}`}
            aria-label={`Page ${index + 2}: ${item.title}`}
          >
            <header className="newspaper-page__story-header">
              <span>{index + 2}</span>
            </header>

            <div className="newspaper-page__story-grid">
              <figure className="newspaper-page__image">
                <img
                  src={item.image}
                  alt={`${item.title} — BGSNL news`}
                  onError={(event) => {
                    if (item.fallbackImage) {
                      event.currentTarget.src = item.fallbackImage;
                    } else {
                      event.currentTarget.hidden = true;
                    }
                  }}
                />
              </figure>

              <div className="newspaper-page__story-copy">
                <h3>{item.title}</h3>
                <p className="newspaper-page__description">
                  {item.description}
                </p>
                {renderStoryAction(item)}
              </div>
            </div>

          </article>
        ))}
      </div>

      <div className="news-newspaper__navigation">
        <button
          className="news-newspaper__arrow"
          type="button"
          onClick={() => goToPage(Math.max(0, activePage - 1))}
          disabled={activePage === 0}
          aria-label="Previous news page"
          title="Previous page"
        >
          <IconlyArrowLeft size="1em" aria-hidden="true" />
        </button>

        <div className="news-newspaper__pagination" aria-label="News pages">
          {Array.from({ length: pageCount }).map((_, index) => (
            <button
              type="button"
              key={index}
              className={index === activePage ? "is-active" : ""}
              onClick={() => goToPage(index)}
              aria-label={`Go to news page ${index + 1}`}
              aria-current={index === activePage ? "page" : undefined}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <div className="news-newspaper__navigation-actions">
          <button
            className="news-newspaper__fullscreen"
            type="button"
            onClick={toggleFullscreen}
            aria-label={
              isFullView
                ? "Exit full screen newspaper view"
                : "Open full screen newspaper view"
            }
            aria-pressed={isFullView}
            title={isFullView ? "Exit full view" : "Open full view"}
          >
            {isFullView ? (
              <IconlyMinimize size="1em" aria-hidden="true" />
            ) : (
              <IconlyMaximize size="1em" aria-hidden="true" />
            )}
          </button>

          <button
            className="news-newspaper__arrow"
            type="button"
            onClick={() =>
              goToPage(Math.min(pageCount - 1, activePage + 1))
            }
            disabled={activePage === pageCount - 1}
            aria-label="Next news page"
            title="Next page"
          >
            <IconlyArrowRight size="1em" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};

NewsList.propTypes = {
  withTitle: PropTypes.bool,
};

export default NewsList;
