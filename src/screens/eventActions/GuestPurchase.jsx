"use client";

import {
  Fragment,
  useEffect,
  useState,
} from "react";
import {
  ErrorMessage,
  Field,
  Form,
} from "formik";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import * as yup from "yup";
import { InputNumber } from "@/compat/primereact";
import ScrollToTop from "@/component/common/ScrollToTop";
import {
  FiChevronUp,
  IconlyArrowLeft,
  IconlyArrowRight,
  IconlyMinus,
  IconlyPlus,
} from "@/elements/ui/icons/IconlyIcons";
import {
  useNavigate,
  useParams,
} from "@/util/navigation";
import PageHelmet from "../../component/common/Helmet";
import Footer from "../../component/footer/Footer";
import HeaderTwo from "../../component/header/HeaderTwo";
import MembershipOfferBanner from "../../elements/banners/MembershipOfferBanner";
import PhoneInput from "../../elements/inputs/common/PhoneInput";
import MobilePurchaseSummary from "../../elements/purchase/MobilePurchaseSummary";
import PurchaseEventSummary from "../../elements/purchase/PurchaseEventSummary";
import {
  PurchaseAddOns,
  PurchaseAdditionalInformation,
} from "../../elements/purchase/PurchaseFormOptions";
import BillingStatusBanner from "../../elements/subscriptions/BillingStatusBanner";
import SponsoredBySmall from "../../elements/ui/alerts/SponsoredBySmall";
import DynamicTicketBadge from "../../elements/ui/badges/DynamicTicketBadge";
import ExternalPlatformTicketSale from "../../elements/ui/errors/Events/ExternalPlatformTicketSale";
import ExclusiveMemberEvent from "../../elements/ui/errors/Events/MemeberExclusiveEvents";
import NoEventFound from "../../elements/ui/errors/Events/NoEventFound";
import TicketSaleClosed from "../../elements/ui/errors/Events/TicketSaleClosed";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import ValidatedFormik from "../../elements/ui/forms/ValidatedFormik";
import Loader from "../../elements/ui/loading/Loader";
import { useHttpClient } from "../../hooks/common/http-hook";
import { selectUser } from "../../redux/user";
import { showNotification } from "../../redux/notification";
import { ANALYTICS_EVENTS, ANALYTICS_PROPERTIES } from "../../util/analytics/events.mjs";
import {
  clarityEvent,
  hasAppliedTicketDiscount,
  ticketPriceAmountByEvent,
} from "../../util/functions/helpers";
import {
  appendExtraInputsToForm,
  buildSchemaExtraInputs,
  constructInitialExtraFormValues,
} from "../../util/functions/input-helpers";

const defaultSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  surname: yup.string().required("Surname is required"),
  phone: yup
    .string()
    .required("Phone number is required")
    .min(8, "Please enter a valid phone number")
    .max(40, "Please enter a valid phone number"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  policyTerms: yup.bool().required().oneOf([true], "Terms must be accepted"),
  payTerms: yup.bool().required().oneOf([true], "Terms must be accepted"),
  quantity: yup
    .number()
    .typeError("Please enter a valid quantity")
    .integer("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(10, "Quantity cannot be greater than 10")
    .required("Quantity is required"),
  addOns: yup.array(),
});

const buildGuestValidation = (event) => {
  let validationSchema = defaultSchema;
  let schemaFields = null;

  if (event?.extraInputsForm) {
    const extraValidation = buildSchemaExtraInputs(
      event.extraInputsForm,
      defaultSchema
    );
    validationSchema = extraValidation.schema;
    schemaFields = extraValidation.schemaFields;
  }

  if (event?.addOns?.isMandatory) {
    validationSchema = validationSchema.shape({
      addOns: yup
        .array()
        .min(1, "Please choose an option")
        .required("Please choose an option"),
    });
  }

  return { schema: validationSchema, schemaFields };
};

const formatEuro = (value) =>
  new globalThis.Intl.NumberFormat("en-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

// `initialEvent` is fetched on the server by the route. The guest flow needs
// no authenticated user, so it renders fully server-side.
const GuestPurchase = ({ initialEvent = null }) => {
  const dispatch = useDispatch();
  const { sendRequest } = useHttpClient();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(!initialEvent);
  const [selectedEvent, setSelectedEvent] = useState(initialEvent);
  const [eventClosed, setEventClosed] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [{ schema, schemaFields }, setValidation] = useState(() =>
    buildGuestValidation(initialEvent)
  );
  const [currentUser, setCurrentUser] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
  });

  const { region, eventId } = useParams();
  const eventRecordId = initialEvent?.id || selectedEvent?.id || eventId;

  const user = useSelector(selectUser);
  const userIsLoggedIn = Boolean(user?.session);

  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    setLoadingPage(true);

    const fetchCurrentUser = async () => {
      if (!user?.session) return;

      try {
        const responseData = await sendRequest(
          `user/current`,
          "GET",
          null,
          {},
          false,
          false,
          { signal: controller.signal }
        );
        if (!controller.signal.aborted && responseData?.user) setCurrentUser(responseData.user);
      } catch (err) {
        // do nothing
      }
    };

    const getEventDetails = async () => {
      try {
        const responseData = await sendRequest(
          `future-event/full-event-details/${eventRecordId}`,
          "GET",
          null,
          {},
          false,
          false,
          { signal: controller.signal }
        );
        if (controller.signal.aborted || !responseData?.event) return;
        setSelectedEvent(responseData.event);
        setEventClosed(!responseData.status);

        setValidation(buildGuestValidation(responseData.event));
      } catch (err) {
        // The shared request hook presents the error state.
      } finally {
        if (!controller.signal.aborted) setLoadingPage(false);
      }
    };

    getEventDetails();
    fetchCurrentUser();
    return () => controller.abort();
  }, [eventRecordId, sendRequest, user?.session]);

  // Keep server-rendered content on screen while the mount-time refetch runs.
  if (loadingPage && !selectedEvent) {
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

  if (selectedEvent.memberOnly) {
    return <ExclusiveMemberEvent />;
  }

  const showMembershipOffer =
    !userIsLoggedIn && selectedEvent?.product?.member?.price != null;
  const guestPrice = Number(selectedEvent?.product?.guest?.price);
  const memberPrice = selectedEvent.isMemberFree
    ? 0
    : Number(selectedEvent?.product?.member?.price);
  const membershipSaving =
    Number.isFinite(guestPrice) &&
    Number.isFinite(memberPrice) &&
    guestPrice > memberPrice
      ? guestPrice - memberPrice
      : null;
  const membershipOfferTitle = membershipSaving
    ? `Save ${formatEuro(membershipSaving)} and keep your ticket as a member`
    : "Keep your ticket as a member";
  const baseTicketPrice = ticketPriceAmountByEvent(selectedEvent, user);
  const addOnTotal = selectedAddOns.reduce(
    (total, item) => total + (Number(item?.price) || 0),
    0
  );
  const checkoutTotal = baseTicketPrice === null
    ? null
    : baseTicketPrice * ticketQuantity + addOnTotal;
  const displayedTicketPrice = checkoutTotal === null
    ? "TBA"
    : checkoutTotal === 0
      ? "Free"
      : (
        <span className="purchase-total-price" key={checkoutTotal} aria-live="polite" aria-atomic="true">
          {formatEuro(checkoutTotal)}
        </span>
      );
  const discountApplied = hasAppliedTicketDiscount(selectedEvent, user);
  const checkoutActionLabel = checkoutTotal === 0
    ? "Get ticket"
    : "Proceed to payment";

  return (
    <Fragment>
      <PageHelmet
        pageTitle={selectedEvent.newTitle || selectedEvent.title}
        description={(selectedEvent.description || selectedEvent.text)?.replace(/<[^>]*>/g, "").substring(0, 160)}
        image={selectedEvent.poster}
        type="event"
        canonicalUrl={`https://www.bulgariansociety.nl/${region}/purchase-ticket/${eventId}`}
        keywords={`${selectedEvent.title}, buy ticket, Bulgarian event, ${region}, BGSNL`}
      />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      <main className="purchase-page guest-purchase-container">
        <MobilePurchaseSummary
          key={selectedEvent.id}
          event={selectedEvent}
          price={displayedTicketPrice}
          ticketQuantity={ticketQuantity}
          selectedAddOns={selectedAddOns}
        />
        <div className="container purchase-page-container">
        <div
          className="row team_member_border_1 team_border_long_add_on purchase-checkout-shell"
        >
          <div className="col-12 purchase-checkout-content">
            <div className="purchase-event-sidebar">
              <PurchaseEventSummary
                discountApplied={discountApplied}
                event={selectedEvent}
                factsInsideOverview={!showMembershipOffer}
                price={displayedTicketPrice}
                priceBadge={<DynamicTicketBadge product={selectedEvent?.product} />}
                showMemberPriceComparison={false}
                usesMemberPrice={false}
                ticketQuantity={ticketQuantity}
                ticketUnitPrice={baseTicketPrice}
                selectedAddOns={selectedAddOns}
              />
              <div className="purchase-sponsor">
                <SponsoredBySmall />
              </div>
            </div>

            <div className="col-12">
              {userIsLoggedIn && user.memberDiscount !== true && (
                <BillingStatusBanner
                  user={user}
                  context="ticket"
                  missedDiscount={
                    membershipSaving ? formatEuro(membershipSaving) : null
                  }
                />
              )}

              {showMembershipOffer && (
                <div className="purchase-membership-banner purchase-form-membership-banner">
                  <MembershipOfferBanner
                    title={membershipOfferTitle}
                    onAction={() => {
                      sessionStorage.setItem(
                        "prevUrl",
                        `/${region}/purchase-ticket/${eventId}`
                      );
                    }}
                  />
                </div>
              )}

              <ValidatedFormik
                enableReinitialize
                validationSchema={schema}
                onSubmit={async (values) => {
                  try {
                    setIsLoading(true);

                    const data = {
                      eventId: selectedEvent.id,
                      code: new Date().valueOf(),
                      quantity: values.quantity,
                    };

                    const formData = new FormData();
                    formData.append("quantity", values.quantity);
                    formData.append("origin_url", window.location.origin);
                    formData.append("method", "buy_guest_ticket");
                    formData.append("eventId", selectedEvent.id);
                    const marketingRegion = selectedEvent.region ?? region;
                    if (marketingRegion) {
                      formData.append("region", marketingRegion);
                    }
                    formData.append("code", data.code);
                    formData.append("guestEmail", values.email);
                    formData.append("guestName", values.name + " " + values.surname);
                    formData.append("guestPhone", values.phone);
                    formData.append("policyTerms", values.policyTerms);
                    formData.append("payTerms", values.payTerms);

                    if (selectedEvent?.extraInputsForm) {
                      appendExtraInputsToForm(
                        formData,
                        schemaFields,
                        values,
                        selectedEvent.extraInputsForm
                      );
                    }

                    if (selectedEvent?.addOns?.isEnabled && values.addOns?.length > 0) {
                      formData.append("addOns", JSON.stringify(values.addOns));
                    }

                    clarityEvent(ANALYTICS_EVENTS.EVENT_CHECKOUT_STARTED, {
                      [ANALYTICS_PROPERTIES.TICKET_TYPE]: "guest",
                    });
                    const responseData = await sendRequest(
                      "payment/checkout/guest-ticket",
                      "POST",
                      formData
                    );

                    if (responseData?.url) {
                      sessionStorage.setItem("prevUrl", window.location.href);
                      window.location.assign(responseData.url);
                      return;
                    }

                    if (responseData?.status && responseData?.free) {
                      sessionStorage.setItem("prevUrl", window.location.href);
                      dispatch(showNotification({ severity: "warn", detail: "Your free booking was submitted, but its confirmation link is missing. Please check your email or contact support before booking again.", life: 8000 }));
                    }
                  } catch (err) {
                    // handled by http-hook
                  } finally {
                    setIsLoading(false);
                  }
                }}
                initialValues={{
                  name: currentUser?.name || "",
                  surname: currentUser?.surname || "",
                  email: currentUser?.email || "",
                  phone: currentUser?.phone || "",
                  policyTerms: false,
                  payTerms: false,
                  quantity: 1,
                  ...constructInitialExtraFormValues(
                    selectedEvent?.extraInputsForm ?? null
                  ),
                  addOns: [],
                }}
              >
                {({ values, setFieldValue }) => (
                  <Form
                    id="form"
                    encType="multipart/form-data"
                    className={`row g-4 purchase-form${
                      showMembershipOffer ? " has-membership-banner" : ""
                    }`}
                  >
                    <div className="col-12">
                      <div className="purchase-form-heading">
                        <h1 className="type-heading-md">Complete your booking</h1>
                        
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <div className="rn-form-group" data-field-name="name">
                            <Field
                              type="text"
                              placeholder="Name"
                              name="name"
                            />
                            <ErrorMessage
                              className="error"
                              name="name"
                              component="div"
                            />
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="rn-form-group" data-field-name="surname">
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
                        <div className="col-12 col-md-6">
                          <div className="rn-form-group" data-field-name="email">
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
                        <div className="col-12 col-md-6">
                          <div
                            className="rn-form-group phone-input-container"
                            data-field-name="phone"
                          >
                            <PhoneInput
                              name="phone"
                              initialValue={values.phone || ""}
                              onChange={(value) =>
                                setFieldValue("phone", value)
                              }
                            />{" "}
                          
                            <ErrorMessage
                              className="error"
                              name="phone"
                              component="div"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <PurchaseAdditionalInformation inputs={selectedEvent.extraInputsForm || []} />
                    <PurchaseAddOns
                      addOns={selectedEvent.addOns}
                      values={values.addOns}
                      onSelect={(value) => {
                        setSelectedAddOns(value);
                        setFieldValue("addOns", value);
                      }}
                    />

                    <div
                      className="col-lg-12 col-md-12 col-12 purchase-consent-field"
                      data-field-name="policyTerms"
                    >
                      <div className="hor_section_nospace">
                        <Field
                          id="policyTerms"
                          style={{ maxWidth: "30px", margin: "10px" }}
                          type="checkbox"
                          name="policyTerms"
                        ></Field>
                        <label className="information" htmlFor="policyTerms">
                          I have read and accept the&nbsp;
                          <a
                            style={{ color: "#017363" }}
                            href={"/terms-and-legals"}
                            target="_blank"
                            rel="noreferrer"
                          >
                            society&apos;s policy
                          </a>
                        </label>
                      </div>
                      <ErrorMessage
                        className="error"
                        name="policyTerms"
                        component="div"
                      />
                    </div>

                    <div
                      className="col-lg-12 col-md-12 col-12 purchase-consent-field"
                      data-field-name="payTerms"
                    >
                      <div className="hor_section_nospace">
                        <Field
                          id="payTerms"
                          style={{ maxWidth: "30px", margin: "10px" }}
                          type="checkbox"
                          name="payTerms"
                        ></Field>
                        <label className="information" htmlFor="payTerms">
                          I agree to share the provided information with the
                          organization in case they need to prove my identity
                        </label>
                      </div>
                      <ErrorMessage
                        className="error"
                        name="payTerms"
                        component="div"
                      />
                    </div>
                    <div className="col-12">
                      <div
                        className="purchase-quantity"
                        data-field-name="quantity"
                      >
                        <h3>Quantity</h3>
                        <InputNumber
                          name="quantity"
                          value={values.quantity}
                          onValueChange={(e) => {
                            const nextQuantity = e.value ?? 1;
                            setTicketQuantity(nextQuantity);
                            setFieldValue("quantity", nextQuantity, false);
                          }}
                          showButtons
                          buttonLayout="horizontal"
                          className="purchase-quantity-input"
                          decrementButtonClassName="p-button-danger"
                          incrementButtonClassName="p-button-success"
                          decrementButtonIcon={<IconlyMinus aria-hidden />}
                          incrementButtonIcon={<IconlyPlus aria-hidden />}
                          min={1}
                          max={10}
                        />
                        <ErrorMessage
                          className="error"
                          name="quantity"
                          component="div"
                          data-validation-message-for="quantity"
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="purchase-actions">
                        <button
                          type="button"
                          onClick={() => navigate(-1)}
                          className="rn-button-style--2 rn-btn-reverse purchase-action-control "
                        >
                          <IconlyArrowLeft aria-hidden />
                          <span>Back</span>
                        </button>

                        <button
                          disabled={isLoading}
                          type="submit"
                          className="rn-button-style--2 rn-btn-reverse-green purchase-action-control purchase-action-primary "
                        >
                          {isLoading ? (
                            <Loader />
                          ) : (
                            <>
                              <span>{checkoutActionLabel}</span>
                              <IconlyArrowRight aria-hidden />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </ValidatedFormik>
            </div>
          </div>
        </div>
        {/* Start Back To Top */}
        <div className="backto-top">
          <ScrollToTop showUnder={160}>
            <FiChevronUp size={26} />
          </ScrollToTop>
        </div>
        </div>
      </main>
      {/* End Back To Top */}

      <Footer />
    </Fragment>
  );
};

GuestPurchase.propTypes = {
  initialEvent: PropTypes.object,
};

export default GuestPurchase;
