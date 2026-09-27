import {
  useEffect,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Link } from "@/util/navigation";
import { LOCAL_STORAGE_COOKIE_CONSENT } from "../../../util/defines/common";

const CookiesModal = () => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Check if consent is already stored
    const consent = localStorage.getItem(LOCAL_STORAGE_COOKIE_CONSENT);
    const suppressBanner = pathname?.startsWith("/c/") || pathname?.includes("terms-and-legals");

    setVisible(!consent && !suppressBanner);
  }, [pathname]);

  const handleAcceptAll = () => {
    localStorage.setItem(LOCAL_STORAGE_COOKIE_CONSENT, "1");
    window.dispatchEvent(new Event("bgsnl-cookie-consent-change"));
    setVisible(false);
    // Reload to activate tracking scripts if needed, or rely on next visit/navigation
    // Ideally, we'd trigger the tracking initialization here, but a reload ensures clean state
    // window.location.reload();
  };

  const handleMandatoryOnly = () => {
    localStorage.setItem(LOCAL_STORAGE_COOKIE_CONSENT, "mandatory");
    window.dispatchEvent(new Event("bgsnl-cookie-consent-change"));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="cookie-banner"
          initial={{ opacity: 0, y: reducedMotion ? 0 : "100%" }}
          animate={{
            opacity: 1,
            y: 0,
            transition: reducedMotion
              ? { duration: 0.16 }
              : { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
          }}
          exit={{
            opacity: 0,
            y: reducedMotion ? 0 : "100%",
            transition: reducedMotion
              ? { duration: 0.12 }
              : { duration: 0.22, ease: [0.4, 0, 1, 1] },
          }}
        >
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-8 col-md-12">
                <div className="content">
                  <h4 className="title">Cookie Consent</h4>
                  <p>
                    Choose whether to allow optional analytics. Essential storage is
                    used to keep the website secure and working.
                    <Link to="/terms-and-legals#cookies" className="ml--5 theme-color">
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>
              <div className="col-lg-4 col-md-12">
                <div className="btns-wrapper">
                  <button
                    className="rn-btn rn-btn-small btn-secondary mr--10"
                    onClick={handleMandatoryOnly}
                  >
                    Mandatory
                  </button>
                  <button
                    className="rn-btn rn-btn-small"
                    onClick={handleAcceptAll}
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookiesModal;
