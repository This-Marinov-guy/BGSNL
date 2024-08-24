import React, { Fragment, useEffect, useRef, useState } from "react";
import * as yup from "yup";
import moment from 'moment'
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FiCheck, FiChevronLeft } from "react-icons/fi";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import { useHttpClient } from "../../hooks/http-hook";
import Loader from "../../elements/ui/loading/Loader";
import ImageInput from "../../elements/inputs/ImageInput";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../redux/user";
import { Link, useParams } from "react-router-dom";
import { REGIONS_MEMBERSHIP_SPECIFICS } from "../../util/defines/REGIONS_AUTH_CONFIG";
import { encryptData } from "../../util/functions/helpers";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import { Steps } from 'primereact/steps';
import RegionOptions2 from "../../elements/ui/buttons/RegionOptions2";
import { showModal } from "../../redux/modal";
import { BIRTHDAY_MODAL, INCORRECT_MISSING_DATA } from "../../util/defines/defines";
import {Calendar} from "../../elements/inputs/Calendar";
import { showNotification } from "../../redux/notification";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  surname: yup.string().required("Surname is required"),
  birth: yup.string().required("Date of birth is required"),
  phone: yup.string().min(8, 'Phone number is not full').required("Phone is required"),
  email: yup.string().email("Please enter a valid email").required(),
  university: yup.string().required("Your university is required"),
  otherUniversityName: yup.string().when("university", {
    is: "other",
    then: () => yup.string().required("Please state which university"),
    otherwise: () => yup.string(),
  }),
  graduationDate: yup.number().when("university", {
    is: true,
    then: () => yup.number().required("Graduation year is required").max(2050, 'Graduation Year should not exceed 2050'),
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

const SignUp = (props) => {
  const { region } = useParams();

  const [activeStep, setActiveStep] = useState(region ? 1 : 0);

  const stepConfig = [
    {
      label: 'Region',
    },
    {
      label: 'Type'
    },
    {
      label: 'Details'
    },
    {
      label: 'Payment'
    }
  ];

  const handleSelectStep = (e) => {
    const newIndex = e.index;
    
    if (newIndex < activeStep || (region && (newIndex < 2 || selectedMembershipIndex))) {
      setActiveStep(newIndex);
    }
  }

  const { loading, sendRequest } = useHttpClient();

  const [selectedMembershipIndex, setSelectedMembershipIndex] = useState(null);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleErrorMsg = (errors, isValid) => {
    if (errors && !isValid) {
      dispatch(showNotification(INCORRECT_MISSING_DATA))
    }
  }

  useEffect(() => {
    if (region && !REGIONS.includes(region)) {
      navigate('/signup')
    }

    setSelectedMembershipIndex(null)
  }, [region])

  let stepComp;
  let stepButtons;

  switch (activeStep) {
    case 0:
      stepComp = <RegionOptions2 to='signup' />
      stepButtons = null;
      break;
    case 1:
      stepComp = <div className="service-area ptb--60">
        <div className="container">
          <div className="center_div mb--20">
            {selectedMembershipIndex !== null ? <p>You have selected: {REGIONS_MEMBERSHIP_SPECIFICS[selectedMembershipIndex].title} </p> : <p>Select one of the options by clicking it</p>}
          </div>
          <div className="row service-one-wrapper center_div" style={{ gap: '20px' }}>
            {REGIONS_MEMBERSHIP_SPECIFICS.map((val, i) => (
              <div key={i}>
                <button
                  style={
                    (selectedMembershipIndex !== null && val.title === REGIONS_MEMBERSHIP_SPECIFICS[selectedMembershipIndex].title)
                      ? { backgroundColor: "#017363" }
                      : {}
                  }
                  className="service service__style--2"
                  onClick={() => {
                    setSelectedMembershipIndex(i);
                    setActiveStep(2);
                  }}
                >
                  <div className="hor_section">
                    <div className="icon">{val.icon}</div>
                    <h3 style={{ width: "40%" }}>{val.price}&#8364; every {val.period} months</h3>
                  </div>
                  <div className="content">
                    <h3>{val.title}</h3>
                    <p>{val.description || 'Be part of the society. With this membership you get:'}</p>
                    <div className="pricing-body">
                      <ul
                        style={{ textAlign: "start" }}
                        className="list-style--1"
                      >
                        <li>
                          <FiCheck />Exclusive member events
                        </li>
                        <li>
                          <FiCheck />Discounts for events
                        </li>
                        <li>
                          <FiCheck />Premium collection of event tickets
                        </li>
                      </ul>
                    </div>
                    <p style={{ fontSize: '15px' }}>*You will automatically be billed on the end of the period, except if you cancel the subscription from your profile or the funds in your bank account are insufficient
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      stepButtons = <div className="center_div mb--20">
        <p onClick={() => setActiveStep(prevProps => prevProps - 1)} className='information' style={{ cursor: 'pointer', margin: 'auto' }}>
          <FiChevronLeft />
          Back
        </p>
      </div>
      break;
    case 2:
      stepComp = <div className="blog-comment-form pb--120 bg_color--1">
        {selectedMembershipIndex !== null && <div className="container">
          <Formik
            className="inner"
            validationSchema={schema}
            onSubmit={async (values) => {
              const formData = new FormData();
              if (values.image) {
                formData.append(
                  "image",
                  values.image,
                  values.name + values.surname + moment(values.birth).format("D MMM YYYY")
                );
              } else {
                formData.append("image", null);
              }
              formData.append("period", REGIONS_MEMBERSHIP_SPECIFICS[selectedMembershipIndex].period);
              formData.append("itemId", REGIONS_MEMBERSHIP_SPECIFICS[selectedMembershipIndex].itemId);
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
              formData.append('graduationDate', values.graduationDate)
              formData.append("course", values.course);
              formData.append("studentNumber", values.studentNumber);
              formData.append("password", encryptData(values.password));
              formData.append(
                "notificationTypeTerms",
                values.notificationTypeTerms
              );
              try {
                const responseData = await sendRequest(
                  "user/check-email",
                  "POST",
                  {
                    email: values.email,
                  },

                );
                if (responseData.message === 'verified') {
                  if (values.memberKey) {
                    try {
                      const responseData = await sendRequest(
                        "user/check-member-key",
                        "POST",
                        {
                          email: values.email,
                          key: values.memberKey,
                        }
                      );
                      if (responseData.message === "verifiedKey") {
                        try {
                          const responseData = await sendRequest(
                            `user/signup`,
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
                          dispatch(showNotification({ severity: 'success', summary: 'Welcome to the Society', detail: 'Hop in the User section to see your tickets, news and your information', life: 7000 }));

                          if (responseData.celebrate) {
                            dispatch(showModal(BIRTHDAY_MODAL));
                          }

                          navigate(sessionStorage.getItem('prevUrl') ?? `/${responseData.region}`);
                          sessionStorage.removeItem('prevUrl');

                          return;
                        } catch (err) {
                          return;
                        }
                      }
                    } catch (err) {
                      return;
                    }
                  } else {
                    try {
                      const responseData = await sendRequest(
                        "payment/checkout/signup",
                        "POST",
                        formData
                      );
                      if (responseData.url) {
                        window.location.assign(responseData.url);
                      }
                    } catch (err) { }
                  }
                }
              } catch (err) {
                return;
              }
            }}
            initialValues={{
              name: '',
              surname: '',
              phone: '',
              birth: '',
              email: '',
              university: '',
              otherUniversityName: '',
              graduationDate: '',
              course: '',
              studentNumber: '',
              password: '',
              confirmPassword: '',
              policyTerms: false,
              dataTerms: false,
              notificationTerms: false,
              notificationTypeTerms: "",
              payTerms: false,
              memberKey: '',
            }}
          >
            {({ values, setFieldValue, errors, isValid, dirty }) => (
              <Form
                encType="multipart/form-data"
                id="form"
                style={{ padding: "2%" }}
              >
                <h3 className="center_text">Fill your details and register</h3>
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
                <h3 className="mt--30 label center_text">Personal details</h3>
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
                      <Calendar onSelect={(value) => {
                        setFieldValue('birth', value)
                      }}/>
                      <ErrorMessage
                        className="error"
                        name="birth"
                        component="div"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12 col-12">
                    <div className="rn-form-group">
                      <Field
                        type="tel"
                        placeholder="WhatsApp Phone "
                        name="phone"
                      ></Field>
                      <p className="information">
                        Please type your number with + and country code
                      </p>
                      <ErrorMessage
                        className="error"
                        name="phone"
                        component="div"
                      />
                    </div>
                  </div>
                </div>
                <div className="row mt--40">
                  <div className="col-lg-6 col-md-12 col-12">
                    <Field type='text' name="university" placeholder='State your University'>
                    </Field>
                    <ErrorMessage
                      className="error"
                      name="university"
                      component="div"
                    />
                  </div>
                  {values.university === "other" && (
                    <div className="col-lg-6 col-md-12 col-12">
                      <div className="rn-form-group">
                        <Field
                          type="text"
                          placeholder="State the university"
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
                  {values.university !== "working" && (
                    <Fragment>
                      <div className="col-lg-6 col-md-12 col-12">
                        <Field
                          type="number"
                          min="2020"
                          max="2050"
                          placeholder="Graduation Year"
                          name="graduationDate"
                        ></Field>
                        <ErrorMessage
                          className="error"
                          name="graduationDate"
                          component="div"
                        />
                      </div>
                      <div className="col-lg-6 col-md-12 col-12">
                        <div className="rn-form-group">
                          <Field
                            type="text"
                            placeholder="Study Program"
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
                          <Field
                            type="text"
                            placeholder="Student Number"
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
                <h3 className="mt--30 label center_text">Login details</h3>
                <div className="row">
                  <div className="col-lg-6 col-md-12 col-12">
                    <div className="rn-form-group">
                      <Field type="email" placeholder="Email" name="email" />
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
                      <Field
                        autoComplete="off"
                        type="password"
                        placeholder="Password"
                        name="password"
                      ></Field>
                      <ErrorMessage
                        className="error"
                        name="password"
                        component="div"
                      />
                    </div>
                  </div>

                  <div className="col-lg-6 col-md-12 col-12">
                    <div className="rn-form-group">
                      <Field
                        autoComplete="off"
                        type="password"
                        placeholder="Confirm Password"
                        name="confirmPassword"
                      ></Field>
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
                          href="/rules-and-regulations"
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
                        I consent to my data being processed confidentially for
                        the purposes of the organization
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
                        I consent BGSNL to deduct the membership fee at the agreed period in order to keep my benefits as a member and I keep my rights to cancel or update my payment methods.
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
                        I consent to being notified by BGSNL about events and
                        discounts from us and our sponsors
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
                      className="col-lg-6 col-md-6 col-12 mt--60 mb--60 center_div team_member_border-1"
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
                    {!loading && <p onClick={() => setActiveStep(prevProps => prevProps - 1)} className='information' style={{ cursor: 'pointer', marginBottom: 0 }}>
                      <FiChevronLeft />
                      Back
                    </p>}
                    <button
                      disabled={loading}
                      type="submit"
                      className="rn-button-style--2 rn-btn-reverse-green"
                      onClick={() => handleErrorMsg(errors, isValid)}
                    >
                      {loading ? <Loader /> : 'Payment'}
                    </button>
                  </div>
                  <Link to="/login" className="mt--10" style={{ fontSize: '0.5em' }}>
                    I already have a member account
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>}
      </div>
      stepButtons = null
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

      <h3 className="center_text mt--150">Become a Member</h3>

      <Steps model={stepConfig} activeIndex={activeStep} onSelect={handleSelectStep} readOnly={false} className="mt--20" />
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

export default SignUp;
