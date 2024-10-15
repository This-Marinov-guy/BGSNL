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
import WithBackBtn from "../../elements/ui/functional/WithBackBtn";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import { encryptData, isObjectEmpty } from "../../util/functions/helpers";
import NoEventFound from "../../elements/ui/errors/Events/NoEventFound";
import moment from "moment";
import { useDispatch } from "react-redux";
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

  const { region, eventId } = useParams();

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

      <div className="container mt--140 mb--40">
        <h2 className="center_text mb--80">Purchase a Ticket</h2>
        <div className="row">
          <div className="col-lg-4 col-md-12 col-12">
            <div className="mb--20">
              <ImageFb
                src={`${selectedEvent.poster}`}
                alt="Event"
                className="title_img"
              />
              <h2 className="mt--40">Event Details</h2>
              <p>Name: {selectedEvent.title}</p>
              <p>
                Date:{" "}
                {selectedEvent.correctedDate
                  ? moment(selectedEvent.correctedDate).format(
                      MOMENT_DATE_TIME
                    ) + " Updated!"
                  : moment(selectedEvent.date).format(MOMENT_DATE_TIME)}
              </p>
              <p>Address: {selectedEvent.location}</p>
              <p>
                <span
                  className="center_div j-start"
                >
                  Price :{" "}
                  {selectedEvent.isFree
                    ? " FREE"
                    : selectedEvent.product?.guest.price + " euro"}
                  {<DynamicTicketBadge product={selectedEvent?.product} />}
                </span>
              </p>
            </div>
          </div>
          <div style={{ width: "20%" }} className="col-lg-4 col-md-12 col-12">
            <div className="line" />
          </div>
          <div style={{ width: "40%" }} className="col-lg-4 col-md-12 col-12">
            <div className="container">
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
                      selectedEvent.ticketName
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
                  name: "",
                  surname: "",
                  email: "",
                  phone: "",
                  policyTerms: false,
                  payTerms: false,
                  ...constructInitialExtraFormValues(
                    selectedEvent?.extraInputsForm ?? null
                  ),
                }}
              >
                {(values, errors) => (
                  <Form
                    id="form"
                    encType="multipart/form-data"
                    className="mb--120"
                  >
                    <h3>Fill your details and buy a ticket</h3>
                    <div className="row">
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
                        <div className="rn-form-group">
                          <Field type="tel" placeholder="Phone" name="phone" />
                          <p className="information">
                            Please enter your real number as it might be used to
                            prove your identity on the entry
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
                              href="/assets/documents/Rules and regulations.pdf"
                              selectedEvent="_blank"
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
                      <div
                        className="col-lg-12 col-md-12 col-12 mt--20"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <h3>Quantity</h3>
                        <InputNumber
                          value={quantity}
                          onValueChange={(e) => setQuantity(e.value)}
                          showButtons
                          buttonLayout="horizontal"
                          style={{ width: "160px" }}
                          decrementButtonClassName="p-button-danger"
                          incrementButtonClassName="p-button-success"
                          min={1}
                          max={10}
                        />
                      </div>
                    </div>
                    <div className="center_div_col">
                      <WithBackBtn>
                        <button
                          onClick={() => handleErrorMsg(errors)}
                          disabled={isLoading}
                          type="submit"
                          className="rn-button-style--2 rn-btn-reverse-green mt--20"
                        >
                          {isLoading ? <Loader /> : <span>Payment</span>}
                        </button>
                      </WithBackBtn>
                      {normalTicket && (
                        <Message
                          severity="warn"
                          className="center_div mt--20"
                          text="You already have redeemed your discount - if you proceed, you will pay the full ticket price"
                        />
                      )}
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <Footer />
    </Fragment>
  );
};

export default GuestPurchase;
