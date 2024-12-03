import React, { useState, useEffect } from "react";
import PageHelmet from "../../component/common/Helmet";
import ScrollToTop from "react-scroll-up";
import * as yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useHttpClient } from "../../hooks/common/http-hook";
import { FiChevronUp, FiX } from "react-icons/fi";
import Header from "../../component/header/Header";
import Footer from "../../component/footer/Footer";
import ModalWindow from "../../elements/ui/modals/ModalWindow";
import Loader from "../../elements/ui/loading/Loader";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../redux/user";
import { removeModal, selectModal, showModal } from "../../redux/modal";
import { useObjectGrabUrl } from "../../hooks/common/object-hook";
import { OTHER_EVENTS } from "../../util/defines/OTHER_EVENTS";
import { decodeJWT } from "../../util/functions/authorization";
import { NSE_REGISTRATION_MODAL } from "../../util/defines/common";
import { showNotification } from "../../redux/notification";
import { ACTIVE, LOCKED, USER_STATUSES } from "../../util/defines/enum";
import PhoneInput from "../../elements/inputs/common/PhoneInput";
import ImageFb from "../../elements/ui/media/ImageFb";
import ExclusiveMemberEvent from "../../elements/ui/errors/Events/MemeberExclusiveEvents";
import TicketSaleClosed from "../../elements/ui/errors/Events/TicketSaleClosed";
import FormExtras from "../../elements/ui/forms/FormExtras";
import { createCustomerTicket } from "../../util/functions/ticket-creator";
import MembershipBanner from "../../elements/banners/MembershipBanner";

const schema = yup.object().shape({
  name: yup.string().required(),
  surname: yup.string().required(),
  phone: yup.string().required(),
  email: yup.string().email("Please enter a valid email").required(),
  notificationTypeTerms: yup
    .string()
    .required("Please select a prefered way of being contacted"),
  notificationTerms: yup
    .bool()
    .required()
    .oneOf([true], "Terms must be accepted"),
});

const NonSocietyEvent = (props) => {
  const [currentUser, setCurrentUser] = useState();

  const [formData, setFormData] = useState({
    hasExtraGuest: false,
    extraGuestName: "",
  });

  const { loading, sendRequest } = useHttpClient();

  const target = OTHER_EVENTS[0];

  const user = useSelector(selectUser);
  const modal = useSelector(selectModal);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const closeHandler = () => {
    dispatch(removeModal(NSE_REGISTRATION_MODAL));
  };

  const closeNotificationHandler = () => {
    dispatch(removeModal(NSE_REGISTRATION_MODAL));
  };

  const block = target.membersOnly && !user?.token;

  const submitMemberForm = async () => {
    try {
      const { ticketBlob } = await createCustomerTicket(
        target.ticket_img,
        currentUser.name,
        currentUser.surname
      );

      const form = new FormData();

      form.append(
        "image",
        ticketBlob,
        target.title + "_" + currentUser.name + currentUser.surname + "_MEMBER"
      );

      form.append("event", target.title);
      form.append("date", target.timeStamp);
      form.append("user", "member");
      form.append("name", currentUser.name + " " + currentUser.surname);
      form.append("phone", currentUser.phone);
      form.append("email", currentUser.email);
      form.append("extraData", formData.extraGuestName);
      form.append(
        "notificationTypeTerms",
        currentUser.notificationTypeTerms
          ? currentUser.notificationTypeTerms
          : "Any"
      );

      const responseData = await sendRequest(
        "event/register/non-society-event",
        "POST",
        form
      );

      if (responseData?.status) {
        dispatch(
          showNotification({
            severity: "success",
            summary: "Success",
            detail:
              "Your registration for the event is complete! Please check your email for confirmation!",
          })
        );

        navigate("/");
        setTimeout(() => closeNotificationHandler(), 7000);
      }
    } catch (err) {}
  };

  const imageUrl =
    target.bgImageExtra && target?.bgImageSelection == 2
      ? target.bgImageExtra
      : `/assets/images/bg/bg-image-${target.bgImage}.webp`;

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const responseData = await sendRequest(`user/current`);
        setCurrentUser(responseData.user);
      } catch (err) {
        console.log(err);
      }
    };
    if (user.token) {
      fetchCurrentUser();
    }
  }, []);

  if (target.eventClosed) {
    return <TicketSaleClosed />;
  }

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Other Event Details" />
      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      <ModalWindow show={modal.includes(NSE_REGISTRATION_MODAL)}>
        {user.token ? (
          currentUser ? (
            <div className="center_section pd--20">
              <FiX
                style={{ fontSize: "25px" }}
                className="x_icon"
                onClick={closeNotificationHandler}
              />
              <h3 className="center_text title">
                Finish registration as{" "}
                {currentUser.name + " " + currentUser.surname + " ?"}
              </h3>

              <div className="col-12">
                <label> Would you like to bring additional guest</label>
                <select
                  value={formData.hasExtraGuest ? "1" : "0"}
                  onChange={(e) =>
                    setFormData((prevState) => {
                      return {
                        ...prevState,
                        hasExtraGuest: e.target.value === "1",
                      };
                    })
                  }
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              {formData.hasExtraGuest && (
                <div className="col-12">
                  <label> Please type their name</label>

                  <input
                    type="text"
                    value={formData.extraGuestName}
                    onChange={(e) =>
                      setFormData((prevState) => {
                        return {
                          ...prevState,
                          extraGuestName: e.target.value,
                        };
                      })
                    }
                  ></input>
                </div>
              )}

              {formData.hasExtraGuest && !formData.extraGuestName ? (
                ""
              ) : (
                <button
                  disabled={loading}
                  onClick={submitMemberForm}
                  className="rn-button-style--2 rn-btn-reverse-green mt--30"
                >
                  {loading ? <Loader /> : <span>Register</span>}
                </button>
              )}
            </div>
          ) : (
            <Loader center />
          )
        ) : (
          <Formik
            className="inner"
            validationSchema={schema}
            onSubmit={async (values) => {
              try {
                const responseData = await sendRequest(
                  "event/register/non-society-event",
                  "POST",
                  {
                    event: target.title,
                    date: target.when,
                    user: "normal",
                    name: values.name + " " + values.surname,
                    phone: values.phone,
                    email: values.email,
                    notificationTypeTerms: values.notificationTypeTerms,
                  }
                );
                dispatch(
                  showNotification({
                    severity: "success",
                    summary: "Success",
                    detail:
                      "Your registration for the event is complete! The organizer will soon contact you!",
                  })
                );
                navigate("/");
                setTimeout(() => closeNotificationHandler(), 7000);
              } catch (err) {}
            }}
            initialValues={{
              name: "",
              surname: "",
              phone: "",
              email: "",
              notificationTerms: false,
              notificationTypeTerms: "",
            }}
          >
            {(setFieldValue) => (
              <Form
                encType="multipart/form-data"
                className="center_section"
                id="form"
                style={{ padding: "2%" }}
              >
                <h3>Fill your details and register</h3>
                <FiX className="x_icon" onClick={closeHandler} />

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
                      <PhoneInput
                        placeholder="WhatsApp Phone "
                        onChange={(value) => setFieldValue("phone", value)}
                      ></PhoneInput>
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
                    <div className="hor_section_nospace mt--40">
                      <Field
                        style={{ maxWidth: "30px", margin: "10px" }}
                        type="checkbox"
                        name="notificationTerms"
                      ></Field>
                      <p className="information">
                        I consent to being notified by the organizer through the
                        below contact/s
                      </p>
                    </div>
                    <ErrorMessage
                      className="error"
                      name="notificationTerms"
                      component="div"
                    />
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
                      name="notificationTypeTerms"
                      component="div"
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="rn-button-style--2 rn-btn-reverse-green mt--80"
                >
                  {loading ? <Loader /> : <span>Update information</span>}
                </button>
              </Form>
            )}
          </Formik>
        )}
      </ModalWindow>

      {/* Start Breadcrump Area */}
      <div
        className={`rn-page-title-area pt--120 pb--190 bg_image`}
        style={{ backgroundImage: `url(${imageUrl})` }}
        data-black-overlay="7"
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="rn-page-title text-center pt--100">
                <h2 className="title theme-gradient">{target.title}</h2>
                <p>{target.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Breadcrump Area */}

      {/* Start Portfolio Details */}
      <div className="rn-portfolio-details ptb--120 bg_color--1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="portfolio-details">
                <div className="inner">
                  <h2>About</h2>
                  <p dangerouslySetInnerHTML={{ __html: target.text }}></p>

                  <div className="portfolio-view-list d-flex flex-wrap">
                    <div className="port-view">
                      <span>When</span>
                      <h4>
                        {target.date}, {target.time}
                      </h4>
                    </div>

                    <div className="port-view">
                      <span>Where</span>
                      <h4>{target.where}</h4>
                    </div>

                    <div className="port-view">
                      <span>Fee</span>
                      <h4>Free</h4>
                    </div>
                  </div>
                  {!block && (
                    <button
                      onClick={() => {
                        dispatch(showModal(NSE_REGISTRATION_MODAL));
                      }}
                      className="rn-button-style--2 rn-btn-reverse-green"
                    >
                      Register
                    </button>
                  )}

                  {block && (
                    <p className="mt--20" style={{color: 'red'}}>
                      This event is only exclusive to members!
                    </p>
                  )}

                  {block && <MembershipBanner border={1}/>}
                </div>
                <br />
                {/* Start Contact Map  */}
                <div className="container">
                  <div className="rn-contact-map-area position-relative">
                    {/* <div style={{ height: "450px", width: "100%" }}>
                      <GoogleMapReact
                        defaultCenter={eventDetails[0].center}
                        defaultZoom={eventDetails[0].zoom}
                      >
                        <AnyReactComponent
                          lat={59.955413}
                          lng={30.337844}
                          text="My Marker"
                        />
                      </GoogleMapReact>
                    </div> */}
                  </div>
                </div>
                {/* End Contact Map  */}
                <br />
                <div className="portfolio-thumb-inner row">
                  {target.images?.length > 0 &&
                    target.images.map((value, index) => {
                      return (
                        <div
                          key={index}
                          className="col-lg-6 col-md-12 col-12 thumb center_div mb--30"
                        >
                          <ImageFb src={`${value}`} alt="Portfolio Images" />
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Portfolio Details */}

      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <Footer />
    </React.Fragment>
  );
};

export default NonSocietyEvent;
