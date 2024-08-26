import React, { Fragment, useEffect, useState } from "react";
import * as yup from "yup";
import { Formik, Form } from "formik";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useHttpClient } from "../../hooks/http-hook";
import Loader from "../../elements/ui/loading/Loader";
import Locked from "../../elements/ui/modals/Locked";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import Footer from "../../component/footer/Footer";
import ImageFb from "../../elements/ui/media/ImageFb";
import { createCustomerTicket } from "../../util/functions/ticket-creator";
import FormExtras from "../../elements/ui/forms/FormExtras";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../redux/user";
import { checkAuthorization, decodeJWT } from "../../util/functions/authorization";
import WithBackBtn from "../../elements/ui/functional/WithBackBtn";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import NoEventFound from "../../elements/ui/errors/NoEventFound";
import moment from "moment";
import { Message } from 'primereact/message';
import { encryptData, estimatePriceByEvent } from "../../util/functions/helpers";
import { showNotification } from "../../redux/notification";
import { ACCESS_3 } from "../../util/defines/defines";

const MemberPurchase = () => {
  const { loading, sendRequest, forceStartLoading } = useHttpClient();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState();
  const [loadingPage, setLoadingPage] = useState(true);
  const [eventClosed, setEventClosed] = useState(false);
  const [normalTicket, setNormalTicket] = useState(false);

  const dispatch = useDispatch();

  const { region, eventId } = useParams()

  const user = useSelector(selectUser);

  const navigate = useNavigate();

  const buyFreeTicket = async (formData) => {
    await sendRequest(
      "event/purchase-ticket/member",
      "POST",
      formData
    );

    navigate('/success');
  }

  useEffect(() => {
    const userId = decodeJWT(user.token).userId;
    const fetchCurrentUser = async () => {
      try {
        const responseData = await sendRequest(`user/${userId}`);
        setCurrentUser(responseData.user);
      } catch (err) {
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    setLoadingPage(true);
    const getEventDetails = async () => {
      try {
        const responseData = await sendRequest(`event/actions/full-event-details/${eventId}`, "GET", null, {}, false);
        setSelectedEvent(responseData.event);
        setEventClosed(!responseData.status);
      } catch (err) {
      } finally {
        setLoadingPage(false);
      }
    };

    getEventDetails();
  }, [])

  if (loadingPage || !currentUser) {
    return <HeaderLoadingError />
  } else if (!selectedEvent) {
    return <NoEventFound />
  }

  if (selectedEvent.ticketLink) {
    return (<div className="container center_text mt--100">
      <ImageFb
        className="logo mb--40"
        src={`/assets/images/logo/${region && REGIONS.includes(region) ? region : 'logo'}.webp`}
        fallback={`/assets/images/logo/${region && REGIONS.includes(region) ? region : 'logo'}.jpg`}
        alt="Logo"
      />
      <h3 className="">This event is sold through an external platform - click below to see it!</h3>
      <a href={selectedEvent.ticketLink}
        className="rn-button-style--2 rn-btn-reverse-green mt--20"
      >
        Go to event
      </a>
    </div>)
  }

  const schemaFields = {};

  if (selectedEvent.extraInputsForm && Array.isArray(selectedEvent.extraInputsForm)) {
    selectedEvent.extraInputsForm.forEach((input, index) => {
      const fieldName = `extraInput${index + 1}`;
      schemaFields[fieldName] = input.required ? yup.string().required("Required field") : yup.string();
    });
  }

  const schema = yup.object().shape(schemaFields);

  if (eventClosed) {
    return (
      <div className="container center_text mt--100">
        <ImageFb
          className="logo mb--40"
          src={`/assets/images/logo/${region && REGIONS.includes(region) ? region : 'logo'}.webp`}
          fallback={`/assets/images/logo/${region && REGIONS.includes(region) ? region : 'logo'}.jpg`}
          alt="Logo"
        />
        <h3 className="">Opps ... it is all SOLD OUT! Please check the event description for tickets on-the-door or contact us through our email! Hope we see you soon!</h3>
        <Link to='/'
          className="rn-button-style--2 rn-btn-reverse-green mt--20"
        >
          Home
        </Link>
      </div>)
  } else {
    return (
      <Fragment>
        <PageHelmet pageTitle="Buy Ticket" />
        <HeaderTwo
          headertransparent="header--transparent"
          colorblack="color--black"
          logoname="logo.png"
        />
        {currentUser.status !== "active" && <Locked case='locked' show={currentUser.status} />}
        <div className="container mt--200 mb--120">
          <h2 className="center_text mb--80">Purchase a Ticket</h2>

          <div className="row slide-down center_div">
            <ImageFb src={`${selectedEvent.images[0]}`} alt="Event" className="title_img" />
          </div>
          <div className="row team_member_border-3 mt--80 purchase_panel">
            <Formik
              validationSchema={schema}
              onSubmit={async (values) => {
                try {
                  forceStartLoading();

                  let allowDiscount = false;
                  // TODO: add active members to the check
                  const isActiveMember = checkAuthorization(user.token, ACCESS_3);
                  const isMemberForDiscount = selectedEvent.activeMemberPriceId && selectedEvent.discountPass.length > 0 && (selectedEvent.discountPass.includes(currentUser.email) || selectedEvent.discountPass.includes(currentUser.name + ' ' + currentUser.surname));
                  const isMemberForFreeTicket = selectedEvent.freePass.length > 0 && (selectedEvent.freePass.includes(currentUser.email) || selectedEvent.freePass.includes(currentUser.name + ' ' + currentUser.surname));

                  if (!normalTicket) {
                    const checkMemberTicket = await sendRequest(`event/check-member/${currentUser.id}/${eventId}`);

                    if (!checkMemberTicket.hasOwnProperty('status') && !checkMemberTicket.status) {
                      dispatch(showNotification({
                        severity: 'warn',
                        detail: "You already have a member ticket for this event - you can still proceed the checkout but will pay the guest price!",
                        life: 1200
                      }));
                      setNormalTicket(true);
                      return;
                    } else {
                      allowDiscount = true;
                    }
                  }

                  const data = encryptData({
                    eventId: selectedEvent.id,
                    name: currentUser.name,
                    surname: currentUser.surname,
                    email: currentUser.email,
                  });

                  const qrCode = `${process.env.REACT_APP_PUBLIC_URL}/user/check-guest-list?data=${data}`;

                  const { ticketBlob } = await createCustomerTicket(selectedEvent.ticketImg, currentUser.name, currentUser.surname, selectedEvent.ticketColor, qrCode);

                  // formData
                  const formData = new FormData();
                  formData.append(
                    "image",
                    ticketBlob,
                    selectedEvent.id + "_" + currentUser.name + currentUser.surname + "_MEMBER"
                  );

                  formData.append("region", region);
                  formData.append("origin_url", window.location.origin);
                  formData.append("method", "buy_member_ticket");
                  formData.append("eventId", selectedEvent.id);
                  formData.append("userId", currentUser.id);
                  if (selectedEvent.extraInputsFormForm) {
                    formData.append('preferences', JSON.stringify(Object.keys(schemaFields).reduce((obj, key) => {
                      if (Array.isArray(values[key])) {
                        obj[key] = values[key].join(', ');
                      } else {
                        obj[key] = values[key];
                      }
                      return obj;
                    }, {})))
                  }

                  if (selectedEvent.isFree || selectedEvent.isMemberFree) {
                    return buyFreeTicket(formData);
                  }

                  if (allowDiscount && (isMemberForDiscount || isMemberForFreeTicket || isActiveMember)) {
                    if (isMemberForFreeTicket) {
                      return buyFreeTicket(formData);
                    } else {
                      formData.append("itemId", selectedEvent.activeMemberPriceId);
                    }
                  } else if (normalTicket) {
                    formData.append("itemId", selectedEvent.priceId);
                  } else {
                    formData.append("itemId", selectedEvent.memberPriceId);
                  }

                  const responseData = await sendRequest(
                    "payment/checkout/member",
                    "POST",
                    formData,
                  );
                  if (responseData.url) {
                    window.location.assign(responseData.url);
                  }

                } catch (err) {
                  console.log(err)
                }
              }}
              initialValues={(selectedEvent?.extraInputsForm?.reduce((acc, _, index) => {
                acc[`extraInput${index + 1}`] = '';
                return acc;
              }, {}) || {})}>
              {() => (
                <Form id='form' encType="multipart/form-data" className="row"
                >
                  <div className="col-lg-6 col-md-12 col-12">
                    <div className="event_details">
                      <h2 className="mt--40">Event Details</h2>
                      <p>Name: {selectedEvent.title}</p>
                      <p>
                        Date:{" "}
                        {selectedEvent.correctedDate
                          ? moment(selectedEvent.correctedDate).format("Do MMMM") + " Updated!"
                          : moment(selectedEvent.date).format("Do MMMM")}
                      </p>
                      <p>
                        Time:{" "}
                        {selectedEvent.correctedTime
                          ? selectedEvent.correctedDate + " Updated!"
                          : selectedEvent.time}
                      </p>
                      <p>Address: {selectedEvent.location}</p>
                      <p>Price: {estimatePriceByEvent(selectedEvent, {...currentUser, token: user.token ?? ''}, normalTicket)}</p>
                    </div>
                  </div>
                  {selectedEvent.extraInputsForm.length > 0 && <div className="col-lg-6 col-md-12 col-12 row container mt--40">
                    <FormExtras inputs={selectedEvent.extraInputsForm} />
                  </div>}
                  <div style={{maxWidth: '10em'}}>
                    <WithBackBtn>
                      <button
                        disabled={loading}
                        type="submit"
                        className="rn-button-style--2 rn-btn-reverse-green"
                      >
                        {loading ? <Loader /> : <span>Proceed to paying</span>}
                      </button>
                    </WithBackBtn>
                  {normalTicket && <Message severity="warn" className="center_div mt--20" text="You already have redeemed your discount - if you proceed, you will pay the full ticket price" />}
                  </div>
                  <p className="information mt--40">
                    The information for purchasing this ticket will be taken from your
                    account. Be sure it is accurate as it can be used as a proof of
                    your identity on the entry!
                  </p>
                  <p className="information mt--10">*Special discounted price for board and committee members may apply</p>
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
    )
  }
};

export default MemberPurchase;
