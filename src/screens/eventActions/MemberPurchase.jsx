"use client";

import {
  Fragment,
  useEffect,
  useState,
} from "react";
import { Form } from "formik";
import PropTypes from "prop-types";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import * as yup from "yup";
import { Message } from "@/compat/primereact";
import ScrollToTop from "@/component/common/ScrollToTop";
import {
  FiChevronUp,
  IconlyArrowLeft,
  IconlyArrowRight,
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

// The parent waits for session restoration before choosing member checkout.
const MemberPurchase = ({ initialEvent = null }) => {
  const { sendRequest } = useHttpClient();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(initialEvent);
  const [currentUser, setCurrentUser] = useState();
  const [loadingPage, setLoadingPage] = useState(!initialEvent);
  const [eventClosed, setEventClosed] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [{ schema, schemaFields }, setValidation] = useState(() =>
    buildMemberValidation(initialEvent)
  );

  const dispatch = useDispatch();

  const { region, eventId } = useParams();
  const eventRecordId = initialEvent?.id || selectedEvent?.id || eventId;

  const user = useSelector(selectUser);

  const navigate = useNavigate();

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

  const baseTicketPrice = ticketPriceAmountByEvent(
    selectedEvent,
    { ...currentUser, session: user.session ?? "" },
    { blockDiscounts: alreadyRegistered }
  );
  const addOnTotal = selectedAddOns.reduce(
    (total, item) => total + (Number(item?.price) || 0),
    0
  );
  const checkoutTotal = baseTicketPrice === null
    ? null
    : baseTicketPrice + addOnTotal;
  const displayedTicketPrice = checkoutTotal === null
    ? "TBA"
    : checkoutTotal === 0
      ? "Free"
      : (
        <span className="purchase-total-price" key={checkoutTotal} aria-live="polite" aria-atomic="true">
          {formatEuro(checkoutTotal)}
        </span>
      );
  const discountApplied = hasAppliedTicketDiscount(
    selectedEvent,
    { ...currentUser, session: user.session ?? "" },
    { blockDiscounts: alreadyRegistered }
  );
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
              priceBadge={
                <DynamicTicketBadge
                  isMember={!alreadyRegistered}
                  product={selectedEvent?.product}
                />
              }
              showMemberPriceComparison={false}
              usesMemberPrice={!alreadyRegistered}
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

                // Member already has a ticket — warn once, then allow guest-price fallback
                if (responseData?.alreadyRegistered) {
                  dispatch(
                    showNotification({
                      severity: "warn",
                      detail:
                        "You have already used the member price for this event. Additional tickets use the guest price.",
                      life: 4000,
                    })
                  );
                  setAlreadyRegistered(true);
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
              <Form id="form" encType="multipart/form-data" className="row g-4 purchase-form">
                <div className="col-12">
                  <div className="purchase-form-heading">
                    <h1 className="type-heading-md">Complete your booking</h1>
                    <p>Your account details and member price are applied automatically.</p>
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
                    <Message
                      severity="warn"
                      className="mb--20"
                      text="Your member-priced ticket is already purchased. This additional ticket uses the guest price."
                    />
                  )}

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
