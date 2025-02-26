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
import WithBackBtn from "../../elements/ui/functional/WithBackBtn";
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
    sessionStorage.setItem("prevUrl", window.location.href).then(() => {
      navigate("/success");
    });
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
      <div className="container mt--140 mb--120">
        <h2 className="center_text mb--80">Purchase a Ticket</h2>

        <div className="row slide-down center_div">
          <ImageFb
            src={`${selectedEvent.poster}`}
            alt="Event"
            className="title_img"
          />
        </div>
        <div className="row team_member_border-3 mt--80 purchase_panel">
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
                  sessionStorage
                    .setItem("prevUrl", window.location.href)
                    .then(() => {
                      window.location.assign(responseData.url);
                    });
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
              <Form id="form" encType="multipart/form-data" className="row">
                <div className="col-lg-6 col-md-12 col-12">
                  <div className="event_details">
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
                      <span className="center_div justify-content-start price">
                        Price :{" "}
                        {estimatePriceByEvent(
                          selectedEvent,
                          { ...currentUser, token: user.token ?? "" },
                          normalTicket
                        )}
                        {
                          <DynamicTicketBadge
                            product={selectedEvent?.product}
                          />
                        }
                      </span>
                    </p>
                    <SponsoredBySmall />
                  </div>
                </div>
                {selectedEvent.extraInputsForm?.length > 0 && (
                  <div className="col-lg-6 col-md-12 col-12 row container mt--40">
                    <FormExtras inputs={selectedEvent.extraInputsForm} />
                  </div>
                )}
                {selectedEvent?.addOns?.isEnabled &&
                  selectedEvent.addOns?.items?.length > 0 && (
                    <div className="col-lg-6 col-md-6 col-12 mt--40">
                      <h3 className="text-center">
                        {selectedEvent.addOns.title}
                      </h3>
                      <small className="d-flex justify-content-center">
                        {selectedEvent.addOns?.multi
                          ? "*You can add one or more"
                          : "*You can add only one"}
                      </small>
                      <CardInputs
                        multi={selectedEvent.addOns?.multi}
                        items={selectedEvent.addOns?.items}
                        values={values.addOns}
                        onSelect={(value) => setFieldValue("addOns", value)}
                      />
                    </div>
                  )}
                <div className="m--a" style={{ maxWidth: "10em" }}>
                  <WithBackBtn>
                    <button
                      disabled={isLoading}
                      type="submit"
                      className="rn-button-style--2 rn-btn-reverse-green"
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
                <p className="information mt--40">
                  The information for purchasing this ticket will be taken from
                  your account. Be sure it is accurate as it can be used as a
                  proof of your identity on the entry!
                </p>
                <p className="information mt--10">
                  *Special discounted price for board and committee members may
                  apply
                </p>
              </Form>
            )}
          </Formik>
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

export default MemberPurchase;
