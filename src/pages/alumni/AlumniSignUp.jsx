import React, { Fragment, useEffect, useRef, useState } from "react";
import * as yup from "yup";
import moment from "moment";
import { Badge } from "primereact/badge";
import { Slider } from "primereact/slider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Password } from "primereact/password";
import { FiCheck, FiChevronLeft } from "react-icons/fi";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import { useHttpClient } from "../../hooks/common/http-hook";
import Loader from "../../elements/ui/loading/Loader";
import ImageInput from "../../elements/inputs/common/ImageInput";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../redux/user";
import { Link, useParams } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import { ALUMNI_MEMBERSHIP_SPECIFICS } from "../../util/defines/ALUMNI";
import {
  encryptData,
  isObjectEmpty,
  removeSpacesAndLowercase,
} from "../../util/functions/helpers";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import { Steps } from "primereact/steps";
import RegionOptions2 from "../../elements/ui/buttons/RegionOptions2";
import { showModal } from "../../redux/modal";
import {
  BIRTHDAY_MODAL,
  INCORRECT_MISSING_DATA,
} from "../../util/defines/common";
import { Calendar } from "../../elements/inputs/common/Calendar";
import { showNotification } from "../../redux/notification";
import PhoneInput from "../../elements/inputs/common/PhoneInput";
import {
  reorderUniversitiesByCode,
  UNIVERSITIES_BY_CITY,
} from "../../util/defines/UNIVERSITIES";
import { render } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChessRook,
  faHome,
  faUser,
  faChessPawn,
  faChessBishop,
  faChessKing,
  faHeart,
  faStar,
  faCrown,
  faGem,
} from "@fortawesome/free-solid-svg-icons";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  surname: yup.string().required("Surname is required"),
  birth: yup.string().required("Date of birth is required"),
  phone: yup
    .string()
    .min(8, "Phone number is not full")
    .required("Phone is required"),
  email: yup.string().email("Please enter a valid email").required(),
  university: yup.string().required("Your university is required"),
  otherUniversityName: yup.string().when("university", {
    is: "other",
    then: () => yup.string().required("Please state which university"),
    otherwise: () => yup.string(),
  }),
  graduationDate: yup.number().when("university", {
    is: true,
    then: () =>
      yup
        .number()
        .required("Graduation year is required")
        .max(2050, "Graduation Year should not exceed 2050"),
    otherwise: () => yup.number(),
  }),
  course: yup.string().when("university", {
    is: true,
    then: () => yup.string().required("Your course is required"),
    otherwise: () => yup.string(),
  }),
  studentNumber: yup.string().when("university", {
    is: true,
    then: () => yup.string().required("Your student number is required"),
    otherwise: () => yup.string(),
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
  memberKey: yup.string(),
});

const stepConfig = [
  {
    label: "Type",
  },
  {
    label: "Details",
  },
  {
    label: "Payment",
  },
];

const groupedItemTemplate = (option) => {
  return (
    <div className="flex align-items-start justify-content-start">
      <div>{option.label}</div>
    </div>
  );
};

const AlumniSignUp = (props) => {
  const { region } = useParams();

  const [activeStep, setActiveStep] = useState(region ? 1 : 0);
  const [sliderValue, setSliderValue] = useState(25);

  const uniOptions = reorderUniversitiesByCode(UNIVERSITIES_BY_CITY, region);

  // Function to get membership details based on slider value
  const getMembershipFromPrice = (price) => {
    if (price <= 10) {
      return {
        id: 1,
        title: "Student Tier",
        benefits: [
          { text: "Basic Alumni Events", strike: false },
          { text: "Hall of Fame entry", strike: false },
          { text: "Event Discounts", strike: true },
          { text: "Private Channel Access", strike: true },
          { text: "Voting Rights", strike: true },
          { text: "Personalized Merchandise", strike: true },
        ],
        icon: (
          <FontAwesomeIcon
            style={{ fontSize: "26px", color: "#6c757d", height: "75px" }}
            icon={faChessPawn}
          />
        ),
        price: price,
        period: 1,
        description: "Perfect for students and new graduates",
        borderColor: "#6c757d",
      };
    } else if (price <= 25) {
      return {
        id: 2,
        title: "Professional Tier",
        benefits: [
          { text: "Exclusive Alumni Events", strike: false },
          { text: "Hall of Fame upper entry", strike: false },
          { text: "Event Discounts & Promotions", strike: false },
          { text: "Private Channel Access", strike: true },
          { text: "Voting Rights", strike: true },
          { text: "Personalized Merchandise", strike: true },
        ],
        icon: (
          <FontAwesomeIcon
            style={{ fontSize: "28px", color: "#17a2b8", height: "75px" }}
            icon={faChessBishop}
          />
        ),
        price: price,
        period: 3,
        description: "Great for working professionals",
        borderColor: "#17a2b8",
      };
    } else if (price <= 50) {
      return {
        id: 3,
        title: "Premium Tier",
        benefits: [
          { text: "VIP Alumni Events", strike: false },
          { text: "Hall of Fame top entry + quote", strike: false },
          { text: "Maximum Event Discounts", strike: false },
          { text: "Private Channel Access", strike: false },
          { text: "Voting Rights", strike: false },
          { text: "Personalized Merchandise", strike: true },
        ],
        label: { color: "#28a745", text: "Popular" },
        icon: (
          <FontAwesomeIcon
            style={{ fontSize: "30px", color: "#28a745", height: "75px" }}
            icon={faChessRook}
          />
        ),
        price: price,
        period: 6,
        description: "Most popular choice with great benefits",
        borderColor: "#28a745",
      };
    } else if (price <= 75) {
      return {
        id: 4,
        title: "Elite Tier",
        benefits: [
          { text: "Exclusive VIP Events", strike: false },
          { text: "Hall of Fame premium entry", strike: false },
          { text: "All Event Discounts", strike: false },
          { text: "Private Channel Access", strike: false },
          { text: "Full Voting Rights", strike: false },
          { text: "Premium Merchandise", strike: false },
        ],
        label: { color: "#ffc107", text: "Best Value" },
        icon: (
          <FontAwesomeIcon
            style={{ fontSize: "32px", color: "#ffc107", height: "75px" }}
            icon={faCrown}
          />
        ),
        price: price,
        period: 12,
        description: "Elite benefits for serious alumni",
        borderColor: "#ffc107",
      };
    } else {
      return {
        id: 5,
        title: "Platinum Tier",
        benefits: [
          { text: "All Alumni Events", strike: false },
          { text: "Hall of Fame platinum entry", strike: false },
          { text: "Maximum Discounts", strike: false },
          { text: "Private Channel Access", strike: false },
          { text: "Board Voting Rights", strike: false },
          { text: "Exclusive Merchandise", strike: false },
        ],
        label: { color: "#dc3545", text: "Ultimate" },
        icon: (
          <FontAwesomeIcon
            style={{ fontSize: "34px", color: "#dc3545", height: "75px" }}
            icon={faGem}
          />
        ),
        price: price,
        period: 12,
        description: "Ultimate alumni experience",
        borderColor: "#dc3545",
      };
    }
  };

  const currentMembership = getMembershipFromPrice(sliderValue);

  const handleSelectStep = (e) => {
    const newIndex = e.index;

    if (
      newIndex < activeStep ||
      (region && (newIndex < 2 || currentMembership))
    ) {
      setActiveStep(newIndex);
    }
  };

  const { loading, sendRequest } = useHttpClient();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleErrorMsg = (errors) => {
    if (!isObjectEmpty(errors)) {
      dispatch(showNotification(INCORRECT_MISSING_DATA));
    }
  };

  let stepComp;
  let stepButtons;

  switch (activeStep) {
    case 0:
      stepComp = (
        <div className="service-area ptb--40">
          <div className="container">
            <div className="center_div mb--40">
              <div className="d-flex flex-column align-items-center justify-content-center">
                <h3 className="mb--30">Choose Your Membership Level</h3>
                <p className="mb--40 text-center" style={{ maxWidth: "600px" }}>
                  Select your monthly contribution amount using the slider below. 
                  Different levels unlock various benefits and privileges within our alumni community.
                </p>
                
                {/* Price Slider */}
                <div style={{ width: "100%", maxWidth: "500px", marginBottom: "30px" }}>
                  <div className="d-flex justify-content-between align-items-center mb--20">
                    <span>€0</span>
                    <h4 style={{ margin: 0 }}>€{sliderValue}</h4>
                    <span>€100</span>
                  </div>
                  <Slider
                    value={sliderValue}
                    onChange={(e) => setSliderValue(e.value)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-100"
                    style={{ 
                      height: "8px",
                      background: "linear-gradient(to right, #6c757d, #17a2b8, #28a745, #ffc107, #dc3545)"
                    }}
                  />
                  <div className="d-flex justify-content-between mt--10" style={{ fontSize: "12px", color: "#666" }}>
                    <span>Student</span>
                    <span>Professional</span>
                    <span>Premium</span>
                    <span>Elite</span>
                    <span>Platinum</span>
                  </div>
                </div>

                {/* Selected Membership Display */}
                <div 
                  className="service service__style--2"
                  style={{
                    border: `3px solid ${currentMembership.borderColor}`,
                    width: "100%",
                    maxWidth: "500px",
                    position: "relative",
                    backgroundColor: "#f8f9fa"
                  }}
                >
                  {currentMembership?.label?.text && (
                    <Badge
                      style={{
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        backgroundColor: currentMembership.label.color,
                      }}
                      value={currentMembership.label.text}
                    />
                  )}
                  
                  <div className="hor_section">
                    <div className="icon">{currentMembership.icon}</div>
                    <div style={{ flex: 1 }}>
                      <h4>€{currentMembership.price} / month</h4>
                      <small>Billed every {currentMembership.period === 1 ? "month" : `${currentMembership.period} months`}</small>
                    </div>
                  </div>
                  
                  <div className="content">
                    <h3>{currentMembership.title}</h3>
                    <p>{currentMembership.description}</p>
                    {currentMembership?.benefits && (
                      <ul className="list-style--2">
                        {currentMembership.benefits.map((benefit, index) => (
                          <li
                            style={{
                              textDecoration: benefit.strike ? "line-through" : "none",
                              color: benefit.strike ? "#999" : "inherit"
                            }}
                            key={index}
                          >
                            <FiCheck style={{ marginRight: "8px", color: benefit.strike ? "#999" : "#28a745" }} />
                            {benefit.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  className="rn-button-style--2 rn-btn-reverse-green mt--30"
                  onClick={() => setActiveStep(1)}
                  style={{ minWidth: "200px" }}
                >
                  Continue with {currentMembership.title}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
      stepButtons = null;
      break;
    case 1:
      stepComp = (
        <div className="blog-comment-form pb--120 bg_color--1">
          {currentMembership && (
            <div className="container">
              <Formik
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
                  formData.append("period", currentMembership.period);
                  formData.append("price", currentMembership.price);
                  formData.append("membershipId", currentMembership.id);
                  formData.append("origin_url", window.location.origin);
                  formData.append("method", "signup");
                  formData.append("region", region);
                  formData.append("name", values.name);
                  formData.append("surname", values.surname);
                  formData.append("birth", values.birth);
                  formData.append("phone", values.phone);
                  formData.append("email", values.email);
                  formData.append("university", values.university);
                  formData.append(
                    "otherUniversityName",
                    values.otherUniversityName
                  );
                  formData.append("graduationDate", values.graduationDate);
                  formData.append("course", values.course);
                  formData.append("studentNumber", values.studentNumber);
                  formData.append("password", encryptData(values.password));
                  formData.append(
                    "notificationTypeTerms",
                    values.notificationTypeTerms
                  );
                  const responseData = await sendRequest(
                    "security/check-email",
                    "POST",
                    {
                      email: values.email,
                    }
                  );

                  if (!responseData.hasOwnProperty("status")) {
                    return;
                  }

                  if (responseData.status === true) {
                    const checkMember = await sendRequest(
                      "security/check-member-key",
                      "POST",
                      { email: removeSpacesAndLowercase(values.email) }
                    );

                    if (checkMember?.status === true) {
                      const responseData = await sendRequest(
                        `security/signup`,
                        "POST",
                        formData
                      );
                      dispatch(
                        login({
                          token: responseData.token,
                          expirationDate: new Date(
                            new Date().getTime() + 36000000
                          ).toISOString(),
                        })
                      );
                      dispatch(
                        showNotification({
                          severity: "success",
                          summary: "Welcome to the Society",
                          detail:
                            "Hop in the User section to see your tickets, news and your information",
                          life: 7000,
                        })
                      );

                      if (responseData.celebrate) {
                        dispatch(showModal(BIRTHDAY_MODAL));
                      }

                      navigate(
                        sessionStorage.getItem("prevUrl") ??
                          `/${responseData.region}`
                      );
                      sessionStorage.removeItem("prevUrl");
                    } else {
                      const responseData = await sendRequest(
                        "payment/checkout/signup",
                        "POST",
                        formData
                      );

                      if (responseData.url) {
                        window.location.assign(responseData.url);
                      }
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
                  otherUniversityName: "",
                  graduationDate: "",
                  course: "",
                  studentNumber: "",
                  password: "",
                  confirmPassword: "",
                  policyTerms: false,
                  dataTerms: false,
                  notificationTerms: false,
                  notificationTypeTerms: "",
                  payTerms: false,
                  memberKey: "",
                }}
              >
                {({ values, setFieldValue, errors, isValid, dirty }) => (
                  <Form
                    encType="multipart/form-data"
                    id="form"
                    style={{ padding: "2%" }}
                  >
                    <h3 className="center_text">
                      Fill your details and register
                    </h3>
                    <div className="center_div row mb--40 mt--40">
                      <div className="col-lg-12 col-md-6 col-12">
                        <h3 className="center_text label">Profile picture</h3>
                        <ImageInput
                          onChange={(event) => {
                            setFieldValue("image", event.target.files[0]);
                          }}
                        />
                        <p className="mt--10 information center_text">
                          *optional - we will assign you a cool avatar
                        </p>
                      </div>
                    </div>
                    <h3 className="mt--30 label center_text">
                      Personal details
                    </h3>
                    <div className="row">
                      <div className="col-lg-6 col-md-12 col-12">
                        <div className="rn-form-group">
                          <Field type="text" placeholder="Name" name="name" />
                          <ErrorMessage
                            className="error"
                            name="name"
                            component="div"
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-12 col-12">
                        <div className="rn-form-group">
                          <Field
                            type="text"
                            placeholder="Surname"
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
                          <Calendar
                            onSelect={(value) => {
                              setFieldValue("birth", value);
                            }}
                            placeholder="Select your Birth Date"
                          />
                          <ErrorMessage
                            className="error"
                            name="birth"
                            component="div"
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-12 col-12">
                        <div className="rn-form-group">
                          <PhoneInput
                            placeholder="WhatsApp Phone "
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

                    <h3 className="mt--30 label center_text">Login details</h3>
                    <div className="row">
                      <div className="col-lg-6 col-md-12 col-12">
                        <div className="rn-form-group">
                          <Field
                            type="email"
                            placeholder="Email"
                            name="email"
                          />
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
                          <Password
                            autoComplete="off"
                            placeholder="Password"
                            name="password"
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
                          <Password
                            autoComplete="off"
                            placeholder="Confirm Password"
                            name="confirmPassword"
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
                    <div className="row">
                      <div className="col-lg-6 col-md-6 col-12">
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
                            >
                              society's rules and regulations
                            </a>
                          </p>
                        </div>
                        <ErrorMessage
                          className="error"
                          name="policyTerms"
                          component="div"
                        />

                        <div className="hor_section_nospace mt--40">
                          <Field
                            style={{ maxWidth: "30px" }}
                            type="checkbox"
                            name="dataTerms"
                          ></Field>
                          <p className="information">
                            I consent to my data being processed confidentially
                            for the purposes of the organization
                          </p>
                        </div>
                        <ErrorMessage
                          className="error"
                          name="dataTerms"
                          component="div"
                        />
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
                          </p>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-12">
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
                        <Field as="select" name="notificationTypeTerms">
                          <option value="" disabled>
                            Contact By
                          </option>
                          <option value="Email">Email</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Email & WhatsApp">Both</option>
                        </Field>
                        <ErrorMessage
                          className="error"
                          name="payTerms"
                          component="div"
                        />
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
                    <div className="ver_section mt--20">
                      <div className="options-btns-div">
                        {!loading && (
                          <p
                            onClick={() =>
                              setActiveStep((prevProps) => prevProps - 1)
                            }
                            className="information"
                            style={{ cursor: "pointer", marginBottom: 0 }}
                          >
                            <FiChevronLeft />
                            Back
                          </p>
                        )}
                        <button
                          disabled={loading}
                          type="submit"
                          className="rn-button-style--2 rn-btn-reverse-green"
                          onClick={() => handleErrorMsg(errors, isValid)}
                        >
                          {loading ? <Loader /> : "Payment"}
                        </button>
                      </div>
                      <Link
                        to="/login"
                        className="mt--10"
                        style={{ fontSize: "0.5em" }}
                      >
                        I already have a member account
                      </Link>
                    </div>
                  </Form>
                )}
              </Formik>
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
      <PageHelmet pageTitle="Join" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      <h3 className="center_text mt--150">
        Become an Alumni <br />
        <Link
          style={{ fontSize: "0.7em" }}
          className="rn-button-style--1 center_text"
          to="/signup"
        >
          (or rather be a Member)
        </Link>
      </h3>

      <Steps
        model={stepConfig}
        activeIndex={activeStep}
        onSelect={handleSelectStep}
        readOnly={false}
        className="mt--20"
      />
      {stepComp}
      {stepButtons}

      {region && <FooterTwo />}

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </React.Fragment>
  );
};

export default AlumniSignUp;
