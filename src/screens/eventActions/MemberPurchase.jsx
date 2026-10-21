"use client";

import {
  Fragment,
  useEffect,
  useId,
  useState,
} from "react";
import { Form } from "formik";
import PropTypes from "prop-types";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import * as yup from "yup";
import ScrollToTop from "@/component/common/ScrollToTop";
import {
  FiChevronUp,
  IconlyArrowLeft,
  IconlyArrowRight,
  IconlyDanger,
} from "@/elements/ui/icons/IconlyIcons";
import {
  useNavigate,
  useParams,
} from "@/util/navigation";
import PageHelmet from "../../component/common/Helmet";
import Footer from "../../component/footer/Footer";
import HeaderTwo from "../../component/header/HeaderTwo";
import PurchaseCheckoutLayout from "../../elements/purchase/PurchaseCheckoutLayout";
import MobilePurchaseSummary from "../../elements/purchase/MobilePurchaseSummary";
import PurchaseEventSummary from "../../elements/purchase/PurchaseEventSummary";
import {
  PurchaseAddOns,
  PurchaseAdditionalInformation,
} from "../../elements/purchase/PurchaseFormOptions";
import SponsoredBySmall from "../../elements/ui/alerts/SponsoredBySmall";
import subscriptionStyles from "../../elements/subscriptions/subscriptions.module.scss";
import DynamicTicketBadge from "../../elements/ui/badges/DynamicTicketBadge";
import ExternalPlatformTicketSale from "../../elements/ui/errors/Events/ExternalPlatformTicketSale";
import NoEventFound from "../../elements/ui/errors/Events/NoEventFound";
import TicketSaleClosed from "../../elements/ui/errors/Events/TicketSaleClosed";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import ValidatedFormik from "../../elements/ui/forms/ValidatedFormik";
import Loader from "../../elements/ui/loading/Loader";
import { useHttpClient } from "../../hooks/common/http-hook";
import { showNotification } from "../../redux/notification";
import { selectUser } from "../../redux/user";
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

const buildMemberValidation = (event) => {
  let validationSchema = null;
  let schemaFields = null;

  if (event?.extraInputsForm) {
    const extraValidation = buildSchemaExtraInputs(event.extraInputsForm);
    validationSchema = extraValidation.schema;
    schemaFields = extraValidation.schemaFields;
  }

  if (event?.addOns?.isMandatory) {
    const addOnsSchema = yup.object().shape({
      addOns: yup
        .array()
        .min(1, "Please choose an option")
        .required("Please choose an option"),
    });
    validationSchema = validationSchema
      ? validationSchema.concat(addOnsSchema)
      : addOnsSchema;
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

const PriceWarningBanner = ({ title, children }) => {
  const titleId = useId();

  return (
    <section className={`${subscriptionStyles.dangerBanner} purchase-price-warning`} role="alert" aria-labelledby={titleId}>
      <IconlyDanger className={subscriptionStyles.dangerIcon} aria-hidden />
      <h2 id={titleId}>{title}</h2>
      <div className={subscriptionStyles.dangerContent}>{children}</div>
    </section>
  );
};

PriceWarningBanner.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

// The parent waits for session restoration before choosing member checkout.
const MemberPurchase = ({ initialEvent = null }) => {
  const { sendRequest } = useHttpClient();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(initialEvent);
  const [currentUser, setCurrentUser] = useState();
  const [loadingPage, setLoadingPage] = useState(!initialEvent);
  const [eventClosed, setEventClosed] = useState(initialEvent?.isSaleClosed === true || initialEvent?.availabilityUnavailable === true);
  const [priceCheck, setPriceCheck] = useState({ key: "", status: "checking", alreadyRegistered: false });
  const [priceCheckAttempt, setPriceCheckAttempt] = useState(0);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [{ schema, schemaFields }, setValidation] = useState(() =>
    buildMemberValidation(initialEvent)
  );

  const dispatch = useDispatch();

  const { region, eventId } = useParams();
  const eventRecordId = initialEvent?.id || selectedEvent?.id || eventId;

  const user = useSelector(selectUser);

  const navigate = useNavigate();
  const priceCheckKey = selectedEvent?.id && currentUser?.id
    ? `${selectedEvent.id}:${currentUser.id}`
    : "";

  useEffect(() => {
    if (!priceCheckKey) return undefined;

    const controller = new AbortController();
    setPriceCheck({ key: priceCheckKey, status: "checking", alreadyRegistered: false });

    const checkPrice = async () => {
      const result = await sendRequest(
        "event/check-ticket-eligibility",
        "POST",
        { eventId: selectedEvent.id, userId: currentUser.id },
        {},
        false,
        false,
        { signal: controller.signal }
      );
      if (controller.signal.aborted) return;

      if (result?.alreadyRegistered || result?.type === "free" || result?.type === "paid") {
        setPriceCheck({ key: priceCheckKey, status: "ready", alreadyRegistered: Boolean(result.alreadyRegistered) });
      } else {
        setPriceCheck({ key: priceCheckKey, status: "error", alreadyRegistered: false });
      }
    };

    checkPrice();
    return () => controller.abort();
  }, [currentUser?.id, priceCheckAttempt, priceCheckKey, selectedEvent?.id, sendRequest]);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingPage(true);

    const fetchCurrentUser = async () => {
      try {
        const responseData = await sendRequest("user/current", "GET", null, {}, true, false, { signal: controller.signal });
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

        setValidation(buildMemberValidation(responseData.event));
      } catch (err) {
        // do nothing
      } finally {
        if (!controller.signal.aborted) setLoadingPage(false);
      }
    };

    fetchCurrentUser();
    getEventDetails();
    return () => controller.abort();
  }, [eventRecordId, sendRequest]);

  if (loadingPage || !currentUser) {
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

  const priceChecked = priceCheck.key === priceCheckKey && priceCheck.status === "ready";
  const priceCheckFailed = priceCheck.key === priceCheckKey && priceCheck.status === "error";
  const alreadyRegistered = priceChecked && priceCheck.alreadyRegistered;
  const baseTicketPrice = priceChecked ? ticketPriceAmountByEvent(
    selectedEvent,
    { ...currentUser, session: user.session ?? "" },
    { blockDiscounts: alreadyRegistered }
  ) : null;
  const addOnTotal = selectedAddOns.reduce(
    (total, item) => total + (Number(item?.price) || 0),
    0
  );
  const checkoutTotal = baseTicketPrice === null
    ? null
    : baseTicketPrice + addOnTotal;
  const displayedTicketPrice = checkoutTotal === null
    ? priceChecked ? "TBA" : "Checking…"
    : checkoutTotal === 0
      ? "Free"
      : (
        <span className="purchase-total-price" key={checkoutTotal} aria-live="polite" aria-atomic="true">
          {formatEuro(checkoutTotal)}
        </span>
      );
  const discountApplied = priceChecked && hasAppliedTicketDiscount(
    selectedEvent,
    { ...currentUser, session: user.session ?? "" },
    { blockDiscounts: alreadyRegistered }
  );
  const checkoutActionLabel = checkoutTotal === 0
    ? "Confirm"
    : "Payment";
  const notifyPendingPriceCheck = () => dispatch(showNotification({
    severity: "warn",
    detail: priceCheckFailed
      ? "We couldn't check your ticket price. Select Check price again, then submit your booking."
      : "We're checking your ticket price. Wait for it to appear, then submit your booking again.",
    life: 5000,
  }));

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
      <main className="purchase-page member-purchase-container">
        <MobilePurchaseSummary
          key={selectedEvent.id}
          event={selectedEvent}
          price={displayedTicketPrice}
          ticketQuantity={1}
          selectedAddOns={selectedAddOns}
        />
        <div className="container purchase-page-container">
        <PurchaseCheckoutLayout sidebar={<>
            <PurchaseEventSummary
              discountApplied={discountApplied}
              event={selectedEvent}
              factsInsideOverview
              price={displayedTicketPrice}
              priceBadge={priceChecked &&
                <DynamicTicketBadge
                  isMember={!alreadyRegistered}
                  product={selectedEvent?.product}
                />
              }
              showMemberPriceComparison={false}
              usesMemberPrice={priceChecked && !alreadyRegistered}
              ticketQuantity={1}
              ticketUnitPrice={baseTicketPrice}
              selectedAddOns={selectedAddOns}
            />
            <div className="purchase-sponsor">
              <SponsoredBySmall />
            </div>
        </>}>
          <ValidatedFormik
            validationSchema={schema}
            onSubmit={async (values) => {
              if (!priceChecked) {
                notifyPendingPriceCheck();
                return;
              }
              if (isLoading) return;
              try {
                setIsLoading(true);

                const data = {
                  eventId: selectedEvent.id,
                  code: new Date().valueOf(),
                  quantity: 1,
                };

                const formData = new FormData();
                formData.append("origin_url", window.location.origin);
                formData.append("method", "buy_member_ticket");
                formData.append("eventId", selectedEvent.id);
                formData.append("code", data.code);
                formData.append("userId", currentUser.id);
                formData.append("normalTicket", `${alreadyRegistered}`);

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
                  [ANALYTICS_PROPERTIES.TICKET_TYPE]: alreadyRegistered ? "guest" : "member",
                });
                const responseData = await sendRequest(
                  "payment/checkout/member-ticket",
                  "POST",
                  formData
                );

                // A ticket may have been purchased after the advance check.
                if (responseData?.alreadyRegistered) {
                  setPriceCheck({ key: priceCheckKey, status: "ready", alreadyRegistered: true });
                  dispatch(showNotification({
                    severity: "warn",
                    detail: "Your member-priced ticket is already purchased. Review the guest price, then submit your booking again.",
                    life: 6000,
                  }));
                  return;
                }

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
                className="row g-4 purchase-form"
                onSubmitCapture={(event) => {
                  if (priceChecked && !isLoading) return;
                  event.preventDefault();
                  event.stopPropagation();
                  if (!isLoading) notifyPendingPriceCheck();
                }}
              >
                <div className="col-12">
                  <div className="purchase-form-heading">
                    <h1 className="type-heading-md">Complete your booking</h1>
                    <p>Your account details are applied automatically. We check your ticket price before you continue.</p>
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

                <div className="col-12">
                  {alreadyRegistered && (
                    <PriceWarningBanner title="Guest price applies">
                      <p>You have already used the member price for this event. This additional ticket uses the guest price shown above.</p>
                    </PriceWarningBanner>
                  )}
                  {!priceChecked && (priceCheckFailed ? (
                    <div id="purchase-price-check-status">
                      <PriceWarningBanner title="Price check unavailable">
                        <p>We couldn&apos;t check your ticket price. Try again before continuing.</p>
                        <button
                          type="button"
                          className={`${subscriptionStyles.textButton} purchase-price-check-retry`}
                          onClick={() => setPriceCheckAttempt((attempt) => attempt + 1)}
                        >
                          Check price again
                        </button>
                      </PriceWarningBanner>
                    </div>
                  ) : (
                    <p id="purchase-price-check-status" className="purchase-price-checking" role="status">Checking your ticket price…</p>
                  ))}

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
                      aria-describedby={!priceChecked ? "purchase-price-check-status" : undefined}
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
        </PurchaseCheckoutLayout>
      </div>
      </main>
      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <Footer />
    </Fragment>
  );
};

MemberPurchase.propTypes = {
  initialEvent: PropTypes.object,
};

export default MemberPurchase;
