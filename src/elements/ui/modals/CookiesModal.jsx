import {
  useEffect,
  useState,
} from "react";
import { Link } from "@/util/navigation";
import { LOCAL_STORAGE_COOKIE_CONSENT } from "../../../util/defines/common";

const CookiesModal = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if consent is already stored
    const consent = localStorage.getItem(LOCAL_STORAGE_COOKIE_CONSENT);
    const isLegalPage = window.location.pathname.includes("terms-and-legals");
    
    if (!consent && !isLegalPage) {
      setVisible(true);
    }
  }, []);

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

  if (!visible) return null;

  return (
    <div className="cookie-banner">
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
                Mandatory Only
              </button>
              <button 
                className="rn-btn rn-btn-small" 
                onClick={handleAcceptAll}
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesModal;
