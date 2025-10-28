import React, { useState } from "react";
import emailjs from "emailjs-com";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import Loader from "../ui/loading/Loader";
import { REGION_EMAIL } from "../../util/defines/REGIONS_DESIGN";

function ContactForm(props) {
  const [result, showresult] = useState(null);
  const { region = "netherlands" } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const Result = () => {
    return (
      <p className="success-message">
        Your Message has been successfully sent. We will come back to your message soon!
      </p>
    );
  };

  const FailResult = () => {
    return (
      <p className="fail-message">
        Your Message could not be sent. Please try again or email us at{" "}
        <a
          href={`mailto:${REGION_EMAIL[region ?? "netherlands"]}`}
          target="_blank"
          rel="noreferrer"
        >
          {REGION_EMAIL[region ?? "netherlands"]}
        </a>
      </p>
    );
  };

  const sendEmail = async (e) => {
    setIsLoading(true);

    e.preventDefault();
    const serviceID = process.env.REACT_APP_SERVICE || "default_service";
    const templateID = process.env.REACT_APP_TEMPLATE || "default_template";
    const userID = process.env.REACT_APP_PUBLIC_KEY || "default_key";

    await emailjs.sendForm(serviceID, templateID, e.target, userID).then(
      (result) => {
        console.log(result.text);

        setIsSubmitted(true);
        e.target.reset();
        showresult("success");
      },
      (error) => {
        console.log(error.text);

        setIsLoading(false);
        showresult("fail");
      }
    );
  };

  setTimeout(() => {
    showresult(null);
  }, 10000);

  return (
    <form action="" onSubmit={sendEmail}>
      <div className="rn-form-group">
        <input type="text" name="name" placeholder="Your Name" required />
      </div>

      <div className="rn-form-group">
        <input type="email" name="email" placeholder="Your Email" required />
      </div>

      <div className="rn-form-group">
        <input
          readOnly={!!props.subject}
          type="text"
          name="subject"
          value={props.subject}
          placeholder="Subject"
          required
        />
      </div>

      <div className="rn-form-group">
        <textarea
          name="message"
          placeholder={props.placeholderMessage || "Your Message"}
          required
        ></textarea>
      </div>

      {/* Hidden field for region */}
      <input type="hidden" name="region" value={region ?? "netherlands"} />

      {!isLoading && !isSubmitted && (
        <div className="rn-form-group">
          <button
            className="rn-button-style--2 rn-btn-reverse-green"
            type="submit"
            value="submit"
            name="submit"
            id="mc-embedded-subscribe"
          >
            Submit Now
          </button>
        </div>
      )}

      {isLoading && !isSubmitted && (
        <div className="rn-form-group">
          <Loader />
        </div>
      )}

      {result && (
        <div className="rn-form-group">
          {result === "success" ? <Result /> : <FailResult />}
        </div>
      )}
    </form>
  );
}
ContactForm.propTypes = {
  subject: PropTypes.string,
  placeholderMessage: PropTypes.string,
};

export default ContactForm;
