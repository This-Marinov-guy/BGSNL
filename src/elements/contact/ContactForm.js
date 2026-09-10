import React, { useEffect, useId, useState } from "react";
import emailjs from "emailjs-com";
import { useParams } from "@/util/navigation";
import PropTypes from "prop-types";
import Loader from "../ui/loading/Loader";
import { REGION_EMAIL } from "../../util/defines/REGIONS_DESIGN";
import { useHttpClient } from "../../hooks/common/http-hook";

const Result = () => (
  <p className="contact-form__status contact-form__status--success" role="status">
    Your message has been sent. We will get back to you as soon as we can.
  </p>
);

const FailResult = ({ contactEmail }) => (
  <p className="contact-form__status contact-form__status--error" role="alert">
    We could not send your message. Please try again or email us at{" "}
    <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
  </p>
);

FailResult.propTypes = {
  contactEmail: PropTypes.string.isRequired,
};

function ContactForm(props) {
  const [result, showresult] = useState(null);
  const { region = "netherlands" } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { sendRequest } = useHttpClient();
  const formId = useId();
  const regionEmail = REGION_EMAIL[region] || REGION_EMAIL.netherlands;

  const sendEmail = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const serviceID = process.env.NEXT_PUBLIC_SERVICE || "default_service";
    const templateID = process.env.NEXT_PUBLIC_TEMPLATE || "default_template";
    const userID = process.env.NEXT_PUBLIC_PUBLIC_KEY || "default_key";
    const contactPayload = Object.fromEntries(new FormData(form).entries());

    setIsLoading(true);
    showresult(null);

    let validationResponse;
    try {
      validationResponse = await sendRequest(
        "common/contact/validate",
        "POST",
        contactPayload,
        {},
        false,
        false
      );
    } catch {
      validationResponse = null;
    }

    if (!validationResponse?.valid) {
      setIsLoading(false);
      showresult("fail");
      return;
    }

    try {
      const emailResult = await emailjs.send(
        serviceID,
        templateID,
        contactPayload,
        userID
      );
      console.log(emailResult.text);

      setIsSubmitted(true);
      form.reset();
      showresult("success");
    } catch (error) {
      console.log(error?.text || error);
      showresult("fail");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!result) return undefined;
    const timeout = globalThis.setTimeout(() => {
      showresult(null);
      setIsSubmitted(false);
    }, 10000);
    return () => globalThis.clearTimeout(timeout);
  }, [result]);

  return (
    <form
      className="contact-form"
      aria-busy={isLoading}
      onSubmit={sendEmail}
    >
      <div className="contact-form__row">
        <div className="rn-form-group">
          <label htmlFor={`${formId}-name`}>
            Name
          </label>
          <input
            autoComplete="name"
            className="bgsnl-form-control"
            disabled={isLoading}
            id={`${formId}-name`}
            type="text"
            name="name"
            placeholder="Your name"
            minLength={2}
            maxLength={100}
            required
          />
        </div>

        <div className="rn-form-group">
          <label htmlFor={`${formId}-email`}>
            Email
          </label>
          <input
            autoComplete="email"
            className="bgsnl-form-control"
            disabled={isLoading}
            id={`${formId}-email`}
            type="email"
            name="email"
            placeholder="Your email"
            maxLength={254}
            required
          />
        </div>
      </div>

      <div className="rn-form-group">
        <label htmlFor={`${formId}-subject`}>
          Subject
        </label>
        <input
          className="bgsnl-form-control"
          disabled={isLoading}
          readOnly={!!props.subject}
          id={`${formId}-subject`}
          type="text"
          name="subject"
          defaultValue={props.subject || ""}
          placeholder="What can we help with?"
          minLength={2}
          maxLength={200}
          required
        />
      </div>

      <div className="rn-form-group">
        <label htmlFor={`${formId}-message`}>
          Message
        </label>
        <textarea
          className="bgsnl-form-control"
          disabled={isLoading}
          id={`${formId}-message`}
          name="message"
          placeholder={props.placeholderMessage || "Write your message"}
          minLength={10}
          maxLength={5000}
          required
        ></textarea>
      </div>

      {/* Hidden field for region */}
      <input type="hidden" name="region" value={region ?? "netherlands"} />

      {!isLoading && !isSubmitted && (
        <div className="rn-form-group contact-form__actions">
          <button
            className="rn-button-style--2 rn-btn-reverse-green contact-form__submit"
            type="submit"
            name="submit"
            id={`${formId}-submit`}
          >
            <span>Send message</span>
          </button>
        </div>
      )}

      {isLoading && !isSubmitted && (
        <div className="rn-form-group contact-form__loading" aria-live="polite">
          <Loader />
        </div>
      )}

      {result ? (
        <div className="rn-form-group">
          {result === "success" ? (
            <Result />
          ) : (
            <FailResult contactEmail={regionEmail} />
          )}
        </div>
      ) : null}
    </form>
  );
}
ContactForm.propTypes = {
  subject: PropTypes.string,
  placeholderMessage: PropTypes.string,
};

export default ContactForm;
