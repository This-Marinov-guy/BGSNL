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
import { OTHER_EVENTS } from "../../util/defines/OTHER_EVENTS";
import { formatCorrectedDateTime } from "../../util/functions/date";
import { NSE_REGISTRATION_MODAL } from "../../util/defines/common";
import { showNotification } from "../../redux/notification";
import ImageFb from "../../elements/ui/media/ImageFb";
import StickyButtonFooter from "../../elements/ui/functional/StickyButtonFooter";

const schema = yup.object().shape({
  fullName: yup.string().trim().required("Името и фамилията са задължителни"),
  email: yup
    .string()
    .email("Моля, въведи валиден имейл адрес")
    .required("Имейл адресът е задължителен"),
  university: yup.string().trim().required("Университетът е задължителен"),
  course: yup.string().trim().required("Специалността е задължителна"),
  questions: yup.string().max(1500, "Максималната дължина е 1500 символа"),
  policyTerms: yup
    .bool()
    .required()
    .oneOf([true], "Трябва да приемеш политиката"),
  payTerms: yup
    .bool()
    .required()
    .oneOf([true], "Трябва да дадеш съгласие за споделяне на данните"),
});

const isTicketTimerFinished = (ticketTimer) => {
  if (!ticketTimer) return false;

  const timerValue = new Date(ticketTimer).valueOf();

  return Number.isFinite(timerValue) && timerValue <= Date.now();
};

const NonSocietyEvent = () => {
  const { eventId } = useParams();
  const target =
    OTHER_EVENTS.find((event) => event.id === eventId) ?? OTHER_EVENTS[0];
  const [currentUser, setCurrentUser] = useState(null);
  const [ticketTimerClosed, setTicketTimerClosed] = useState(() =>
    isTicketTimerFinished(target.ticketTimer)
  );
  const { loading, sendRequest } = useHttpClient();

  const user = useSelector(selectUser);
  const modal = useSelector(selectModal);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const bgImageUrl = target.bgImageExtra
    ? target.bgImageExtra
    : `/assets/images/bg/bg-image-${target.bgImage}.webp`;

  const closeModal = () => dispatch(removeModal(NSE_REGISTRATION_MODAL));

  const eventSoldOut = target.eventClosed || ticketTimerClosed;

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
  }, [user.token]);

  useEffect(() => {
    if (!target.ticketTimer || ticketTimerClosed) return undefined;

    const timer = setInterval(() => {
      if (isTicketTimerFinished(target.ticketTimer)) {
        setTicketTimerClosed(true);
        dispatch(removeModal(NSE_REGISTRATION_MODAL));
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch, target.ticketTimer, ticketTimerClosed]);

  const baseUrl = "https://www.bulgariansociety.nl";
  const eventTitle = target.newTitle ?? target.title;
  const eventDescription = (target.description || target.text)
    ?.replace(/<[^>]*>/g, "")
    .trim()
    .substring(0, 160);
  const eventImage = target.poster
    ? `${baseUrl}${target.poster}`
    : undefined;
  const eventUrl = `${baseUrl}/other-event-details/${target.id}`;

  const memberUniversity =
    currentUser?.university === "other"
      ? currentUser?.otherUniversityName || ""
      : currentUser?.university || currentUser?.otherUniversityName || "";
  const memberCourse = currentUser?.course || "";

  return (
    <React.Fragment>
      <PageHelmet
        pageTitle={eventTitle}
        description={eventDescription}
        image={eventImage}
        type="event"
        canonicalUrl={eventUrl}
        keywords={`${eventTitle}, PwC Bulgaria, Sofia, careers, BGSNL`}
      />

      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      {/* Registration Modal */}
      <ModalWindow show={!eventSoldOut && modal.includes(NSE_REGISTRATION_MODAL)}>
        {user.token && !currentUser ? (
          <Loader center />
        ) : (
          <Formik
            enableReinitialize
            validationSchema={schema}
            onSubmit={async (values) => {
              try {
                const form = new FormData();
                form.append("event", target.title);
                form.append("date", target.timeStamp);
                form.append("timezone", target.timezone);
                form.append("user", user.token ? "member" : "guest");
                form.append("name", values.fullName.trim());
                form.append("email", values.email);
                form.append("phone", currentUser?.phone || "-");
                form.append("university", values.university.trim());
                form.append("course", values.course.trim());
                form.append("questions", values.questions.trim());
                form.append("referenceCode", target.referenceCode);
                form.append("ticketImg", target.ticket_img);
                form.append("origin_url", window.location.origin);
                form.append("notificationTypeTerms", "Any");

                const response = await sendRequest(
                  "event/register/non-society-event",
                  "POST",
                  form
                );
                if (!response) return;
                dispatch(
                  showNotification({
                    severity: "success",
                    summary: "Успешна регистрация",
                    detail:
                      "Регистрацията ти е завършена. Провери имейла си за потвърждение.",
                  })
                );
                navigate("/");
              } catch (err) {
                console.error("PwC event registration failed", err);
              }
            }}
            initialValues={{
              fullName: currentUser
                ? `${currentUser.name || ""} ${currentUser.surname || ""}`.trim()
                : "",
              email: currentUser?.email || "",
              university: memberUniversity,
              course: memberCourse,
              questions: "",
              policyTerms: false,
              payTerms: false,
            }}
          >
            {() => (
              <Form
                encType="multipart/form-data"
                className="center_section"
                id="form"
                style={{ padding: "2%" }}
              >
                <h3>Регистрация за {target.title}</h3>
                <FiX className="x_icon" onClick={closeModal} />

                <div className="col-12">
                  <div className="rn-form-group mt--20">
                    <label htmlFor="fullName">Име и фамилия</label>
                    <Field
                      id="fullName"
                      type="text"
                      placeholder="Име и фамилия"
                      name="fullName"
                    />
                    <ErrorMessage className="error" name="fullName" component="div" />
                  </div>
                  <div className="rn-form-group mt--20">
                    <label htmlFor="email">Имейл адрес</label>
                    <Field id="email" type="email" placeholder="Имейл адрес" name="email" />
                    <ErrorMessage className="error" name="email" component="div" />
                  </div>
                  <div className="rn-form-group mt--20">
                    <label htmlFor="university">
                      Университет, в който учиш или си завършил/а
                    </label>
                    <Field
                      id="university"
                      type="text"
                      placeholder="Университет"
                      name="university"
                    />
                    <ErrorMessage className="error" name="university" component="div" />
                  </div>
                  <div className="rn-form-group mt--20">
                    <label htmlFor="course">Каква специалност учиш или си завършил/а?</label>
                    <Field
                      id="course"
                      type="text"
                      placeholder="Специалност"
                      name="course"
                    />
                    <ErrorMessage className="error" name="course" component="div" />
                  </div>
                  <div className="rn-form-group mt--20">
                    <label htmlFor="questions">
                      Имаш ли въпроси, които искаш да адресираме на събитието?
                    </label>
                    <Field
                      as="textarea"
                      id="questions"
                      rows="4"
                      placeholder="Въпросите ти (по желание)"
                      name="questions"
                    />
                    <ErrorMessage className="error" name="questions" component="div" />
                  </div>
                  <div className="hor_section_nospace mt--40">
                    <Field
                      style={{ maxWidth: "30px", margin: "10px" }}
                      type="checkbox"
                      name="policyTerms"
                    />
                    <p className="information">
                      Прочетох и приемам&nbsp;
                      <a
                        style={{ color: "#017363" }}
                        href="/terms-and-legals"
                        target="_blank"
                        rel="noreferrer"
                      >
                        политиката на сдружението
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
                      Съгласявам се предоставената информация да бъде споделена
                      с PwC България за целите на събитието
                    </p>
                  </div>
                  <ErrorMessage className="error" name="payTerms" component="div" />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="rn-button-style--2 rn-btn-reverse-green mt--30"
                >
                  {loading ? <Loader /> : <span>Регистрирай се</span>}
                </button>
              </Form>
            )}
          </Formik>
        )}
      </ModalWindow>

      {/* Breadcrumb Area */}
      <div
      className="rn-page-title-area pt--120 pb--190 bg_image"
      style={{
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}   
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
                  <h3 style={{ fontSize: "24px" }}>Кога</h3>
                  <p>
                    {target.date}, {target.time}
                  </p>
                  {target.correctedDate && (
                    <p style={{ color: "#f80707" }} className="error">
                      {"Updated Date/Time -> " +
                        formatCorrectedDateTime(target.correctedDate)}
                    </p>
                  )}
                </div>
                <div className="port-view">
                  <h3 style={{ fontSize: "24px" }}>Къде</h3>
                  <p>{target.where}</p>
                </div>
                <div className="port-view">
                  <h3 style={{ fontSize: "24px" }}>Вход</h3>
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
            </div>

            {/* About + Actions */}
            <div className="col-lg-7 col-md-12">
              <div className="portfolio-details">
                <div className="inner">
                  <h3 style={{ fontSize: "24px" }}>За събитието</h3>
                  <div dangerouslySetInnerHTML={{ __html: target.text }} />

                  {eventSoldOut ? (
                    <div className="purchase-btn text-center mt--40">
                      <h3 style={{ color: "#f80707", fontSize: "24px" }}>
                        Регистрацията е затворена.
                      </h3>
                      <p className="information">
                        Благодарим ти за интереса към събитието.
                      </p>
                    </div>
                  ) : (
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
                            <span>Регистрирай се</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => dispatch(showModal(NSE_REGISTRATION_MODAL))}
                            className="rn-button-style--2 rn-btn-reverse-green"
                          >
                            Регистрирай се
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate(-1)}
                          className="rn-button-style--2 rn-btn-reverse-red"
                        >
                          <span>Назад</span>
                        </button>
                      </div>
                    </StickyButtonFooter>
                  )}
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
