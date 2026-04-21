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
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../redux/user";
import { removeModal, selectModal, showModal } from "../../redux/modal";
import { OTHER_EVENTS } from "../../util/defines/OTHER_EVENTS";
import { NSE_REGISTRATION_MODAL } from "../../util/defines/common";
import { showNotification } from "../../redux/notification";
import PhoneInput from "../../elements/inputs/common/PhoneInput";
import ImageFb from "../../elements/ui/media/ImageFb";
import TicketSaleClosed from "../../elements/ui/errors/Events/TicketSaleClosed";
import { createCustomerTicket } from "../../util/functions/ticket-creator";
import StickyButtonFooter from "../../elements/ui/functional/StickyButtonFooter";
import SponsoredByGala from "../../elements/ui/alerts/SponsoredByGala";

const schema = yup.object().shape({
  name: yup.string().required(),
  surname: yup.string().required(),
  phone: yup.string().required(),
  email: yup.string().email("Please enter a valid email").required(),
  policyTerms: yup.bool().required().oneOf([true], "Terms must be accepted"),
  payTerms: yup.bool().required().oneOf([true], "Terms must be accepted"),
});

const NonSocietyEvent = (props) => {
  const [currentUser, setCurrentUser] = useState(null);

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

  const bgImageUrl = target.bgImageExtra
    ? target.bgImageExtra
    : `/assets/images/bg/bg-image-${target.bgImage}.webp`;

  const closeModal = () => dispatch(removeModal(NSE_REGISTRATION_MODAL));

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
      <PageHelmet pageTitle={target.newTitle ?? target.title} />

      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      {/* Registration Modal */}
      <ModalWindow show={modal.includes(NSE_REGISTRATION_MODAL)}>
        {user.token && !currentUser ? (
          <Loader center />
        ) : (
          <Formik
            enableReinitialize
            validationSchema={schema}
            onSubmit={async (values) => {
              try {
                let response;
                if (user.token) {
                  const { ticketBlob } = await createCustomerTicket(
                    target.ticket_img,
                    values.name,
                    values.surname
                  );
                  const form = new FormData();
                  form.append(
                    "image",
                    ticketBlob,
                    target.title + "_" + values.name + values.surname + "_MEMBER"
                  );
                  form.append("event", target.title);
                  form.append("date", target.timeStamp);
                  form.append("user", "member");
                  form.append("name", values.name + " " + values.surname);
                  form.append("phone", values.phone);
                  form.append("email", values.email);
                  form.append("extraData", formData.extraGuestName);
                  form.append("notificationTypeTerms", "Any");
                  response = await sendRequest("event/register/non-society-event", "POST", form);
                } else {
                  const { ticketBlob } = await createCustomerTicket(
                    target.ticket_img,
                    values.name,
                    values.surname
                  );
                  const form = new FormData();
                  form.append(
                    "image",
                    ticketBlob,
                    target.title + "_" + values.name + values.surname + "_GUEST"
                  );
                  form.append("event", target.title);
                  form.append("date", target.timeStamp);
                  form.append("user", "guest");
                  form.append("name", values.name + " " + values.surname);
                  form.append("phone", values.phone);
                  form.append("email", values.email);
                  form.append("notificationTypeTerms", "Any");
                  response = await sendRequest("event/register/non-society-event", "POST", form);
                }
                if (!response) return;
                dispatch(
                  showNotification({
                    severity: "success",
                    summary: "Success",
                    detail:
                      "Your registration for the event is complete! Please check your email for confirmation!",
                  })
                );
                navigate("/");
              } catch (err) {}
            }}
            initialValues={{
              name: currentUser?.name || "",
              surname: currentUser?.surname || "",
              phone: currentUser?.phone || "",
              email: currentUser?.email || "",
              policyTerms: false,
              payTerms: false,
            }}
          >
            {({ setFieldValue }) => (
              <Form
                encType="multipart/form-data"
                className="center_section"
                id="form"
                style={{ padding: "2%" }}
              >
                <h3>Fill your details and register</h3>
                <FiX className="x_icon" onClick={closeModal} />

                <div className="col-12">
                  <div className="rn-form-group mt--20">
                    <Field type="text" placeholder="Name" name="name" />
                    <ErrorMessage className="error" name="name" component="div" />
                  </div>
                  <div className="rn-form-group mt--20">
                    <Field type="text" placeholder="Surname" name="surname" />
                    <ErrorMessage className="error" name="surname" component="div" />
                  </div>
                  <div className="rn-form-group mt--20">
                    <Field type="email" placeholder="Email" name="email" />
                    <ErrorMessage className="error" name="email" component="div" />
                  </div>
                  <div className="rn-form-group phone-input-container mt--20">
                    <PhoneInput
                      placeholder="WhatsApp Phone"
                      initialValue={currentUser?.phone || ""}
                      onChange={(value) => setFieldValue("phone", value)}
                    />
                    <p className="information">
                      Please type your number with + and country code
                    </p>
                    <ErrorMessage className="error" name="phone" component="div" />
                  </div>

                  {/* {user.token && (
                    <>
                      <div className="rn-form-group mt--20">
                        <label>Would you like to bring an additional guest?</label>
                        <select
                          value={formData.hasExtraGuest ? "1" : "0"}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              hasExtraGuest: e.target.value === "1",
                            }))
                          }
                        >
                          <option value="0">No</option>
                          <option value="1">Yes</option>
                        </select>
                      </div>
                      {formData.hasExtraGuest && (
                        <div className="rn-form-group mt--20">
                          <input
                            type="text"
                            placeholder="Guest name"
                            value={formData.extraGuestName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                extraGuestName: e.target.value,
                              }))
                            }
                          />
                        </div>
                      )}
                    </>
                  )} */}
                  <div className="hor_section_nospace mt--40">
                    <Field
                      style={{ maxWidth: "30px", margin: "10px" }}
                      type="checkbox"
                      name="policyTerms"
                    />
                    <p className="information">
                      I have read and accept the&nbsp;
                      <a
                        style={{ color: "#017363" }}
                        href="/terms-and-legals"
                        target="_blank"
                      >
                        society&apos;s policy
                      </a>
                    </p>
                  </div>
                  <ErrorMessage className="error" name="policyTerms" component="div" />

                  <div className="hor_section_nospace mt--20">
                    <Field
                      style={{ maxWidth: "30px", margin: "10px" }}
                      type="checkbox"
                      name="payTerms"
                    />
                    <p className="information">
                      I agree to share the provided information with the
                      organization in case they need to prove my identity
                    </p>
                  </div>
                  <ErrorMessage className="error" name="payTerms" component="div" />
                </div>

                <button
                  disabled={
                    loading ||
                    (formData.hasExtraGuest && !formData.extraGuestName)
                  }
                  type="submit"
                  className="rn-button-style--2 rn-btn-reverse-green mt--30"
                >
                  {loading ? <Loader /> : <span>Register</span>}
                </button>
              </Form>
            )}
          </Formik>
        )}
      </ModalWindow>

      {/* Breadcrumb Area */}
      <div
        className="rn-page-title-area pt--120 pb--190 bg_image"
        style={{ backgroundImage: `url(${bgImageUrl})` }}
        data-black-overlay="7"
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="rn-page-title text-center pt--100">
                <h2 className="title theme-gradient">
                  {target.newTitle ?? target.title}
                </h2>
                <p>{target.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Area */}
      <div className="rn-portfolio-details ptb--120 bg_color--1">
        <div className="container">
          <div className="row">
            {/* When / Where / Fee */}
            <div className="col-12 mb--20">
              <div
                className="portfolio-view-list d-flex flex-wrap"
                style={{ justifyContent: "space-between" }}
              >
                <div className="port-view">
                  <h3 style={{ fontSize: "24px" }}>When</h3>
                  <p>
                    {target.date}, {target.time}
                  </p>
                </div>
                <div className="port-view">
                  <h3 style={{ fontSize: "24px" }}>Where</h3>
                  <p>{target.where}</p>
                </div>
                <div className="port-view">
                  <h3 style={{ fontSize: "24px" }}>Entry fee</h3>
                  <p>{target.entry ?? "Free"}</p>
                </div>
              </div>
            </div>

            {/* Poster */}
            <div className="col-lg-5 col-md-12 mb--40">
              <div className="event-poster-wrapper">
                <ImageFb
                  src={target.poster}
                  alt={target.newTitle ?? target.title}
                  className="event-poster-image"
                />
              </div>
              <SponsoredByGala />
            </div>

            {/* About + Actions */}
            <div className="col-lg-7 col-md-12">
              <div className="portfolio-details">
                <div className="inner">
                  <h3 style={{ fontSize: "24px" }}>About</h3>
                  <p dangerouslySetInnerHTML={{ __html: target.text }} />

                  <StickyButtonFooter>
                    <div
                      className="purchase-btn gap-3"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {target?.ticketLink ? (
                        <a
                          href={target.ticketLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rn-button-style--2 rn-btn-reverse-green"
                        >
                          <span>Register</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => dispatch(showModal(NSE_REGISTRATION_MODAL))}
                          className="rn-button-style--2 rn-btn-reverse-green"
                        >
                          Register
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="rn-button-style--2 rn-btn-reverse-red"
                      >
                        <span>Back</span>
                      </button>
                    </div>
                  </StickyButtonFooter>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} style={{ fontSize: "26px" }} />
        </ScrollToTop>
      </div>

      <Footer />
    </React.Fragment>
  );
};

export default NonSocietyEvent;
