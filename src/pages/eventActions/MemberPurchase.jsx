import React, { Fragment, useEffect, useState } from "react";
import { Formik, Form } from "formik";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useHttpClient } from "../../hooks/common/http-hook";
import Loader from "../../elements/ui/loading/Loader";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import Footer from "../../component/footer/Footer";
import ImageFb from "../../elements/ui/media/ImageFb";
import {
  createCustomerTicket,
  createQrCodeCheckGuest,
} from "../../util/functions/ticket-creator";
import FormExtras from "../../elements/ui/forms/FormExtras";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../redux/user";
import {
  checkAuthorization,
  decodeJWT,
} from "../../util/functions/authorization";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import NoEventFound from "../../elements/ui/errors/Events/NoEventFound";
import moment from "moment";
import { Message } from "primereact/message";
import {
  encryptData,
  estimatePriceByEvent,
} from "../../util/functions/helpers";
import { showNotification } from "../../redux/notification";
import { ACCESS_3, ACCESS_4 } from "../../util/defines/common";
import { MOMENT_DATE_TIME } from "../../util/functions/date";
import TicketSaleClosed from "../../elements/ui/errors/Events/TicketSaleClosed";
import ExternalPlatformTicketSale from "../../elements/ui/errors/Events/ExternalPlatformTicketSale";
import { ACTIVE, LOCKED, USER_STATUSES } from "../../util/defines/enum";
import {
  appendExtraInputsToForm,
  buildSchemaExtraInputs,
  constructInitialExtraFormValues,
} from "../../util/functions/input-helpers";
import DynamicTicketBadge from "../../elements/ui/badges/DynamicTicketBadge";
import SponsoredBySmall from "../../elements/ui/alerts/SponsoredBySmall";
import CardInputs from "../../elements/inputs/common/CardInputs";
import StickyButtonFooter from "../../elements/ui/functional/StickyButtonFooter";

const MemberPurchase = () => {
  const { loading, sendRequest, forceStartLoading } = useHttpClient();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState();
  const [loadingPage, setLoadingPage] = useState(true);
  const [eventClosed, setEventClosed] = useState(false);
  const [normalTicket, setNormalTicket] = useState(false);
  const [schema, setSchema] = useState(null);
  const [schemaFields, setSchemaFields] = useState(null);

  const dispatch = useDispatch();

  const { region, eventId } = useParams();

  const user = useSelector(selectUser);

  const navigate = useNavigate();

  const buyFreeTicket = async (formData) => {
    await sendRequest("event/purchase-ticket/member", "POST", formData);
    sessionStorage.setItem("prevUrl", window.location.href);
    navigate("/success");
  };

  useEffect(() => {
    setLoadingPage(true);

    const fetchCurrentUser = async () => {
      try {
        const responseData = await sendRequest(`user/current`);
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

        if (responseData.event?.extraInputsForm) {
          const { schema, schemaFields } = buildSchemaExtraInputs(
            responseData.event.extraInputsForm
          );
          setSchema(schema);
          setSchemaFields(schemaFields);
        }
      } catch (err) {
        // do nothing
      } finally {
        setLoadingPage(false);
      }
    };

    fetchCurrentUser();
    getEventDetails();
  }, []);

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

  return (
    <Fragment>
      <PageHelmet pageTitle="Buy Ticket" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <div
        className="member-purchase-container container mt--140 mb--120"
        style={{
          paddingLeft: "clamp(15px, 3vw, 20px)",
          paddingRight: "clamp(15px, 3vw, 20px)",
        }}
      >
        <h2
          className="center_text mb--60 mb_md--40 mb_sm--30"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
        >
          Purchase a Ticket
        </h2>

        <div
          className="row team_member_border_1 team_border_long_add_on purchase_panel"
          style={{
            padding: "clamp(10px, 4vw, 40px)",
          }}
        >
          <Formik
            validationSchema={schema}
            onSubmit={async (values) => {
              try {
                setIsLoading(true);

                let allowDiscount = false;
                const isActiveMember = checkAuthorization(user.token, ACCESS_4);
                const isMemberForDiscount =
                  selectedEvent.product?.activeMember?.priceId &&
                  selectedEvent.discountPass.length > 0 &&
                  (selectedEvent.discountPass.includes(currentUser.email) ||
                    selectedEvent.discountPass.includes(
                      currentUser.name + " " + currentUser.surname
                    ));
                const isMemberForFreeTicket =
                  selectedEvent.freePass.length > 0 &&
                  (selectedEvent.freePass.includes(currentUser.email) ||
                    selectedEvent.freePass.includes(
                      currentUser.name + " " + currentUser.surname
                    ));

                if (!normalTicket) {
                  const checkMemberTicket = await sendRequest(
                    `event/check-member/${currentUser.id}/${eventId}`
                  );

                  if (
                    checkMemberTicket.hasOwnProperty("status") &&
                    !checkMemberTicket.status
                  ) {
                    dispatch(
                      showNotification({
                        severity: "warn",
                        detail:
                          "You already have a member ticket for this event - you can still proceed the checkout but will pay the guest price!",
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
                  quantity: 1,
                };

                const hasQR = selectedEvent.ticketQR;
                const qrCode = hasQR ? createQrCodeCheckGuest(data) : "";

                const { ticketBlob } = await createCustomerTicket(
                  selectedEvent.ticketImg,
                  currentUser.name,
                  currentUser.surname,
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
                    currentUser.name +
                    currentUser.surname +
                    "_MEMBER"
                );

                if (isActiveMember) {
                  formData.append("type", "active member");
                }

                formData.append("region", region);
                formData.append("origin_url", window.location.origin);
                formData.append("method", "buy_member_ticket");
                formData.append("eventId", selectedEvent.id);
                formData.append("code", data.code);
                formData.append("userId", currentUser.id);

                if (selectedEvent?.extraInputsForm) {
                  appendExtraInputsToForm(formData, schemaFields, values);
                }

                if (
                  selectedEvent?.addOns?.isEnabled &&
                  values.addOns?.length > 0
                ) {
                  formData.append("addOns", JSON.stringify(values.addOns));
                }

                if (selectedEvent.isFree || selectedEvent.isMemberFree) {
                  return await buyFreeTicket(formData);
                }

                if (
                  allowDiscount &&
                  (isMemberForDiscount ||
                    isMemberForFreeTicket ||
                    isActiveMember)
                ) {
                  if (isMemberForFreeTicket) {
                    return await buyFreeTicket(formData);
                  } else {
                    formData.append(
                      "itemId",
                      selectedEvent.product?.activeMember?.priceId ??
                        selectedEvent.product?.member?.priceId
                    );
                  }
                } else if (normalTicket) {
                  formData.append(
                    "itemId",
                    selectedEvent.product?.guest.priceId
                  );
                } else {
                  formData.append(
                    "itemId",
                    selectedEvent.product?.member.priceId
                  );
                }

                const responseData = await sendRequest(
                  "payment/checkout/member-ticket",
                  "POST",
                  formData
                );

                if (responseData.url) {
                  sessionStorage.setItem("prevUrl", window.location.href);
                  window.location.assign(responseData.url);
                }
              } catch (err) {
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
              <Form id="form" encType="multipart/form-data">
                <div className="col-12">
                  <div className="event_details">
                    <div className="row g-4 align-items-center mt--30 mb--40">
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
                        <div className="row g-3 information-container">
                          <div className="col-12 col-sm-6 col-md-4">
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
                          <div className="col-12 col-sm-6 col-md-4">
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
                          <div className="col-12 col-sm-6 col-md-4">
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
                          <div className="col-12 col-sm-6 col-md-12">
                            <div className="detail-item text-center">
                              <strong
                                className="d-block mb-1"
                                style={{ color: "#017363" }}
                              >
                                Price:
                              </strong>
                              <div className="d-flex align-items-center justify-content-center flex-wrap gap-2">
                                <span>
                                  {estimatePriceByEvent(
                                    selectedEvent,
                                    { ...currentUser, token: user.token ?? "" },
                                    {
                                      withIncludedText: false,
                                      blockDiscounts: normalTicket,
                                      withMemberBadge: true,
                                    }
                                  )}
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
                </div>
                {selectedEvent.extraInputsForm?.length > 0 && (
                  <div className="col-12">
                    <h3
                      className="mb--30 text-center text-md-start"
                      style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.75rem)" }}
                    >
                      Additional Information
                    </h3>
                    <FormExtras inputs={selectedEvent.extraInputsForm} />
                  </div>
                )}
                {selectedEvent?.addOns?.isEnabled &&
                  selectedEvent.addOns?.items?.length > 0 && (
                    <div className="col-12">
                      <h3
                        className="text-center mb--20"
                        style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.75rem)" }}
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

                <div className="col-12">
                  {normalTicket && (
                    <Message
                      severity="warn"
                      className="mb--20"
                      text="You already have redeemed your discount - if you proceed, you will pay the full ticket price"
                    />
                  )}

                  <StickyButtonFooter>
                    <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3 mt--30">
                      <button
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
                        {isLoading ? <Loader /> : <span>Proceed to Payment</span>}
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
                  </StickyButtonFooter>
                </div>

                <div className="col-12 mt--40">
                  <div
                    className="information-notices"
                    style={{
                      background: "#f9f9f9",
                      padding: "clamp(12px, 3vw, 20px)",
                      borderRadius: "8px",
                      borderLeft: "4px solid #017363",
                    }}
                  >
                    <p
                      className="mb--20"
                      style={{ fontSize: "0.875rem", lineHeight: "1.6" }}
                    >
                      <ImageFb
                        className="calendar-subscription__header-icon"
                        style={{ width: 42, height: 42 }}
                        src={"/assets/images/svg/3d/information-3d.png"}
                        fallback={
                          "/assets/images/svg/information/calendar-3d.png"
                        }
                        alt="Calendar"
                      />{" "}
                      The information for purchasing this ticket will be taken
                      from your account. Be sure it is accurate as it can be
                      used as a proof of your identity on the entry!
                    </p>
                    <p
                      className="mb--0"
                      style={{
                        fontSize: "0.875rem",
                        lineHeight: "1.6",
                        color: "#666",
                      }}
                    >
                      *Special discounted price for board and committee members
                      may apply
                    </p>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} style={{ fontSize: "26px" }} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <Footer />
    </Fragment>
  );
};

export default MemberPurchase;
