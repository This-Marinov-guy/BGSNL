import React, { Fragment, useEffect, useState } from "react";
import { format } from "date-fns";
import * as yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FiX } from "react-icons/fi";
import Alert from "react-bootstrap/Alert";
import { FiCheck } from "react-icons/fi";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import { FiUserPlus } from "react-icons/fi";
import { useHttpClient } from "../../hooks/http-hook";
import Loader from "../../elements/ui/Loader";
import ImageInput from "../../elements/ui/ImageInput";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../redux/user";
import { Link, useParams } from "react-router-dom";
import RegionOptions from "../../elements/ui/RegionOptions";
import { REGIONS_MEMBERSHIP, REGIONS_MEMBERSHIP_SPECIFICS } from "../../util/REGIONS_AUTH_CONFIG";

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
    then: () => yup.number().required("Graduation year is required"),
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

const options = [
  {
    icon: <FiUserPlus />,
    title: "Member",
    description: "Be part of the society. With this membership you get:  ",
    price: 10,
  },
];

const SignUp = (props) => {
  const { loading, sendRequest } = useHttpClient();

  const { region } = useParams();

  const [selectedMembershipIndex, setSelectedMembershipIndex] = useState(null);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const closeHandler = () => {
    props.setNotification(null);
  };

  useEffect(() => {
    setSelectedMembershipIndex(null)
  }, [region])

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Join" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <RegionOptions to='signup' />
      {(region && REGIONS_MEMBERSHIP.includes(region)) ? <Fragment><div className="container mt--50">
        <h2 className="center_text">Become a Member</h2>
      </div>
        {/* Start Options Area */}

        <div className="service-area ptb--120 bg_color--1">
          <div className="container">
            <div className="center_div mb--20">
              {selectedMembershipIndex !== null ? <p>You have selected: {REGIONS_MEMBERSHIP_SPECIFICS[region][selectedMembershipIndex].title} </p> : <p>Select one of the options by clicking it</p>}
            </div>
            <div className="row service-one-wrapper center_div" style={{ gap: '20px' }}>
              {REGIONS_MEMBERSHIP_SPECIFICS[region].map((val, i) => (
                <div key={i}>
                  <button
                    style={
                      (selectedMembershipIndex !== null && val.title === REGIONS_MEMBERSHIP_SPECIFICS[region][selectedMembershipIndex].title)
                        ? { backgroundColor: "#017363" }
                        : {}
                    }
                    className="service service__style--2"
                    onClick={() => {
                      setSelectedMembershipIndex(i)
                      setTimeout(() => {
                        window.scrollTo({
                          top: document.getElementById("form").scrollHeight,
                          behavior: "smooth",
                        });
                      }, 100);
                    }}
                  >
                    <div className="hor_section">
                      <div className="icon">{val.icon}</div>
                      <h3 style={{ width: "40%" }}>{val.price} euro</h3>
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
                      <p style={{ fontSize: '15px' }}>*The expiration date is 31st of August (year differs based on subscription period)
                      </p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* End Options Area */}
        {/* Start Form Area */}

        <div className="blog-comment-form pb--120 bg_color--1">
          {selectedMembershipIndex !== null && <div className="container">
            <Formik
              className="inner"
              validationSchema={schema}
              onSubmit={async (values) => {
                const formData = new FormData();
                if (values.image) {
                  // modify the name of image with the birth that will be later saved in the database (I know it's not perfect but nothing is...)
                  const [y, m, d] = values.birth.split("-");
                  const modDate = new Date(y, parseInt(m, 10) - 1, d);
                  let b = format(modDate, "dd MMM yyyy");
                  formData.append(
                    "image",
                    values.image,
                    values.name + values.surname + b
                  );
                } else {
                  formData.append("image", null);
                }
                formData.append("period", REGIONS_MEMBERSHIP_SPECIFICS[region][selectedMembershipIndex].period);
                formData.append("itemId", REGIONS_MEMBERSHIP_SPECIFICS[region][selectedMembershipIndex].itemId);
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
                formData.append("password", values.password);
                formData.append(
                  "notificationTypeTerms",
                  values.notificationTypeTerms
                );
                try {
                  const responseData = await sendRequest(
                    region,
                    "user/check-email",
                    "POST",
                    {
                      email: values.email,
                    },

                  );
                } catch (err) {
                  return;
                }
                if (values.memberKey) {
                  try {
                    const responseData = await sendRequest(
                      region,
                      region,

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
                          region,

                          `user/signup`,
                          "POST",
                          formData
                        );
                        dispatch(
                          login({
                            userId: responseData.userId,
                            token: responseData.token,
                            region: responseData.region,
                            expirationDate: new Date(
                              new Date().getTime() + 36000000
                            ).toISOString(),
                          })
                        );
                        props.setNotification(
                          <Alert className="error_panel" variant="success">
                            <div className="action_btns">
                              <h3>Welcome User!</h3>
                              <FiX className="x_icon" onClick={closeHandler} />
                            </div>
                            <p>
                              You successfully created your account! Please check
                              the news section in your profile for any updates!
                            </p>
                            <Link
                              onClick={closeHandler}
                              to={`/user`}
                              className="rn-button-style--2 rn-btn-green mt--40"
                            >
                              Go to Profile
                            </Link>
                          </Alert>
                        );
                        navigate(`/${responseData.region}`);
                        setTimeout(() => closeHandler(), 5000);
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
                      region,
                      "payment/checkout/signup",
                      "POST",
                      formData
                    );
                    if (responseData.url) {
                      window.location.assign(responseData.url);
                    }
                  } catch (err) { }
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
              {({ values, setFieldValue }) => (
                <Form
                  encType="multipart/form-data"
                  id="form"
                  style={{ padding: "2%" }}
                >
                  <h3>Fill your details and register</h3>
                  <div className="row mb--40 mt--40">
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
                  <h3 className="mt--30 label">Personal details</h3>
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
                        <Field
                          type="date"
                          min="1900-01-01"
                          max="2100-12-30"
                          name="birth"
                        />
                        <p className="information">
                          *Month is first and after that the day
                        </p>
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
                      <Field as="select" name="university">
                        <option value="" disabled>
                          Select your university
                        </option>
                        <option value="RUG">RUG</option>
                        <option value="Hanze">Hanze</option>
                        <option value="other">Other univerisity</option>
                        <option value="working">Working</option>
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
                  <h3 className="mt--30 label">Login details</h3>
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
                          style={{ maxWidth: "30px", margin: "10px" }}
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
                          style={{ maxWidth: "30px", margin: "10px" }}
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
                          style={{ maxWidth: "30px", margin: "10px" }}
                          type="checkbox"
                          name="notificationTerms"
                        ></Field>
                        <p className="information">
                          I consent to being notified by BGSG about events and
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

                      <div className="hor_section_nospace mt--40">
                        <Field
                          style={{ maxWidth: "30px", margin: "10px" }}
                          type="checkbox"
                          name="payTerms"
                        ></Field>
                        <p className="information">
                          I understand that my registration is complete after
                          paying the link I will receive on my email.
                        </p>
                      </div>
                      <ErrorMessage
                        className="error"
                        name="payTerms"
                        component="div"
                      />
                    </div>
                    <div
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
                    </div>
                  </div>
                  <button
                    disabled={loading}
                    type="submit"
                    className="rn-button-style--2 btn-solid mt--80"
                  >
                    {loading ? <Loader /> : <span>Finish Registration</span>}
                  </button>
                  <div
                    style={{ alignItems: "flex-start" }}
                    className="action_btns"
                  >
                    <Link className="rn-button-style--1" to="/login">
                      I already have a member account
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          </div>}
        </div></Fragment> : <div className="mt--40 mb--80 center_text"><h3>Please select a region (some cities may not offer memberships yet)</h3></div>}
      {/* End Form Area */}
      {/* Start Footer Style  */}
      <FooterTwo />
      {/* End Footer Style  */}
      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </React.Fragment >
  );
};

export default SignUp;
