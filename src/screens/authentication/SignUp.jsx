"use client";

import React, {
  Fragment,
  useEffect,
  useState,
} from "react";
import {
  ErrorMessage,
  Field,
  Form,
} from "formik";
import moment from "moment";
import * as yup from "yup";
import {
  Dropdown,
  Password,
  Steps,
} from "@/compat/primereact";
import ScrollToTop from "@/component/common/ScrollToTop";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronUp,
} from "@/elements/ui/icons/IconlyIcons";
import {
  Link,
  useNavigate,
  useParams,
} from "@/util/navigation";
import PageHelmet from "../../component/common/Helmet";
import FooterTwo from "../../component/footer/FooterTwo";
import HeaderTwo from "../../component/header/HeaderTwo";
import { Calendar } from "../../elements/inputs/common/Calendar";
import ImageInput, {
  DEFAULT_MAX_IMAGE_SIZE_BYTES,
} from "../../elements/inputs/common/ImageInput";
import PhoneInput from "../../elements/inputs/common/PhoneInput";
import ValidatedFormik from "../../elements/ui/forms/ValidatedFormik";
import RegionOptions2 from "../../elements/ui/buttons/RegionOptions2";
import StepContentTransition from "../../elements/ui/functional/StepContentTransition";
import Loader from "../../elements/ui/loading/Loader";
import { useHttpClient } from "../../hooks/common/http-hook";
import { REGIONS_MEMBERSHIP_SPECIFICS } from "../../util/defines/REGIONS_AUTH_CONFIG";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import {
  reorderUniversitiesByCode,
  UNIVERSITIES_BY_CITY,
} from "../../util/defines/UNIVERSITIES";
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
  birth: yup.string().required("Date of birth is required"),
  phone: yup
    .string()
    .min(8, "Phone number is not full")
    .required("Phone is required"),
  email: yup.string().email("Please enter a valid email").required(),
  isWorking: yup.boolean(),
  university: yup.string().when("isWorking", {
    is: true,
    then: (fieldSchema) => fieldSchema.oneOf(["working"]).required(),
    otherwise: (fieldSchema) =>
      fieldSchema.required("Your university is required"),
  }),
  otherUniversityName: yup.string().when("university", {
    is: "other",
    then: () => yup.string().required("Please state which university"),
    otherwise: () => yup.string(),
  }),
  graduationDate: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    )
    .nullable()
    .when("university", {
      is: (value) => Boolean(value) && value !== "working",
      then: (fieldSchema) =>
        fieldSchema
          .required("Graduation year is required")
          .max(2050, "Graduation Year should not exceed 2050"),
    }),
  course: yup.string().when("university", {
    is: (value) => Boolean(value) && value !== "working",
    then: () => yup.string().required("Your course is required"),
    otherwise: () => yup.string(),
  }),
  studentNumber: yup.string().when("university", {
    is: (value) => Boolean(value) && value !== "working",
    then: () => yup.string().required("Your student number is required"),
    otherwise: () => yup.string(),
  }),
  profession: yup
    .string()
    .trim()
    .max(200, "Profession is too long")
    .when("isWorking", {
      is: true,
      then: (fieldSchema) =>
        fieldSchema.required("Your profession is required"),
      otherwise: (fieldSchema) => fieldSchema,
    }),
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
  notificationTypeTerms: yup.string(),
  notificationTerms: yup.bool(),
  policyTerms: yup.bool().required().oneOf([true], "Terms must be accepted"),
  dataTerms: yup.bool().required().oneOf([true], "Terms must be accepted"),
  payTerms: yup.bool().required().oneOf([true], "Terms must be accepted"),
});

const stepConfig = [
  {
    label: "Region",
    description: "Choose a city.",
  },
  {
    label: "Type",
    description: "Select a type.",
  },
  {
    label: "Details",
    description: "Fill your details.",
  },
  {
    label: "Payment",
    description: "Review & payment.",
  },
];

const groupedItemTemplate = (option) => {
  const isNoMatch = option.label === "No matching universities";

  return (
    <div
      className={`flex align-items-start justify-content-start${
        isNoMatch ? " university-select-no-match" : ""
      }`}
    >
      <div>{option.label}</div>
    </div>
  );
};

const OTHER_UNIVERSITY_OPTION = {
  label: "Enter another university",
  value: "other",
};

const SignUp = () => {
  const { region: routeRegion } = useParams();
  const [selectedRegion, setSelectedRegion] = useState(routeRegion ?? null);

  const [activeStep, setActiveStep] = useState(routeRegion ? 1 : 0);
  const [transitionDirection, setTransitionDirection] = useState("forward");

  const goToStep = (nextStep) => {
    if (nextStep === activeStep) return;

    setTransitionDirection(nextStep > activeStep ? "forward" : "backward");
    setActiveStep(nextStep);
  };

  const selectRegion = (nextRegion) => {
    setSelectedRegion(nextRegion);
    setSelectedMembershipIndex(null);
    goToStep(1);

    window.history.replaceState(
      window.history.state,
      "",
      `/${nextRegion}/signup`
    );
  };

  const uniOptions = reorderUniversitiesByCode(
    UNIVERSITIES_BY_CITY,
    selectedRegion
  );

  const handleSelectStep = (e) => {
    const newIndex = e.index;
    const lastAccessibleStep = selectedMembershipIndex !== null
      ? 2
      : selectedRegion
        ? 1
        : 0;

    if (newIndex <= lastAccessibleStep) {
      goToStep(newIndex);
    }
  };

  const { loading, sendRequest } = useHttpClient();

  const [selectedMembershipIndex, setSelectedMembershipIndex] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (routeRegion && !REGIONS.includes(routeRegion)) {
      navigate("/signup");
    }

    setSelectedMembershipIndex(null);
  }, [routeRegion]);

  let stepComp;
  let stepButtons;

  switch (activeStep) {
    case 0:
      stepComp = <RegionOptions2 onSelectRegion={selectRegion} />;
      stepButtons = null;
      break;
    case 1:
      stepComp = (
        <section className="signup-plan-section" aria-label="Membership plans">
          <div className="container">
            <ul className="signup-benefit-grid" aria-label="Member benefits">
                  <li>
                    <FiCheck />
                    Exclusive member events
                  </li>
                  <li>
                    <FiCheck />
                    Discounts for events
                  </li>
                  <li>
                    <FiCheck />
                    Premium collection of event tickets
                  </li>
                  <li>
                    <FiCheck />
                    Internship opportunities worldwide
                  </li>
                  <li>
                    <FiCheck />
                    Access to the wider BGSNL network
                  </li>
            </ul>

            <div className="signup-plan-grid signup-plan-grid--member">
              {REGIONS_MEMBERSHIP_SPECIFICS.map((val, i) => (
                <button
                  key={val.id}
                  type="button"
                  className={`signup-plan-card${val.label?.text ? " signup-plan-card--featured" : ""}`}
                  onClick={() => {
                    setSelectedMembershipIndex(i);
                    goToStep(2);
                  }}
                >
                  {val?.label?.text && (
                    <span className="signup-plan-card__badge">{val.label.text}</span>
                  )}
                  <span className="signup-plan-card__icon" aria-hidden="true">{val.icon}</span>
                  <span className="signup-plan-card__price">
                    <strong>{val.price}&#8364;</strong>
                    <span>every {val.period} months</span>
                  </span>
                  <span className="signup-plan-card__title">{val.title}</span>
                  <span className="signup-plan-card__description">{val.description}</span>
                </button>
              ))}
            </div>

            <p className="signup-renewal-note">
              Membership renews automatically at the end of the chosen period.
              You can cancel or update your payment method from your profile.
            </p>
          </div>
        </section>
      );
      stepButtons = (
        <div className="signup-back-row container">
          <button
            type="button"
            onClick={() => goToStep(activeStep - 1)}
            className="signup-back-button"
          >
            <FiChevronLeft />
            Change region
          </button>
        </div>
      );
      break;
    case 2:
      stepComp = (
        <div className="blog-comment-form signup-form-section pb--120">
          {selectedMembershipIndex !== null && (
            <div className="container">
              <ValidatedFormik
                className="inner"
                validationSchema={schema}
                onSubmit={async (values) => {
                  const isWorking =
                    values.isWorking || values.university === "working";
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
                    REGIONS_MEMBERSHIP_SPECIFICS[selectedMembershipIndex].period
                  );
                  formData.append(
                    "itemId",
                    REGIONS_MEMBERSHIP_SPECIFICS[selectedMembershipIndex].itemId
                  );
                  formData.append("origin_url", window.location.origin);
                  formData.append("method", "signup");
                  formData.append("region", selectedRegion);
                  formData.append("name", values.name);
                  formData.append("surname", values.surname);
                  formData.append("birth", values.birth);
                  formData.append("phone", values.phone);
                  formData.append("email", values.email);
                  formData.append(
                    "university",
                    isWorking ? "working" : values.university
                  );
                  formData.append(
                    "otherUniversityName",
                    !isWorking && values.university === "other"
                      ? values.otherUniversityName
                      : ""
                  );
                  formData.append(
                    "graduationDate",
                    isWorking ? "" : values.graduationDate
                  );
                  formData.append("course", isWorking ? "" : values.course);
                  formData.append(
                    "studentNumber",
                    isWorking ? "" : values.studentNumber
                  );
                  formData.append(
                    "profession",
                    isWorking ? values.profession.trim() : ""
                  );
                  formData.append("password", await encryptData(values.password));
                  formData.append(
                    "notificationTypeTerms",
                    values.notificationTypeTerms
                  );
                  formData.append("policyTerms", values.policyTerms);
                  formData.append("dataTerms", values.dataTerms);
                  formData.append("payTerms", values.payTerms);
                  formData.append("notificationTerms", values.notificationTerms);
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
                  phone: "",
                  birth: "",
                  email: "",
                  university: "",
                  isWorking: false,
                  otherUniversityName: "",
                  graduationDate: "",
                  course: "",
                  studentNumber: "",
                  profession: "",
                  password: "",
                  confirmPassword: "",
                  policyTerms: false,
                  dataTerms: false,
                  notificationTerms: false,
                  notificationTypeTerms: "whatsapp & email",
                  payTerms: false,
                }}
              >
                {({ values, setFieldValue }) => (
                  <Form
                    encType="multipart/form-data"
                    id="form"
                    className="signup-application-form"
                  >
                    <header className="signup-form-heading">
                      <button
                        aria-label="Back to plans"
                        type="button"
                        onClick={() => goToStep(1)}
                        className="signup-back-button signup-form-heading__back"
                      >
                        <FiChevronLeft aria-hidden="true" />
                      </button>
                      <h2>Complete your membership</h2>
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
                    <div className="row">
                      <div className="col-lg-6 col-md-12 col-12">
                        <div className="rn-form-group">
                          <label
                            htmlFor="signup-birth"
                            style={{
                              marginBottom: "5px",
                            }}
                          >
                            Date of Birth{" "}
                            <span style={{ color: "#dc3545" }}>*</span>
                          </label>
                          <div data-field-name="birth">
                            <Calendar
                              className="signup-birth-calendar"
                              inputId="signup-birth"
                              maxDate={new Date()}
                              name="birth"
                              value={values.birth}
                              onSelect={(value) => {
                                setFieldValue("birth", value);
                              }}
                              placeholder="DD / MM / YYYY"
                            />
                          </div>
                          <ErrorMessage
                            className="error"
                            name="birth"
                            component="div"
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-12 col-12">
                        <div className="rn-form-group" data-field-name="phone">
                          <label
                            style={{
                              marginBottom: "5px",
                            }}
                          >
                            Phone Number{" "}
                            <span style={{ color: "#dc3545" }}>*</span>
                          </label>
                          <PhoneInput
                            name="phone"
                            placeholder="WhatsApp Phone"
                            onChange={(value) => setFieldValue("phone", value)}
                          />
                          <ErrorMessage
                            className="error"
                            name="phone"
                            component="div"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row mt--40">
                      <div className="col-12">
                        <div className="signup-agreements signup-working-checkbox">
                          <div data-field-name="isWorking">
                            <label className="hor_section_nospace">
                              <Field
                                style={{ maxWidth: "30px" }}
                                type="checkbox"
                                name="isWorking"
                                checked={values.isWorking}
                                onChange={(event) => {
                                  const isWorking = event.target.checked;
                                  setFieldValue("isWorking", isWorking);
                                  setFieldValue(
                                    "university",
                                    isWorking ? "working" : ""
                                  );
                                  setFieldValue("otherUniversityName", "");
                                  setFieldValue("graduationDate", "");
                                  setFieldValue("course", "");
                                  setFieldValue("studentNumber", "");
                                  setFieldValue("profession", "");
                                }}
                              />
                              <p className="information">
                                I&apos;m currently working. Use my profession
                                instead of study details.
                              </p>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 signup-field-mode-transition">
                        <StepContentTransition
                          direction={values.isWorking ? "forward" : "backward"}
                          step={values.isWorking ? 1 : 0}
                        >
                          <div className="row">
                            {!values.isWorking && (
                              <div className="col-lg-6 col-md-12 col-12">
                                <div className="rn-form-group">
                                  <label
                                    style={{
                                      marginBottom: "5px",
                                    }}
                                  >
                                    University{" "}
                                    <span style={{ color: "#dc3545" }}>*</span>
                                  </label>
                                  <div data-field-name="university">
                                    <Dropdown
                                      value={values.university}
                                      filter
                                      onChange={(e) => {
                                        setFieldValue("university", e.value);
                                      }}
                                      options={uniOptions}
                                      name="university"
                                      className="p-dropdown-custom bgsnl-form-control"
                                      placeholder="Select your university"
                                      filterPlaceholder="Search universities"
                                      appendTo={
                                        typeof document !== "undefined"
                                          ? document.body
                                          : undefined
                                      }
                                      panelClassName="university-select-panel"
                                      filterFallbackOption={
                                        OTHER_UNIVERSITY_OPTION
                                      }
                                      filterFallbackGroupLabel="No matching universities"
                                      optionLabel="label"
                                      optionValue="value"
                                      optionGroupLabel="label"
                                      optionGroupChildren="items"
                                      optionGroupTemplate={groupedItemTemplate}
                                    />
                                  </div>
                                  <ErrorMessage
                                    className="error"
                                    name="university"
                                    component="div"
                                  />
                                </div>
                              </div>
                            )}
                            {values.isWorking && (
                              <div className="col-lg-6 col-md-12 col-12">
                                <div className="rn-form-group">
                                  <label>
                                    Profession{" "}
                                    <span style={{ color: "#dc3545" }}>*</span>
                                  </label>
                                  <Field
                                    className="bgsnl-form-control"
                                    type="text"
                                    placeholder="e.g., Software engineer"
                                    name="profession"
                                  />
                                  <ErrorMessage
                                    className="error"
                                    name="profession"
                                    component="div"
                                  />
                                </div>
                              </div>
                            )}
                            {!values.isWorking &&
                              values.university === "other" && (
                                <div className="col-lg-6 col-md-12 col-12">
                                  <div className="rn-form-group">
                                    <label
                                      style={{
                                        marginBottom: "5px",
                                      }}
                                    >
                                      University Name{" "}
                                      <span style={{ color: "#dc3545" }}>*</span>
                                    </label>
                                    <Field
                                      className="bgsnl-form-control"
                                      type="text"
                                      placeholder="e.g., University of Amsterdam"
                                      name="otherUniversityName"
                                    ></Field>
                                    <ErrorMessage
                                      className="error"
                                      name="otherUniversityName"
                                      component="div"
                                    />
                                  </div>
                                </div>
                              )}
                            {!values.isWorking && (
                              <Fragment>
                                <div className="col-lg-6 col-md-12 col-12">
                                  <div className="rn-form-group">
                                    <label
                                      style={{
                                        marginBottom: "5px",
                                      }}
                                    >
                                      Graduation Year{" "}
                                      <span style={{ color: "#dc3545" }}>*</span>
                                    </label>
                                    <Field
                                      className="bgsnl-form-control"
                                      type="number"
                                      min="2020"
                                      max="2050"
                                      placeholder="e.g., 2025"
                                      name="graduationDate"
                                    ></Field>
                                    <ErrorMessage
                                      className="error"
                                      name="graduationDate"
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
                                      Study Program{" "}
                                      <span style={{ color: "#dc3545" }}>*</span>
                                    </label>
                                    <Field
                                      className="bgsnl-form-control"
                                      type="text"
                                      placeholder="e.g., Computer Science"
                                      name="course"
                                    ></Field>
                                    <ErrorMessage
                                      className="error"
                                      name="course"
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
                                      Student Number{" "}
                                      <span style={{ color: "#dc3545" }}>*</span>
                                    </label>
                                    <Field
                                      className="bgsnl-form-control"
                                      type="text"
                                      placeholder="e.g., 12345678"
                                      name="studentNumber"
                                    ></Field>
                                    <ErrorMessage
                                      className="error"
                                      name="studentNumber"
                                      component="div"
                                    />
                                  </div>
                                </div>
                              </Fragment>
                            )}
                          </div>
                        </StepContentTransition>
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
                            Use an email you can access. Your confirmation and
                            membership details will be sent there.
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
                            Confirm Password{" "}
                            <span style={{ color: "#dc3545" }}>*</span>
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
                    <h3 className="signup-form-section-title">Agreements</h3>
                    <div className="row signup-agreements">
                      <div className="col-lg-6 col-md-6 col-12">
                        <div data-field-name="policyTerms">
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
                            data-validation-message-for="policyTerms"
                          />
                        </div>

                        <div data-field-name="dataTerms">
                          <div className="hor_section_nospace mt--40">
                            <Field
                              style={{ maxWidth: "30px" }}
                              type="checkbox"
                              name="dataTerms"
                            ></Field>
                            <p className="information">
                              I consent to my data being processed confidentially
                              for the purposes of the organization
                              <span style={{ color: "#dc3545" }}> *</span>
                            </p>
                          </div>
                          <ErrorMessage
                            className="error"
                            name="dataTerms"
                            component="div"
                            data-validation-message-for="dataTerms"
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-12">
                        <div data-field-name="payTerms">
                          <div className="hor_section_nospace mt--40">
                            <Field
                              style={{ maxWidth: "30px" }}
                              type="checkbox"
                              name="payTerms"
                            ></Field>
                            <p className="information">
                              I consent BGSNL to deduct the membership fee at the
                              agreed period in order to keep my benefits as a
                              member and I keep my rights to cancel or update my
                              payment methods.
                              <span style={{ color: "#dc3545" }}> *</span>
                            </p>
                          </div>
                          <ErrorMessage
                            className="error"
                            name="payTerms"
                            component="div"
                            data-validation-message-for="payTerms"
                          />
                        </div>
                        
                        <div className="hor_section_nospace mt--40">
                          <Field
                            style={{ maxWidth: "30px" }}
                            type="checkbox"
                            name="notificationTerms"
                          ></Field>
                          <p className="information">
                            I consent to being notified by BGSNL about events
                            and discounts from us and our sponsors
                          </p>
                        </div>
                        {/* <Field as="select" name="notificationTypeTerms">
                          <option value="" disabled>
                            Contact By
                          </option>
                          <option value="Email">Email</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Email & WhatsApp">Both</option>
                        </Field> */}
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
        pageTitle="Become a Member"
        description="Join the Bulgarian Society Netherlands during your academic years. Get event discounts, explore internship options, and get the chance to enter a committee or board."
        image="https://www.bulgariansociety.nl/assets/images/alumni/members.jpg"
        canonicalUrl="https://www.bulgariansociety.nl/signup"
        keywords="BGSNL membership, join Bulgarian Society, Bulgarian students Netherlands, become a member"
      />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
        forceRegion={selectedRegion}
      />

      <main className="signup-page">
        <header className="signup-hero container">
          <h1>Start your BGSNL journey</h1>
          <nav className="signup-audience-switch" aria-label="Application type">
            <span className="signup-audience-switch__item is-active" aria-current="page">
              <strong>Member</strong>
            </span>
            <Link
              className="signup-audience-switch__item signup-audience-switch__item--alumni"
              to="/alumni/register"
            >
              <strong>Alumni</strong>
            </Link>
          </nav>
        </header>

        <div className="signup-steps container">
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

      {selectedRegion && <FooterTwo />}

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </React.Fragment>
  );
};

export default SignUp;
