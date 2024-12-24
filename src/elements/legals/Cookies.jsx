import React from "react";

const Cookies = () => {
  return (
    <div className="container">
      <h2 className="center_text">
        Cookie Policy for Bulgarian Society Netherlands
      </h2>
      <h5 style={{ textAlign: "right" }}>Last updated: December 24, 2024</h5>
      <div className="mt--80 mb--80">
        <p className="ml--20">
          We use cookies to enhance your experience on our website. Cookies are
          small text files that help us provide you with a better user
          experience by remembering your preferences and analyzing website
          traffic.
        </p>
        <h4 className="mt--20">Types of Cookies We Use:</h4>
        <ul className="list-style--1 ml--20">
          <li>
            <strong>Essential Cookies:</strong> Required for the website to
            function properly.
          </li>
          <li>
            <strong>Performance Cookies:</strong> Help us understand website
            usage and improve functionality.
          </li>
          <li>
            <strong>Functional Cookies:</strong> Remember user preferences for a
            personalized experience.
          </li>
          <li>
            <strong>Advertising Cookies:</strong> Deliver relevant ads and track
            their effectiveness.
          </li>
        </ul>
        <p className="ml--20">
          Please note that disabling cookies is not an option.
        </p>
      </div>
    </div>
  );
};

export default Cookies;
