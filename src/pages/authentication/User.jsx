import React, { useState, useEffect, Fragment } from "react";
import { useHttpClient } from "../../hooks/http-hook";
import { useSelector, useDispatch } from "react-redux";
import { removeModal, selectModal, showModal } from "../../redux/modal";
import Loader from "../../elements/ui/Loader";
import ImageInput from "../../elements/inputs/ImageInput";
import * as yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FiCircle, FiCheckCircle, FiEdit, FiChevronUp, FiX } from "react-icons/fi";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import ModalWindow from "../../elements/ui/ModalWindow";
import Locked from "../../elements/ui/Locked";
import PageLoading from '../../elements/ui/PageLoading'
import { LazyLoadImage } from "react-lazy-load-image-component";
import WindowShift from "../../elements/ui/WindowShift";
import ImageFb from "../../elements/ui/ImageFb";
import Greeting from "../../elements/Greeting";
import Christmas from "../../elements/special/Christmas";
import { selectUser } from "../../redux/user";
import capitalizeFirstLetter from "../../util/capitalize";
import { REGION_WHATSAPP } from "../../util/REGIONS_DESIGN";
import SubscriptionManage from "../../elements/ui/SubscriptionManage";

const schema = yup.object().shape({
  image: yup.string(),
  name: yup.string().required(),
  surname: yup.string().required(),
  phone: yup.string().min(8).required(),
  email: yup.string().email("Please enter a valid email").required(),
  university: yup.string().required(),
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
    then: () => yup.string().required("Your course is a required filed"),
    otherwise: () => yup.string(),
  }),
  studentNumber: yup.string().when("university", {
    is: true,
    then: () =>
      yup.string().required("Your student number is a required filed"),
    otherwise: () => yup.string(),
  }),
});

const User = (props) => {
  const [currentUser, setCurrentUser] = useState();
  const [expand, setExpand] = useState(false);

  const { loading, sendRequest } = useHttpClient();

  const dispatch = useDispatch();

  const modal = useSelector(selectModal);

  const user = useSelector(selectUser);

  const closeHandler = () => {
    dispatch(removeModal());
  };

  const expandHandler = (elementId) => {
    const ticketImage = document.getElementById(elementId);
    const className = "expand_ticket_img";
    if (!ticketImage.classList.contains(className)) {
      ticketImage.classList.add(className);
      setExpand(true);
    } else {
      ticketImage.classList.remove(className);
      setExpand(false);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const responseData = await sendRequest(`user/${user.userId}`);
        setCurrentUser(responseData.user);
      } catch (err) {
      }
    };
    fetchCurrentUser();
  }, [user, sendRequest]);

  return currentUser ? (
    <React.Fragment>
      <PageHelmet pageTitle="Profile" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      {/* <Christmas currentUser={currentUser} /> */}
      {currentUser.status !== "active" && (
        <Locked user={currentUser} case="locked" show={currentUser.status} toast={props.toast} />
      )}
      {modal && (
        <ModalWindow show={modal}>
          <Formik
            className="inner"
            validationSchema={schema}
            onSubmit={async (values) => {
              const formData = new FormData();
              if (values.image) {
                formData.append(
                  "image",
                  values.image,
                  currentUser.name + currentUser.surname + currentUser.birth
                );
              } else {
                formData.append("image", null);
              }
              formData.append("region", currentUser.region);
              formData.append("name", values.name);
              formData.append("surname", values.surname);
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
              formData.append(
                "notificationTypeTerms",
                values.notificationTypeTerms
              );
              if (currentUser.email !== values.email) {
                try {
                  const responseData = await sendRequest(
                    "user/check-email",
                    "POST",
                    {
                      email: values.email,
                    },

                  );
                } catch (err) {
                  return;
                }
              }
              try {
                const responseData = await sendRequest(
                  `user/edit-info/${user.userId}`,
                  "PATCH",
                  formData
                );
                window.location.reload();
              } catch (err) { }
            }}
            initialValues={{
              image: "",
              name: currentUser.name,
              surname: currentUser.surname,
              phone: currentUser.phone,
              email: currentUser.email,
              university: currentUser.university,
              otherUniversityName: currentUser.otherUniversityName,
              graduationDate: currentUser.otherUniversityName || '',
              course: currentUser.course,
              studentNumber: currentUser.studentNumber,
            }}
          >
            {({ values, setFieldValue }) => (
              <Form
                encType="multipart/form-data"
                id="form"
                style={{ padding: "2%" }}
              >
                <div className="hor_section">
                  <h3 style={{ margin: 'auto' }}>Update your details</h3>
                  <FiX className="x_icon" onClick={closeHandler} />
                </div>
                <div className="row mb--40 mt--40">
                  <div className="col-lg-12 col-md-12 col-12">
                    <ImageInput
                      onChange={(event) => {
                        setFieldValue("image", event.target.files[0]);
                      }}
                      initialImage={currentUser.image}
                      errorRequired={
                        <ErrorMessage
                          className="error"
                          name="image"
                          component="div"
                        />
                      }
                    />
                  </div>
                </div>
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
                  <div className="col-lg-6 col-md-12 col-12">
                    <Field as="select" name="university">
                      <option value="" disabled>
                        Select your university
                      </option>
                      <option value="RUG">RUG</option>
                      <option value="Hanze">Hanze</option>
                      <option value="other">Other university</option>
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
                <div className="mt--40">
                  <button
                    disabled={loading}
                    type="submit"
                    className="rn-button-style--2 btn-solid"
                  >
                    {loading ? <Loader /> : <span>Update information</span>}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </ModalWindow>
      )}
      {/* Start Info Area */}
      <div className="service-area ptb--120 bg_color--1 mt--120">
        <div className="container">
          <div className="row service-one-wrapper center_div">
            <div className="col-lg-6 col-md-12 col-12 ">
              <div className="service service__style--2">
                {currentUser.subscription && <SubscriptionManage userId={currentUser.id} subscription={currentUser.subscription} toast={props.toast} />}
                <div className="content center_div">
                  <LazyLoadImage src={currentUser.image} alt="profile" />
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-12 col-12">
              <div className="service service__style--2 team_member_border-5">
                <div className="content">
                  <h2>Hello again, {currentUser.name}!</h2>
                  <div className="hor_section mb--40">
                    <p className="mt--20" style={{ fontFamily: 'Archive' }}>{capitalizeFirstLetter(currentUser.region)} Member</p>
                    <FiEdit
                      className="edit_btn"
                      onClick={() => {
                        dispatch(showModal());
                      }}
                    />
                  </div>
                  <div className="pricing-body">
                    <ul
                      style={{ textAlign: "start" }}
                      className="list-style--1"
                    >
                      <li>
                        <FiCircle style={{ fontSize: "14px" }} /> Full Name:{" "}
                        {currentUser.name + " " + currentUser.surname}
                      </li>
                      <li>
                        <FiCircle style={{ fontSize: "14px" }} /> Date of Birth:{" "}
                        {currentUser.birth}
                      </li>
                      <li>
                        <FiCircle style={{ fontSize: "14px" }} /> Email:{" "}
                        {currentUser.email}
                      </li>
                      <li>
                        <FiCircle style={{ fontSize: "14px" }} /> Phone:{" "}
                        {currentUser.phone}
                      </li>
                      <li>
                        <FiCircle style={{ fontSize: "14px" }} /> University:{" "}
                        {currentUser.university === "other"
                          ? currentUser.otherUniversityName
                          : currentUser.university}
                      </li>

                      {/* <li style={{ fontWeight: "bold" }}>
                        <FiCircle style={{ fontSize: "14px" }} /> Membership
                        Expires: {currentUser.expireDate}
                      </li> */}
                      {REGION_WHATSAPP[currentUser.region] && <li>
                        <FiCheckCircle style={{ fontSize: "14px" }} /><a style={{ color: "#017363" }} href={REGION_WHATSAPP[currentUser.region]} target='_blank'>Click here to join the Member Chat</a>
                      </li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Info Area */}
      {/* <Greeting /> */}
      {/* Start User Collection */}
      <WindowShift
        className="mt--80 mb--80"
        main="News"
        secondary="Ticket Collection"
        mainContent={
          <Fragment>
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className="mb--30 mb_sm--0">
                    <h2 className="title">News</h2>
                    <ul>
                      <li className="mt--40">
                        <p className="mb--20">Open call for artists: if you are an artist and want to participate in our special gala night, please check the links below</p>
                        <div className="options-btns-div">
                          <div>
                            <h4>More information <a href='https://docs.google.com/document/d/1VPf4TLdVCMjA8WEWs9ItxODd760MAf8x/edit' target="_blank">Here</a></h4>
                            <h4>Link for the form: <a href='/assets/images/files/gala.docx' target="_blank">Click to download</a></h4>
                            <h4>Link for the event: <a href='https://bulgariansociety.nl/groningen/event-details/Spring%20Gala' target="_blank">Click to see</a></h4>
                          </div>
                          <img style={{ width: '300px' }} src='/assets/images/news/gala.jpg' />
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Fragment>
        }
        secondaryContent={
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="mb--30 mb_sm--0">
                  <h2 className="title mb--40">Ticket Collection</h2>
                  {currentUser.tickets.length > 0 ? (
                    <div className="row">
                      {currentUser.tickets.map((ticket, i) => (
                        <div className="col-lg-4 col-md-6 col-12" key={i}>
                          <OverlayTrigger
                            overlay={
                              <Tooltip id="tooltip-disabled">
                                {expand ? "Click to Shrink" : "Click to Expand"}
                              </Tooltip>
                            }
                          >
                            <img
                              id={`ticket${i}`}
                              className="mb--40"
                              src={ticket.image}
                              alt="ticket"
                              onClick={(event) => {
                                expandHandler(event.target.id);
                              }}
                            />
                          </OverlayTrigger>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No tickets purchased</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        }
      />
      {/* End User Collection */}

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
    </React.Fragment>
  ) : (
    <PageLoading />
  );
}

export default User;
