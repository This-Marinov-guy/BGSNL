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
import { useSelector } from "react-redux";
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
import CardInputs from "../../elements/inputs/common/CardInputs";
import PhoneInput from "../../elements/inputs/common/PhoneInput";
import MobilePurchaseSummary from "../../elements/purchase/MobilePurchaseSummary";
import PurchaseEventSummary from "../../elements/purchase/PurchaseEventSummary";
import SponsoredBySmall from "../../elements/ui/alerts/SponsoredBySmall";
import DynamicTicketBadge from "../../elements/ui/badges/DynamicTicketBadge";
import ExternalPlatformTicketSale from "../../elements/ui/errors/Events/ExternalPlatformTicketSale";
import ExclusiveMemberEvent from "../../elements/ui/errors/Events/MemeberExclusiveEvents";
import NoEventFound from "../../elements/ui/errors/Events/NoEventFound";
import TicketSaleClosed from "../../elements/ui/errors/Events/TicketSaleClosed";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import FormExtras from "../../elements/ui/forms/FormExtras";
import ValidatedFormik from "../../elements/ui/forms/ValidatedFormik";
import Loader from "../../elements/ui/loading/Loader";
import { useHttpClient } from "../../hooks/common/http-hook";
import { selectUser } from "../../redux/user";
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
  const { sendRequest } = useHttpClient();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(!initialEvent);
  const [selectedEvent, setSelectedEvent] = useState(initialEvent);
  const [eventClosed, setEventClosed] = useState(false);
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

  const user = useSelector(selectUser);
  const userIsLoggedIn = Boolean(user?.token);

  const navigate = useNavigate();

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

        setValidation(buildGuestValidation(responseData.event));
      } catch (err) {
        // The shared request hook presents the error state.
      } finally {
        setLoadingPage(false);
      }
    };

    getEventDetails();
    fetchCurrentUser();
  }, []);

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
  const displayedTicketPrice = selectedEvent.isFree
    ? "Free"
    : selectedEvent.product?.guest?.price != null
      ? `€${selectedEvent.product.guest.price}`
      : "Price unavailable";
  const checkoutActionLabel = selectedEvent.isFree
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
        />
        <div className="container purchase-page-container">
        <div
          className="row team_member_border_1 team_border_long_add_on purchase-checkout-shell"
        >
          <div className="col-12 purchase-checkout-content">
            <div className="purchase-event-sidebar">
              <PurchaseEventSummary
                event={selectedEvent}
                factsInsideOverview={!showMembershipOffer}
                price={displayedTicketPrice}
                priceBadge={<DynamicTicketBadge product={selectedEvent?.product} />}
                showMemberPriceComparison={!userIsLoggedIn}
                usesMemberPrice={false}
              />
              <div className="purchase-sponsor">
                <SponsoredBySmall />
              </div>
            </div>

            <div className="col-12">
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
                      navigate("/success");
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
                        <p className="">
                          Review the event and enter the details needed for your
                          ticket.
                        </p>
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
                            <p className="information">
                              Use an email address you can access. We will send
                              your ticket there.
                            </p>
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
                            <p className="information">
                              Use a valid number in case the organiser needs to
                              confirm your identity at entry.
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
                        <div className="col-lg-12" data-field-name="addOns">
                          <h3
                            className="text-center mb--20 type-subheading"
                          >
                            {selectedEvent.addOns.title}
                            {selectedEvent.addOns?.isMandatory && (
                              <span style={{ color: "#dc3545" }}> *</span>
                            )}
                          </h3>
                          <p
                            className="text-center mb--30 "
                            style={{ color: "#666" }}
                          >
                            {selectedEvent.addOns?.isMandatory && (
                              <span style={{ color: "#dc3545" }}>
                                *Required - {" "}
                              </span>
                            )}
                            {selectedEvent.addOns?.multi
                              ? "You can add one or more"
                              : "You can add only one"}
                          </p>
                          <CardInputs
                            multi={selectedEvent.addOns?.multi}
                            items={selectedEvent.addOns?.items}
                            values={values.addOns}
                            onSelect={(value) => setFieldValue("addOns", value)}
                          />
                          <ErrorMessage
                            className="error center_text"
                            name="addOns"
                            component="div"
                          />
                        </div>
                      )}

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
                          onValueChange={(e) =>
                            setFieldValue("quantity", e.value, false)
                          }
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
