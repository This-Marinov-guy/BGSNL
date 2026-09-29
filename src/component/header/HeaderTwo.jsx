import {
  Fragment,
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import {
  FiMenu,
  FiX,
} from "@/elements/ui/icons/IconlyIcons";
import {
  Link,
  useParams,
} from "@/util/navigation";
import ImageFb from "../../elements/ui/media/ImageFb";
import { HOLIDAYS } from "../../util/configs/common";
import { getActiveStrap } from "../../util/defines/CAMPAIGNS";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import HeaderContent from "./HeaderContent";

const HeaderTwo = (props) => {
  const [isMenuOpened, setIsMenuOpened] = useState();
  const [isWinter, setIsWinter] = useState(false);

  useEffect(() => {
    setIsWinter(HOLIDAYS.isWinter);
  }, []);

  const headerRef = useRef(null);
  const params = useParams();
  const requestedRegion = props.forceRegion ?? params.region;
  const region = REGIONS.includes(requestedRegion) ? requestedRegion : null;

  const activeStrap = getActiveStrap();

  useEffect(() => {
    const redHeader = headerRef.current?.querySelector(".header-red");
    const strap = document.querySelector(".nav-strap");
    if (!activeStrap || !redHeader || !strap) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      redHeader.style.top = `${Math.max(0, strap.clientHeight - window.scrollY)}px`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(strap);
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
      redHeader.style.top = "";
    };
  }, [activeStrap]);

  // Delegate once so account-menu changes do not require rebinding every link.
  useEffect(() => {
    const header = headerRef.current;
    const toggleDropdown = (event) => {
      const trigger = event.target.closest?.(
        ".has-dropdown > .submenu-toggle, .has-dropdown > a:not([href])"
      );
      if (!trigger || !header.contains(trigger)) return;
      const parent = trigger.parentElement;
      const submenu = parent.querySelector(":scope > .submenu");
      if (!submenu) return;
      const expanded = submenu.classList.toggle("active");
      parent.querySelector(":scope > a")?.classList.toggle("open", expanded);
      const button = parent.querySelector(":scope > .submenu-toggle");
      if (button) {
        button.setAttribute("aria-expanded", String(expanded));
        button.setAttribute(
          "aria-label",
          `${expanded ? "Collapse" : "Expand"} ${button.dataset.submenuLabel} submenu`
        );
      }
    };
    header?.addEventListener("click", toggleDropdown);
    return () => header?.removeEventListener("click", toggleDropdown);
  }, []);
  let logoUrl = (
    <ImageFb
      className="logo"
      src={`/assets/images/logo/${
        region && REGIONS.includes(region)
          ? region
          : isWinter
          ? "logo-xmas"
          : "logo"
      }.webp`}
      fallback={`/assets/images/logo/${
        region && REGIONS.includes(region)
          ? region
          : isWinter
          ? "logo-xmas"
          : "logo"
      }.jpg`}
      alt="Logo"
    />
  );

  return (
    <Fragment>
      <header
        ref={headerRef}
        className={`header-area formobile-menu header--transparent default-color ${
          activeStrap ? "m--25" : ""
        }`}
      >
        <div
          className={`${isMenuOpened ? "menu-open " : ""}header-wrapper${props.centerContent ? " header-wrapper--center-content" : ""}`}
          id="header-wrapper"
        >
          <div className="header-left">
            <Link className="logo" to={region ? `/${region}` : "/"}>
              {logoUrl}
            </Link>
          </div>

          {props.centerContent}

          <div className="header-right header-red">
            <HeaderContent forceRegion={region} />

            {/* Start Humberger Menu  */}
            <div className="humberger-menu d-block d-xl-none pl--20">
              <span
                onClick={() => {
                  setIsMenuOpened(true);
                }}
                className="menutrigger text-red"
              >
                <FiMenu />
              </span>
            </div>
            {/* End Humberger Menu  */}
            <div className="close-menu d-block d-xl-none">
              <span
                onClick={() => {
                  setIsMenuOpened(false);
                }}
                className="closeTrigger"
              >
                <FiX />
              </span>
            </div>
          </div>
        </div>
      </header>
      <div className="container header-middle"></div>
    </Fragment>
  );
};

HeaderTwo.propTypes = {
  forceRegion: PropTypes.string,
  centerContent: PropTypes.node,
};

export default HeaderTwo;
