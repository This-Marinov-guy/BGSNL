"use client";

import { useEffect, useState } from "react";
import { LOCAL_STORAGE_COOKIE_CONSENT } from "../../util/defines/common";

const Cookies = () => {
  const [consent, setConsent] = useState(null);

  useEffect(() => setConsent(window.localStorage.getItem(LOCAL_STORAGE_COOKIE_CONSENT)), []);

  const choose = (value) => {
    window.localStorage.setItem(LOCAL_STORAGE_COOKIE_CONSENT, value);
    window.dispatchEvent(new Event("bgsnl-cookie-consent-change"));
    setConsent(value);
  };

  return (
    <div className="container">
      <h2 className="center_text">Cookie Policy for Bulgarian Society Netherlands</h2>
      <h5 style={{ textAlign: "right" }}>Effective: September 10, 2026</h5>
      <div className="mt--80 mb--80">
        <h3>1. Your choice</h3>
        <p className="ml--20">
          Cookies and similar technologies help our website work and, where you
          choose it, help us understand aggregated website use. Essential storage
          is used to provide security, account and consent functions. Optional
          analytics is not required to use the website. Continuing to browse is
          not treated as consent for optional cookies.
        </p>
        <p className="ml--20">
          Current choice: <strong>{consent === "1" ? "optional analytics accepted" : "essential only"}</strong>.
        </p>
        <div className="ml--20 btn_row">
          <button type="button" className="rn-btn rn-btn-green" onClick={() => choose("mandatory")}>Use essential only</button>
          <button type="button" className="rn-btn rn-btn-solid-green" onClick={() => choose("1")}>Accept optional analytics</button>
        </div>

        <h3 className="mt--40">2. Categories and providers</h3>
        <ul className="list-style--1 ml--20">
          <li><strong>Essential storage:</strong> session, security, payment-return and consent preferences needed to operate the website and protect accounts.</li>
          <li><strong>Optional analytics:</strong> Google Analytics, Microsoft Clarity, Ahrefs Analytics and Datafast may be loaded only after you choose optional analytics. They help us measure website use and improve the service.</li>
          <li><strong>Third-party payment and sign-in services:</strong> Stripe, Google and similar providers can set or read technologies necessary for the service you actively request, under their own notices and settings.</li>
        </ul>

        <h3 className="mt--40">3. Managing cookies</h3>
        <p className="ml--20">
          You can change your choice above at any time. Changing to essential
          only stops future optional analytics loading in this browser; providers
          may retain data already received under their own retention rules. You
          can also delete or block cookies in your browser. Blocking essential
          storage can prevent sign-in, payment, security or preference features
          from working correctly.
        </p>

        <h3 className="mt--40">4. More information</h3>
        <p className="ml--20">
          See the Privacy Policy on this page for information about personal data,
          legal bases, recipients and your privacy rights. We review this Cookie
          Policy when our technologies or legal obligations change.
        </p>
      </div>
    </div>
  );
};

export default Cookies;
