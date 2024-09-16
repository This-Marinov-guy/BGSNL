import React, { Fragment, useEffect, useState } from "react";
import * as yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useHttpClient } from "../../hooks/http-hook";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import Footer from "../../component/footer/Footer";
import ImageFb from "../../elements/ui/media/ImageFb";
import { Message } from 'primereact/message';
import Loader from "../../elements/ui/loading/Loader";
import { InputNumber } from 'primereact/inputnumber';
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import { createCustomerTicket } from "../../util/functions/ticket-creator"
import FormExtras from "../../elements/ui/forms/FormExtras";
import { useNavigate, useParams, Link } from "react-router-dom";
import MembershipBanner from "../../elements/banners/MembershipBanner";
import WithBackBtn from "../../elements/ui/functional/WithBackBtn";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import { encryptData } from "../../util/functions/helpers";
import NoEventFound from "../../elements/ui/errors/NoEventFound";
import moment from "moment";
import { useDispatch } from "react-redux";
import { MOMENT_DATE_TIME } from "../../util/functions/date";

const GuestPurchase = () => {
  const { loading, sendRequest, forceStartLoading } = useHttpClient();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventClosed, setEventClosed] = useState(false)
  const [quantity, setQuantity] = useState(1);
  const [normalTicket, setNormalTicket] = useState(false);

  const { region, eventId } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const buyFreeTicket = async (formData) => {
    await sendRequest(
      "event/purchase-ticket/guest",
      "POST",
      formData
    );

    navigate('/success');
  }

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
  }, []);

  const schemaFields = {};

  if (selectedEvent?.extraInputsForm && Array.isArray(selectedEvent.extraInputsForm)) {
    selectedEvent.extraInputsForm.forEach((input, index) => {
      const fieldName = `extraInput${index + 1}`;
      schemaFields[fieldName] = input.required ? yup.string().required("Required field") : yup.string();
    });
  }

  const schema = yup.object().shape({
    name: yup.string().required(),
    surname: yup.string().required(),
    phone: yup.string().required(),
    email: yup.string().email("Please enter a valid email").required(),
    policyTerms: yup.bool().required().oneOf([true], "Terms must be accepted"),
    payTerms: yup.bool().required().oneOf([true], "Terms must be accepted"),
    ...schemaFields
  });

  if (loadingPage) {
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

        <div className="container">
          <div className="mt--140">
            {selectedEvent.membersOnly ? <h3 className="center_text mb--80">Opps... it seems that this is an event exclusive to members! You still have a chance to enter!</h3> :
              <h2 className="center_text mb--20">Purchase a Ticket</h2>}

            {!selectedEvent.ticketLink && <MembershipBanner />}
          </div>
          {!selectedEvent.membersOnly && <div className="row">
            <div className="col-lg-4 col-md-12 col-12">
              <div className="mb--20">
                <ImageFb src={`${selectedEvent.images[0]}`} alt="Event" className="title_img" />
                <h2 className="mt--40">Event Details</h2>
                <p>Name:{" "}{selectedEvent.title}</p>
                <p>
                  Date:{" "}
                  {selectedEvent.correctedDate
                    ? moment(selectedEvent.correctedDate).format(MOMENT_DATE_TIME) + " Updated!"
                    : moment(selectedEvent.date).format(MOMENT_DATE_TIME)}
                </p>
                <p>Address:{" "}{selectedEvent.location}</p>
                <p>Price:{" "}{selectedEvent.isFree ? ' FREE' : selectedEvent.product?.guest.price + ' euro'}</p>

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
                      const isGuestForDiscount = selectedEvent.discountPass && (selectedEvent.discountPass.includes(values.email) || selectedEvent.discountPass.includes(values.name + ' ' + values.surname));
                      const isGuestForFreeTicket = selectedEvent.freePass && (selectedEvent.freePass.includes(values.email) || selectedEvent.freePass.includes(values.name + ' ' + values.surname));

                      // TODO: add functionality for multiple tickets
                      if (!normalTicket && (isGuestForDiscount || isGuestForFreeTicket)) {
                        const checkDiscounts = await sendRequest(`event/check-guest-discount/${eventId}`, "POST", {
                          email: values.email,
                          name: values.name,
                          surname: values.surname
                        });

                        if (!checkDiscounts.hasOwnProperty('status') && !checkDiscounts.status) {
                          dispatch(showNotification({
                            severity: 'warn',
                            detail: "You already have an applied bonus for this event - you can still proceed the checkout but will pay the guest price!",
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
                        name: values.name,
                        surname: values.surname,
                        email: values.email,
                      });

                      // TODO: temp fix untill all events have it
                      const hasQR = selectedEvent.hasOwnProperty('ticketQR') ? selectedEvent.ticketQR : true;
                      const qrCode = hasQR ? `${process.env.REACT_APP_PUBLIC_URL}/user/check-guest-list?data=${data}&count=${quantity}` : '';

                      const { ticketBlob } = await createCustomerTicket(selectedEvent.ticketImg, values.name, values.surname, selectedEvent.ticketColor, qrCode, selectedEvent.ticketName);

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
                      formData.append("guestEmail", values.email);
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

                      formData.append(
                        "guestName",
                        values.name + " " + values.surname
                      );
                      formData.append("guestPhone", values.phone);

                      if (selectedEvent.isFree) {
                        return buyFreeTicket(formData);
                      }

                      if (allowDiscount && (isGuestForDiscount || isGuestForFreeTicket)) {
                        if (isGuestForFreeTicket) {
                          return buyFreeTicket(formData);
                        } else {
                          formData.append("itemId", selectedEvent.product?.activeMember.priceId ?? selectedEvent.product?.member.priceId);
                        }
                      } else {
                        formData.append("itemId", selectedEvent.product?.guest.priceId);
                      }

                      const responseData = await sendRequest(
                        "payment/checkout/guest-ticket",
                        "POST",
                        formData,
                      );
                      if (responseData.url) {
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
                    ...(selectedEvent?.extraInputsForm?.reduce((acc, _, index) => {
                      acc[`extraInput${index + 1}`] = '';
                      return acc;
                    }, {}) || {})
                  }}
                >
                  {(values) => (
                    <Form id="form" encType="multipart/form-data"
                      className="mb--120">
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
                              Please enter an email you have access to as the ticket will be send through it
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
                        {selectedEvent.extraInputsForm.length > 0 && <FormExtras inputs={selectedEvent.extraInputsForm} />}
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
                        <div className="col-lg-12 col-md-12 col-12 mt--20" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3>
                            Quantity
                          </h3>
                          <InputNumber value={quantity} onValueChange={(e) => setQuantity(e.value)} showButtons buttonLayout="horizontal" style={{ width: '160px' }}
                            decrementButtonClassName="p-button-danger" incrementButtonClassName="p-button-success" min={1} max={10}
                          />
                        </div>
                      </div>
                      <div>
                        <WithBackBtn>
                          <button
                            disabled={isLoading}
                            type="submit"
                            className="rn-button-style--2 rn-btn-reverse-green mt--20"
                          >
                            {isLoading ? <Loader /> : <span>Payment</span>}
                          </button>
                        </WithBackBtn>
                        {normalTicket && <Message severity="warn" className="center_div mt--20" text="You already have redeemed your discount - if you proceed, you will pay the full ticket price" />}
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>}
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
  }
};

export default GuestPurchase;
