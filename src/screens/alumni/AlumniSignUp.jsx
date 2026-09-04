"use client";

import React, { useState } from "react";
import {
  ErrorMessage,
  Field,
  Form,
} from "formik";
import moment from "moment";
import * as yup from "yup";
import {
  Password,
  Steps,
} from "@/compat/primereact";
import ScrollToTop from "@/component/common/ScrollToTop";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronUp,
  FiX,
} from "@/elements/ui/icons/IconlyIcons";
import {
  Link,
  useParams,
} from "@/util/navigation";
import PageHelmet from "../../component/common/Helmet";
import FooterTwo from "../../component/footer/FooterTwo";
import HeaderTwo from "../../component/header/HeaderTwo";
import ImageInput, {
  DEFAULT_MAX_IMAGE_SIZE_BYTES,
} from "../../elements/inputs/common/ImageInput";
import ValidatedFormik from "../../elements/ui/forms/ValidatedFormik";
import Loader from "../../elements/ui/loading/Loader";
import StepContentTransition from "../../elements/ui/functional/StepContentTransition";
import { useHttpClient } from "../../hooks/common/http-hook";
import { ALUMNI_MEMBERSHIP_SPECIFICS } from "../../util/defines/ALUMNI";
import { encryptData } from "../../util/functions/helpers";

const isSupportedImage = (value) =>
  !value ||
  typeof value === "string" ||
  ["image/jpg", "image/jpeg", "image/png"].includes(value.type);

const isSupportedImageSize = (value) =>
  !value ||
  typeof value === "string" ||
  value.size <= DEFAULT_MAX_IMAGE_SIZE_BYTES;

const schema = yup.object().shape({
  image: yup
    .mixed()
    .test("fileType", "Please choose a JPG or PNG image", isSupportedImage)
    .test("fileSize", "Image must be 5 MB or smaller", isSupportedImageSize),
  name: yup.string().required("Name is required"),
  surname: yup.string().required("Surname is required"),
  email: yup.string().email("Please enter a valid email").required(),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long")
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/,
      "Please create a stronger password with capital and small letters, number and a special symbol"
    )
    .required(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords do not match")
    .required("Passwords do not match"),
  notificationTerms: yup.bool(),
  policyTerms: yup.bool().required().oneOf([true], "Terms must be accepted"),
});

const stepConfig = [
  {
    label: "Type",
    description: "Select the support level that suits you.",
  },
  {
    label: "Details",
    description: "Add your personal and account details.",
  },
  {
    label: "Payment",
    description: "Review your details and confirm support.",
  },
];

const AlumniSignUp = () => {
  const { region } = useParams();

  const [activeStep, setActiveStep] = useState(region ? 1 : 0);
  const [transitionDirection, setTransitionDirection] = useState("forward");

  const goToStep = (nextStep) => {
    if (nextStep === activeStep) return;

    setTransitionDirection(nextStep > activeStep ? "forward" : "backward");
    setActiveStep(nextStep);
  };

  const handleSelectStep = (e) => {
    const newIndex = e.index;
    const lastAccessibleStep = selectedMembershipIndex !== null ? 1 : 0;

    if (newIndex <= lastAccessibleStep) {
      goToStep(newIndex);
    }
  };

  const { loading, sendRequest } = useHttpClient();

  const [selectedMembershipIndex, setSelectedMembershipIndex] = useState(null);

  let stepComp;
  let stepButtons;

  switch (activeStep) {
    case 0:
      stepComp = (
        <section className="signup-plan-section" aria-label="Alumni membership plans">
          <div className="container">
            <div className="signup-plan-grid signup-plan-grid--alumni">
              {ALUMNI_MEMBERSHIP_SPECIFICS.map((val, i) => (
                <button
                  key={val.id}
                  type="button"
                  className={`signup-plan-card signup-plan-card--alumni${val.label?.text ? " signup-plan-card--featured" : ""}`}
                  onClick={() => {
                    setSelectedMembershipIndex(i);
                    goToStep(1);
                  }}
                >
                  {val?.label?.text && (
                    <span className="signup-plan-card__badge">{val.label.text}</span>
                  )}
                  <span className="signup-plan-card__topline">
                    <span className="signup-plan-card__icon" aria-hidden="true">{val.icon}</span>
                    <span className="signup-plan-card__price">
                      <strong>{val.price}&#8364;</strong>
                      <span>per month</span>
                    </span>
                  </span>
                  <span className="signup-plan-card__title">{val.title}</span>
                  {val?.benefits && (
                    <ul className="signup-plan-card__benefits">
                      {val.benefits.map((benefit) => (
                        <li className={benefit.strike ? "is-unavailable" : ""} key={benefit.text}>
                          {benefit.strike ? <FiX /> : <FiCheck />}
                          <span>{benefit.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              ))}
            </div>

            <p className="signup-renewal-note">
              Alumni plans renew monthly. You can change or cancel your support
              from your profile at any time.
            </p>
          </div>
        </section>
      );
      stepButtons = null;
      break;
    case 1:
      stepComp = (
        <div className="blog-comment-form signup-form-section pb--120">
          {selectedMembershipIndex !== null && (
            <div className="container">
              <ValidatedFormik
                className="inner"
                validationSchema={schema}
                onSubmit={async (values) => {
                  const formData = new FormData();
                  if (values.image) {
                    formData.append(
                      "image",
                      values.image,
                      values.name +
                        values.surname +
                        moment(values.birth).format("D MMM YYYY")
                    );
                  } else {
                    formData.append("image", null);
                  }
                  formData.append(
                    "period",
                    ALUMNI_MEMBERSHIP_SPECIFICS[selectedMembershipIndex].period
                  );
                  formData.append(
                    "itemId",
                    ALUMNI_MEMBERSHIP_SPECIFICS[selectedMembershipIndex].itemId
                  );
                  formData.append(
                    "tier",
                    ALUMNI_MEMBERSHIP_SPECIFICS[selectedMembershipIndex].id
                  );
                  formData.append("origin_url", window.location.origin);
                  formData.append("method", "alumni-signup");
                  if (region) {
                    formData.append("region", region);
                  }
                  formData.append("name", values.name);
                  formData.append("surname", values.surname);
                  formData.append("email", values.email);
                  formData.append("password", await encryptData(values.password));
                  formData.append("policyTerms", values.policyTerms);
                  formData.append("notificationTerms", values.notificationTerms);
                  formData.append(
                    "notificationTypeTerms",
                    values.notificationTerms ? "whatsapp & email" : ""
                  );
                  const responseData = await sendRequest(
                    "security/check-email",
                    "POST",
                    {
                      email: values.email,
                    }
                  );

                  if (
                    !responseData ||
                    !Object.prototype.hasOwnProperty.call(responseData, "status")
                  ) {
                    return;
                  }

                  if (responseData.status === true) {
                    const checkoutResponse = await sendRequest(
                      "payment/checkout/signup",
                      "POST",
                      formData
                    );

                    if (checkoutResponse.url) {
                      window.location.assign(checkoutResponse.url);
                    }
                  }
                }}
                initialValues={{
                  name: "",
                  surname: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                  policyTerms: false,
                  notificationTerms: false,
                }}
              >
                {({ setFieldValue }) => (
                  <Form
                    encType="multipart/form-data"
                    id="form"
                    className="signup-application-form"
                  >
                    <header className="signup-form-heading">
                      <button
                        aria-label="Back to plans"
                        type="button"
                        onClick={() => goToStep(0)}
                        className="signup-back-button signup-form-heading__back"
                      >
                        <FiChevronLeft aria-hidden="true" />
                      </button>
                      <h2>Complete your alumni profile</h2>
                    </header>
                    <div className="signup-profile-block">
                      <div className="signup-profile-block__control">
                        <ImageInput
                          className="signup-profile-image"
                          dropzone
                          name="image"
                          onChange={(event) => {
                            setFieldValue("image", event.target.files[0]);
                          }}
                        />
                        <ErrorMessage
                          className="error center_text"
                          name="image"
                          component="div"
                        />
                      </div>
                    </div>
                    <h3 className="signup-form-section-title">
                      Personal details
                    </h3>
                    <div className="row">
                      <div className="col-lg-6 col-md-12 col-12">
                        <div className="rn-form-group">
                          <label
                            style={{
                              marginBottom: "5px",
                            }}
                          >
                            Name <span style={{ color: "#dc3545" }}>*</span>
                          </label>
                          <Field
                            className="bgsnl-form-control"
                            type="text"
                            placeholder="e.g., John"
                            name="name"
                          />
                          <ErrorMessage
                            className="error"
                            name="name"
                            component="div"
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-12 col-12">
                        <div className="rn-form-group">
                          <label
                            style={{
                              marginBottom: "5px",
                            }}
                          >
                            Surname <span style={{ color: "#dc3545" }}>*</span>
                          </label>
                          <Field
                            className="bgsnl-form-control"
                            type="text"
                            placeholder="e.g., Doe"
                            name="surname"
                          ></Field>
                          <ErrorMessage
                            className="error"
                            name="surname"
                            component="div"
                          />
                        </div>
                      </div>
                    </div>

                    <h3 className="signup-form-section-title">Login details</h3>
                    <div className="row">
                      <div className="col-12">
                        <div className="rn-form-group">
                          <label
                            style={{
                              marginBottom: "5px",
                            }}
                          >
                            Email <span style={{ color: "#dc3545" }}>*</span>
                          </label>
                          <Field
                            className="bgsnl-form-control"
                            type="email"
                            placeholder="e.g., john.doe@example.com"
                            name="email"
                          />
                          <p className="information">
                            Use an email you can access. Important membership
                            notifications will be sent there.
                          </p>
                          <ErrorMessage
                            className="error"
                            name="email"
                            component="div"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6 col-md-12 col-12">
                        <div className="rn-form-group">
                          <label
                            style={{
                              marginBottom: "5px",
                            }}
                          >
                            Password <span style={{ color: "#dc3545" }}>*</span>
                          </label>
                          <Password
                            autoComplete="off"
                            placeholder="Enter your password"
                            name="password"
                            inputClassName="bgsnl-form-control"
                            onChange={(e) =>
                              setFieldValue("password", e.target.value)
                            }
                            toggleMask
                            feedback={false}
                            unstyled
                          />
                          <ErrorMessage
                            className="error"
                            name="password"
                            component="div"
                          />
                        </div>
                      </div>

                      <div className="col-lg-6 col-md-12 col-12">
                        <div className="rn-form-group">
                          <label
                            style={{
                              marginBottom: "5px",
                            }}
                          >
                            Confirm Password <span style={{ color: "#dc3545" }}>*</span>
                          </label>
                          <Password
                            autoComplete="off"
                            placeholder="Confirm your password"
                            name="confirmPassword"
                            inputClassName="bgsnl-form-control"
                            onChange={(e) =>
                              setFieldValue("confirmPassword", e.target.value)
                            }
                            toggleMask
                            feedback={false}
                            unstyled
                          />
                          <ErrorMessage
                            className="error"
                            name="confirmPassword"
                            component="div"
                          />
                        </div>
                      </div>
                    </div>
                    <h3 className="signup-form-section-title">Agreement</h3>
                    <div className="row signup-agreements signup-agreements--single">
                      <div className="col-12">
                        <div className="hor_section_nospace mt--40">
                          <Field
                            style={{ maxWidth: "30px" }}
                            type="checkbox"
                            name="policyTerms"
                          ></Field>
                          <p className="information">
                            I have read and accept the&nbsp;
                            <a
                              style={{ color: "#017363" }}
                              href="/terms-and-legals"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              society&apos;s rules and regulations
                            </a>
                            <span style={{ color: "#dc3545" }}> *</span>
                          </p>
                        </div>
                        <ErrorMessage
                          className="error"
                          name="policyTerms"
                          component="div"
                        />
                      </div>

                      <div className="col-12">
                        <div className="hor_section_nospace mt--40">
                          <Field
                            style={{ maxWidth: "30px" }}
                            type="checkbox"
                            name="notificationTerms"
                          />
                          <p className="information">
                            I consent to being contacted by BGSNL about events
                            and discounts from us and our sponsors
                          </p>
                        </div>
                      </div>

                      {/* <div
                      style={{ borderWidth: "30px" }}
                      className="col-lg-6 col-md-6 col-12 mt--60 mb--60 center_div team_member_border_1"
                    >
                      <div className="rn-form-group">
                        <h3 className="center_text">
                          For users with already paid membership
                        </h3>
                        <Field
                          autoComplete="off"
                          type="password"
                          placeholder="Access Key"
                          name="memberKey"
                        ></Field>
                        <p className="information">
                          This is an access key field for users, provided with a key for their email from the board. Please ignore it if you do not have an access
                          key. If you use key that does not belong to you, your account will be suspended!
                        </p>
                      </div>
                    </div>  */}
                    </div>
                    <div className="signup-form-actions">
                      <div className="options-btns-div">
                        <button
                          disabled={loading}
                          type="submit"
                          className="rn-button-style--2 rn-btn-reverse-green"
                        >
                          {loading ? <Loader /> : "Continue to payment"}
                        </button>
                      </div>
                      <Link
                        to="/login"
                        className="signup-login-link"
                      >
                        I already have a member account
                      </Link>
                    </div>
                  </Form>
                )}
              </ValidatedFormik>
            </div>
          )}
        </div>
      );
      stepButtons = null;
      break;
    default:
      stepButtons = null;
      stepComp = null;
  }

  return (
    <React.Fragment>
      <PageHelmet
        pageTitle="Become an Alumni"
        description="Support the Bulgarian Society Netherlands as a post-graduate alumni. Network with the community, attend alumni events, and aid our mission."
        image="https://www.bulgariansociety.nl/assets/images/alumni/alumni.jpeg"
        canonicalUrl="https://www.bulgariansociety.nl/alumni/register"
        keywords="BGSNL alumni, join Bulgarian Society alumni, Bulgarian graduates Netherlands, alumni network"
      />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      <main className="signup-page">
        <header className="signup-hero container">
          <h1>Continue your BGSNL journey</h1>
          <nav className="signup-audience-switch" aria-label="Application type">
            <Link className="signup-audience-switch__item" to="/signup">
              <strong>Member</strong>
            </Link>
            <span
              className="signup-audience-switch__item signup-audience-switch__item--alumni is-active"
              aria-current="page"
            >
              <strong>Alumni</strong>
            </span>
          </nav>
        </header>

        <div className="signup-steps signup-steps--alumni container">
          <Steps
            model={stepConfig}
            activeIndex={activeStep}
            onSelect={handleSelectStep}
            readOnly={false}
          />
        </div>
        <StepContentTransition
          direction={transitionDirection}
          step={activeStep}
        >
          <div className="signup-step-panel">
            <div
              className="signup-step-note container"
              data-active-step={activeStep + 1}
              data-step-count={stepConfig.length}
              aria-live="polite"
            >
              <p>{stepConfig[activeStep]?.description}</p>
            </div>
            {stepComp}
            {stepButtons}
          </div>
        </StepContentTransition>
      </main>

      {region && <FooterTwo />}

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </React.Fragment>
  );
};

export default AlumniSignUp;
