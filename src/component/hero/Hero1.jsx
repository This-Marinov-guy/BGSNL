import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import moment from "moment-timezone";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import {
  Link,
  useParams,
} from "@/util/navigation";
import SnowBackground from "../../elements/ui/backgrounds/SnowBackground";
import ImageFb from "../../elements/ui/media/ImageFb";
import { selectUser } from "../../redux/user";
import { HOLIDAYS } from "../../util/configs/common";
import { capitalizeFirstLetter } from "../../util/functions/capitalize";

const EVENT_ROTATION_INTERVAL_MS = 5000;

const eventDateValue = (event) =>
  new Date(event?.correctedDate || event?.date || "").getTime();

const formatEventDate = (event) =>
  moment(event?.correctedDate || event?.date)
    .tz("Europe/Amsterdam")
    .format("D MMM, HH:mm");

const Hero1 = ({ initialEvents = {} }) => {
  const user = useSelector(selectUser);
  const { region } = useParams();
  const shouldReduceMotion = useReducedMotion();
  const [activeEventIndex, setActiveEventIndex] = useState(0);

  const upcomingEvents = useMemo(() => {
    const source = region
      ? initialEvents?.[region] || []
      : Object.values(initialEvents || {}).flat();
    const now = Date.now();

    return source
      .filter((event) => {
        const date = eventDateValue(event);

        return (
          event?.hidden !== true &&
          (user.session || !event?.memberOnly) &&
          Number.isFinite(date) &&
          date > now
        );
      })
      .sort((first, second) => eventDateValue(first) - eventDateValue(second));
  }, [initialEvents, region, user.session]);

  const eventRotationKey = upcomingEvents.map((event) => event.id).join("|");
  const activeEvent = upcomingEvents.length
    ? upcomingEvents[activeEventIndex % upcomingEvents.length]
    : null;

  useEffect(() => {
    setActiveEventIndex(0);

    if (upcomingEvents.length < 2 || shouldReduceMotion) return undefined;

    const interval = window.setInterval(() => {
      setActiveEventIndex((current) => (current + 1) % upcomingEvents.length);
    }, EVENT_ROTATION_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [eventRotationKey, shouldReduceMotion, upcomingEvents.length]);

  const SlideList = [
    {
      textPosition: "text-center",
      category: "",
      title: `Bulgarian Society ${capitalizeFirstLetter(region, true) || "Netherlands"}`,
      description: "",
      buttonText: user.session ? "Go To Profile" : "Become a Member",
      style: " rn-btn-reverse-green",
      buttonLink: user.session ? `/user` : "/signup",
    },
  ];

  return (
    <div
      style={{ height: "100vh" }}
      className="slider-activation slider-creative-agency"
    >
      {HOLIDAYS.isWinter && <SnowBackground />}
      <ImageFb
        src={`/assets/images/bg/paralax/${region || "netherlands"}.webp`}
        fallback={`/assets/images/bg/paralax/${region || "netherlands"}.jpg`}
        className="home_bg"
      />
      {SlideList.map((value, index) => (
        <div
          className="slide slide-style-2 slider-paralax d-flex align-items-center justify-content-center"
          key={index}
        >
          <div className="">
            <div className="row">
              <div className="col-lg-12">
                <div className={`inner ${value.textPosition}`}>
                  {value.category ? <span>{value.category}</span> : ""}
                  {value.title ? (
                    <h1 className="title theme-gradient type-display">
                      {value.title}
                    </h1>
                  ) : (
                    ""
                  )}
                  {value.description ? (
                    <p className="description">{value.description}</p>
                  ) : (
                    ""
                  )}
                  {user.session ? (
                    <div className="slide-btn">
                      <Link
                        className={"rn-button-style--2 rn-btn-reverse-green"}
                        to={`/user`}
                      >
                        Go to Profile
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <div className="slide-btn">
                        <Link
                          className={"rn-button-style--2 rn-btn-reverse-green"}
                          to={"/join-the-society"}
                        >
                          Join the society
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {activeEvent && (
        <div className="hero-event-line" aria-label="Upcoming city events">
          <div className="hero-event-line__viewport">
            <AnimatePresence initial={false} mode="wait">
              <motion.p
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                className="hero-event-line__copy"
                exit={{ opacity: 0, rotateX: 38, y: -4 }}
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, rotateX: -38, y: 4 }
                }
                key={activeEvent.id}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.32,
                  ease: "easeOut",
                }}
              >
                <span>
                  Next in {capitalizeFirstLetter(activeEvent.region, true)}:
                </span>{" "}
                <Link
                  to={`/${activeEvent.region}/event-details/${activeEvent.slug || activeEvent.id}`}
                >
                  {activeEvent.title}
                </Link>{" "}
                <time dateTime={activeEvent.correctedDate || activeEvent.date}>
                  ({formatEventDate(activeEvent)})
                </time>
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

Hero1.propTypes = {
  initialEvents: PropTypes.objectOf(
    PropTypes.arrayOf(PropTypes.object),
  ),
};

export default Hero1;
