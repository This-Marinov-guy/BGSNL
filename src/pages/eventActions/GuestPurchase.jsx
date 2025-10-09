import React, { Fragment, useEffect, useState } from "react";
import * as yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useHttpClient } from "../../hooks/common/http-hook";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import Footer from "../../component/footer/Footer";
import ImageFb from "../../elements/ui/media/ImageFb";
import { Message } from "primereact/message";
import Loader from "../../elements/ui/loading/Loader";
import { InputNumber } from "primereact/inputnumber";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import {
  createCustomerTicket,
  createQrCodeCheckGuest,
} from "../../util/functions/ticket-creator";
import FormExtras from "../../elements/ui/forms/FormExtras";
import { useNavigate, useParams, Link } from "react-router-dom";
import MembershipBanner from "../../elements/banners/MembershipBanner";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import { encryptData, isObjectEmpty } from "../../util/functions/helpers";
import NoEventFound from "../../elements/ui/errors/Events/NoEventFound";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { MOMENT_DATE_TIME } from "../../util/functions/date";
import ExternalPlatformTicketSale from "../../elements/ui/errors/Events/ExternalPlatformTicketSale";
import TicketSaleClosed from "../../elements/ui/errors/Events/TicketSaleClosed";
import ExclusiveMemberEvent from "../../elements/ui/errors/Events/MemeberExclusiveEvents";
import { showNotification } from "../../redux/notification";
import { INCORRECT_MISSING_DATA } from "../../util/defines/common";
import { error } from "jquery";
import {
  appendExtraInputsToForm,
  buildSchemaExtraInputs,
  constructInitialExtraFormValues,
} from "../../util/functions/input-helpers";
import DynamicTicketBadge from "../../elements/ui/badges/DynamicTicketBadge";
import PhoneInput from "../../elements/inputs/common/PhoneInput";
import SponsoredBySmall from "../../elements/ui/alerts/SponsoredBySmall";
import CardInputs from "../../elements/inputs/common/CardInputs";
import { selectUser } from "../../redux/user";

const defaultSchema = yup.object().shape({
  name: yup.string().required(),
  surname: yup.string().required(),
  phone: yup.string().required(),
  email: yup.string().email("Please enter a valid email").required(),
  policyTerms: yup.bool().required().oneOf([true], "Terms must be accepted"),
  payTerms: yup.bool().required().oneOf([true], "Terms must be accepted"),
});

const GuestPurchase = () => {
  const { loading, sendRequest, forceStartLoading } = useHttpClient();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventClosed, setEventClosed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [normalTicket, setNormalTicket] = useState(false);
  const [schema, setSchema] = useState(null);
  const [schemaFields, setSchemaFields] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const { region, eventId } = useParams();

  const user = useSelector(selectUser);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const buyFreeTicket = async (formData) => {
    await sendRequest("event/purchase-ticket/guest", "POST", formData);
    sessionStorage.setItem("prevUrl", window.location.href);
    navigate("/success");
  };

  const handleErrorMsg = (errors) => {
    if (!isObjectEmpty(errors)) {
      dispatch(showNotification(INCORRECT_MISSING_DATA));
    }
  };

  useEffect(() => {
    setLoadingPage(true);

    const fetchCurrentUser = async () => {
      if (!user?.token) return;

      try {
        const responseData = await sendRequest(
          `user/current`,
          "GET",
          null,
          {},
          false,
          false
        );
        setCurrentUser(responseData.user);
      } catch (err) {
        // do nothing
      }
    };

    const getEventDetails = async () => {
      try {
        const responseData = await sendRequest(
          `future-event/full-event-details/${eventId}`,
          "GET",
          null,
          {},
          false
        );
        setSelectedEvent(responseData.event);
        setEventClosed(!responseData.status);

        if (responseData.event.hasOwnProperty("extraInputsForm")) {
          const { schema, schemaFields } = buildSchemaExtraInputs(
            responseData.event?.extraInputsForm ?? null,
            defaultSchema
          );
          setSchema(schema);
          setSchemaFields(schemaFields);
        }
      } catch (err) {
      } finally {
        setLoadingPage(false);
      }
    };

    getEventDetails();
    fetchCurrentUser();
  }, []);

  if (loadingPage) {
    return <HeaderLoadingError />;
  } else if (!selectedEvent) {
    return <NoEventFound />;
  }

  if (eventClosed) {
    return <TicketSaleClosed />;
  }

  if (selectedEvent.ticketLink) {
    return <ExternalPlatformTicketSale link={selectedEvent.ticketLink} />;
  }

  if (selectedEvent.membersOnly) {
    return <ExclusiveMemberEvent />;
  }

  return (
    <Fragment>
      <PageHelmet pageTitle="Buy Ticket" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      <div className="container mt--140 mb--120">
        <h2
          className="center_text mb--60 mb_md--40 mb_sm--30"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
        >
          Purchase a Ticket
        </h2>

        {selectedEvent?.product?.member?.price && <MembershipBanner />}

        <div
          className="row team_member_border_1 team_border_long_add_on"
          style={{
            padding: "clamp(10px, 4vw, 40px)",
          }}
        >
          <div className="col-12 mb--40">
            <div className="row g-4 align-items-center">
              {/* Event Poster */}
              <div className="col-12 col-md-4 col-lg-3">
                <div className="d-flex justify-content-center">
                  <ImageFb
                    src={`${selectedEvent.poster}`}
                    alt="Event"
                    className="title_img"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      maxHeight: "250px",
                      objectFit: "contain",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                </div>
              </div>

              {/* Event Details */}
              <div className="col-12 col-md-8 col-lg-9">
                <h2
                  className="mb--30 text-center text-md-start"
                  style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)" }}
                >
                  Event Details
                </h2>
                <div className="information-container">
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-sm-6 col-md-3">
                      <div className="detail-item text-center">
                        <strong
                          className="d-block mb-1"
                          style={{ color: "#017363" }}
                        >
                          Name:
                        </strong>
                        <span>{selectedEvent.title}</span>
                      </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-3">
                      <div className="detail-item text-center">
                        <strong
                          className="d-block mb-1"
                          style={{ color: "#017363" }}
                        >
                          Date:
                        </strong>
                        <span>
                          {selectedEvent.correctedDate
                            ? moment(selectedEvent.correctedDate).format(
                                MOMENT_DATE_TIME
                              ) + " Updated!"
                            : moment(selectedEvent.date).format(
                                MOMENT_DATE_TIME
                              )}
                        </span>
                      </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-3">
                      <div className="detail-item text-center">
                        <strong
                          className="d-block mb-1"
                          style={{ color: "#017363" }}
                        >
                          Address:
                        </strong>
                        <span style={{ wordBreak: "break-word" }}>
                          {selectedEvent.location}
                        </span>
                      </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-3">
                      <div className="detail-item text-center">
                        <strong
                          className="d-block mb-1"
                          style={{ color: "#017363" }}
                        >
                          Price:
                        </strong>
                        <div className="d-flex align-items-center justify-content-center flex-wrap gap-2">
                          <span>
                            {selectedEvent.isFree
                              ? "FREE"
                              : selectedEvent.product?.guest.price + " euro"}
                          </span>
                          <DynamicTicketBadge
                            product={selectedEvent?.product}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <SponsoredBySmall />
            </div>

            <div className="col-12">
              <Formik
                validationSchema={schema}
                onSubmit={async (values) => {
                  try {
                    setIsLoading(true);

                    let allowDiscount = false;
                    const isGuestForDiscount =
                      selectedEvent.discountPass &&
                      (selectedEvent.discountPass.includes(values.email) ||
                        selectedEvent.discountPass.includes(
                          values.name + " " + values.surname
                        ));
                    const isGuestForFreeTicket =
                      selectedEvent.freePass &&
                      (selectedEvent.freePass.includes(values.email) ||
                        selectedEvent.freePass.includes(
                          values.name + " " + values.surname
                        ));

                    // TODO: add functionality for multiple tickets
                    if (
                      !normalTicket &&
                      (isGuestForDiscount || isGuestForFreeTicket)
                    ) {
                      const checkDiscounts = await sendRequest(
                        `event/check-guest-discount/${eventId}`,
                        "POST",
                        {
                          email: values.email,
                          name: values.name,
                          surname: values.surname,
                        }
                      );

                      if (
                        !checkDiscounts.hasOwnProperty("status") &&
                        !checkDiscounts.status
                      ) {
                        dispatch(
                          showNotification({
                            severity: "warn",
                            detail:
                              "You already have an applied bonus for this event - you can still proceed the checkout but will pay the guest price!",
                            life: 1200,
                          })
                        );
                        setNormalTicket(true);
                        return;
                      } else {
                        allowDiscount = true;
                      }
                    }

                    const data = {
                      eventId: selectedEvent.id,
                      code: new Date().valueOf(),
                      quantity,
                    };

                    const hasQR = selectedEvent.ticketQR;
                    const qrCode = hasQR ? createQrCodeCheckGuest(data) : "";

                    const { ticketBlob } = await createCustomerTicket(
                      selectedEvent.ticketImg,
                      values.name,
                      values.surname,
                      selectedEvent.ticketColor,
                      qrCode,
                      selectedEvent.ticketName,
                      quantity
                    );

                    // formData
                    const formData = new FormData();
                    formData.append(
                      "image",
                      ticketBlob,
                      selectedEvent.id +
                        "_" +
                        values.name +
                        values.surname +
                        "_GUEST"
                    );
                    formData.append("region", region);
                    formData.append("quantity", quantity);
                    formData.append("origin_url", window.location.origin);
                    formData.append("method", "buy_guest_ticket");
                    formData.append("eventId", selectedEvent.id);
                    formData.append("code", data.code);
                    formData.append("guestEmail", values.email);

                    if (selectedEvent?.extraInputsForm) {
                      appendExtraInputsToForm(formData, schemaFields, values);
                    }

                    if (
                      selectedEvent?.addOns?.isEnabled &&
                      values.addOns?.length > 0
                    ) {
                      formData.append("addOns", JSON.stringify(values.addOns));
                    }

                    formData.append(
                      "guestName",
                      values.name + " " + values.surname
                    );
                    formData.append("guestPhone", values.phone);

                    if (selectedEvent.isFree) {
                      return await buyFreeTicket(formData);
                    }

                    if (
                      allowDiscount &&
                      (isGuestForDiscount || isGuestForFreeTicket)
                    ) {
                      if (isGuestForFreeTicket) {
                        return await buyFreeTicket(formData);
                      } else {
                        formData.append(
                          "itemId",
                          selectedEvent.product?.activeMember.priceId ??
                            selectedEvent.product?.member.priceId
                        );
                      }
                    } else {
                      formData.append(
                        "itemId",
                        selectedEvent.product?.guest.priceId
                      );
                    }

                    const responseData = await sendRequest(
                      "payment/checkout/guest-ticket",
                      "POST",
                      formData
                    );

                    if (responseData.url) {
                      sessionStorage.setItem("prevUrl", window.location.href);
                      window.location.assign(responseData.url);
                    }
                  } catch (err) {
                    // console.log(err)
                  } finally {
                    setIsLoading(false);
                  }
                }}
                initialValues={{
                  name: currentUser?.name ?? "",
                  surname: currentUser?.surname ?? "",
                  email: currentUser?.email ?? "",
                  phone: currentUser?.phone ?? "",
                  policyTerms: false,
                  payTerms: false,
                  ...constructInitialExtraFormValues(
                    selectedEvent?.extraInputsForm ?? null
                  ),
                  addOns: [],
                }}
              >
                {({ values, setFieldValue, errors }) => (
                  <Form
                    id="form"
                    encType="multipart/form-data"
                    className="row g-4"
                  >
                    <div className="col-12">
                      <h3
                        className="mb--30 text-center text-md-start"
                        style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.75rem)" }}
                      >
                        Fill your details and buy a ticket
                      </h3>
                    </div>
                    <div className="col-12">
                      <div className="row g-3">
                        <div className="col-lg-12 col-md-12 col-12">
                          <div className="rn-form-group">
                            <Field type="text" placeholder="Name" name="name" />
                            <ErrorMessage
                              className="error"
                              name="name"
                              component="div"
                            />
                          </div>
                        </div>
                        <div className="col-lg-12 col-md-12 col-12">
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
                        <div className="col-lg-12 col-md-12 col-12">
                          <div className="rn-form-group">
                            <Field
                              type="email"
                              placeholder="Email"
                              name="email"
                            />
                            <p className="information">
                              Please enter an email you have access to as the
                              ticket will be send through it
                            </p>
                            <ErrorMessage
                              className="error"
                              name="email"
                              component="div"
                            />
                          </div>
                        </div>
                        <div className="col-lg-12 col-md-12 col-12">
                          <div className="rn-form-group phone-input-container">
                            <PhoneInput
                              onChange={(value) =>
                                setFieldValue("phone", value)
                              }
                            />{" "}
                            <p className="information">
                              Please enter your real number as it might be used
                              to prove your identity on the entry
                            </p>
                            <ErrorMessage
                              className="error"
                              name="phone"
                              component="div"
                            />
                          </div>
                        </div>

                        {selectedEvent.extraInputsForm?.length > 0 && (
                          <FormExtras inputs={selectedEvent.extraInputsForm} />
                        )}
                      </div>
                    </div>

                    {selectedEvent?.addOns?.isEnabled &&
                      selectedEvent.addOns?.items?.length > 0 && (
                        <div className="col-12">
                          <h3
                            className="text-center mb--20"
                            style={{
                              fontSize: "clamp(1.125rem, 2.5vw, 1.75rem)",
                            }}
                          >
                            {selectedEvent.addOns.title}
                          </h3>
                          <p
                            className="text-center mb--30"
                            style={{ fontSize: "0.875rem", color: "#666" }}
                          >
                            {selectedEvent.addOns?.multi
                              ? "*You can add one or more"
                              : "*You can add only one"}
                          </p>
                          <CardInputs
                            multi={selectedEvent.addOns?.multi}
                            items={selectedEvent.addOns?.items}
                            values={values.addOns}
                            onSelect={(value) => setFieldValue("addOns", value)}
                          />
                        </div>
                      )}

                    <div className="col-lg-12 col-md-12 col-12">
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
                            href={"/terms-and-legals"}
                            target="_blank"
                          >
                            society's policy
                          </a>
                        </p>
                      </div>
                      <ErrorMessage
                        className="error"
                        name="policyTerms"
                        component="div"
                      />
                    </div>

                    <div className="col-lg-12 col-md-12 col-12">
                      <div className="hor_section_nospace mt--40">
                        <Field
                          style={{ maxWidth: "30px", margin: "10px" }}
                          type="checkbox"
                          name="payTerms"
                        ></Field>
                        <p className="information">
                          I agree to share the provided information with the
                          organization in case they need to prove my identity
                        </p>
                      </div>
                      <ErrorMessage
                        className="error"
                        name="payTerms"
                        component="div"
                      />
                    </div>
                    <div className="col-12">
                      <div
                        className="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-3 p-3"
                        style={{
                          background: "#f9f9f9",
                          borderRadius: "8px",
                        }}
                      >
                        <h3
                          className="mb--0"
                          style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
                        >
                          Quantity:
                        </h3>
                        <InputNumber
                          value={quantity}
                          onValueChange={(e) => setQuantity(e.value)}
                          showButtons
                          buttonLayout="horizontal"
                          style={{ width: "clamp(140px, 40vw, 160px)" }}
                          decrementButtonClassName="p-button-danger"
                          incrementButtonClassName="p-button-success"
                          min={1}
                          max={10}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      {normalTicket && (
                        <Message
                          severity="warn"
                          className="mb--20"
                          text="You already have redeemed your discount - if you proceed, you will pay the full ticket price"
                        />
                      )}

                      <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3 mt--30 mb--50">
                        <button
                          onClick={() => handleErrorMsg(errors)}
                          disabled={isLoading}
                          type="submit"
                          className="rn-button-style--2 rn-btn-reverse-green"
                          style={{
                            width: "100%",
                            maxWidth: "300px",
                            minWidth: "clamp(150px, 40vw, 200px)",
                            padding:
                              "clamp(10px, 2vw, 12px) clamp(16px, 4vw, 24px)",
                          }}
                        >
                          {isLoading ? (
                            <Loader />
                          ) : (
                            <span>Proceed to Payment</span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(-1)}
                          className="rn-button-style--2 rn-btn-reverse-red"
                          style={{
                            width: "100%",
                            maxWidth: "300px",
                            minWidth: "clamp(150px, 40vw, 200px)",
                            padding:
                              "clamp(10px, 2vw, 12px) clamp(16px, 4vw, 24px)",
                          }}
                        >
                          <span>Back</span>
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
        {/* Start Back To Top */}
        <div className="backto-top">
          <ScrollToTop showUnder={160}>
            <FiChevronUp size={26} style={{ fontSize: "26px" }} />
          </ScrollToTop>
        </div>
      </div>
      {/* End Back To Top */}

      <Footer />
    </Fragment>
  );
};

export default GuestPurchase;
