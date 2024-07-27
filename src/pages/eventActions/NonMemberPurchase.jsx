import React, { Fragment, useEffect, useState } from "react";
import * as yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useHttpClient } from "../../hooks/http-hook";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import Footer from "../../component/footer/Footer";
import ImageFb from "../../elements/ui/ImageFb";
import Loader from "../../elements/ui/loading/Loader";
import { InputNumber } from 'primereact/inputnumber';
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import { createCustomerTicket } from "../../util/functions/ticket-creator"
import FormExtras from "../../elements/ui/FormExtras";
import { useNavigate, useParams, Link } from "react-router-dom";
import MarketingForm from "../../elements/ui/MarketingForm";
import MembershipBanner from "../../elements/banners/MembershipBanner";
import WithBackBtn from "../../elements/ui/WithBackBtn";
import HeaderPageLoading from "../../elements/ui/loading/HeaderPageLoading";
import { encryptData } from "../../util/functions/helpers";

const NonMemberPurchase = () => {
  const { loading, sendRequest, forceStartLoading } = useHttpClient();

  const [loadingPage, setLoadingPage] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventClosed, setEventClosed] = useState(false)
  const [marketingData, setMarketingData] = useState({})
  const [quantity, setQuantity] = useState(1);

  const { region, eventId } = useParams()

  const schema = yup.object().shape({
    name: yup.string().required(),
    surname: yup.string().required(),
    phone: yup.string().required(),
    email: yup.string().email("Please enter a valid email").required(),
    // extraOne: (selectedEvent.extraInputsForm && selectedEvent.extraInputsForm[0] && selectedEvent.extraInputsForm[0].required) ? yup.string().required("Required field") : yup.string(),
    // extraTwo: (selectedEvent.extraInputsForm && selectedEvent.extraInputsForm[1] && selectedEvent.extraInputsForm[1].required) ? yup.string().required("Required field") : yup.string(),
    // extraThree: (selectedEvent.extraInputsForm && selectedEvent.extraInputsForm[2] && selectedEvent.extraInputsForm[2].required) ? yup.string().required("Required field") : yup.string(),
    policyTerms: yup.bool().required().oneOf([true], "Terms must be accepted"),
    payTerms: yup.bool().required().oneOf([true], "Terms must be accepted"),
  });

  const navigate = useNavigate()

  useEffect(() => {
    setLoadingPage(true);
    const getEventDetails = async () => {
      try {
        const responseData = await sendRequest(`event/get-event-details-id/${eventId}`);
        setSelectedEvent(responseData.event);
        setEventClosed(!responseData.status);
      } catch (err) {
      } finally {
        setLoadingPage(false);
      }
    };

    getEventDetails();
  }, [])

  if (loadingPage || !selectedEvent) {
    return <HeaderPageLoading />
  }

  if (selectedEvent.ticket_link) {
    return (<div className="container center_text mt--100">
      <ImageFb
        className="logo mb--40"
        src={`/assets/images/logo/${region && REGIONS.includes(region) ? region : 'logo'}.webp`}
        fallback={`/assets/images/logo/${region && REGIONS.includes(region) ? region : 'logo'}.jpg`}
        alt="Logo"
      />
      <h3 className="">This event is sold through an external platform - click below to see it!</h3>
      <a href={selectedEvent.ticket_link}
        className="rn-button-style--2 btn-solid mt--20"
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
          className="rn-button-style--2 btn-solid mt--20"
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
          <div className="mt--200">
            {selectedEvent.membersOnly ? <h3 className="center_text mb--80">Opps... it seems that this is an event exclusive to members! You still have a chance to enter!</h3> :
              <h2 className="center_text mb--80">Purchase a Ticket</h2>}

            {!selectedEvent.ticket_link && <MembershipBanner />}
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
                    ? selectedEvent.correctedDate + " Updated!"
                    : selectedEvent.date}
                </p>
                <p>
                  Time:{" "}
                  {selectedEvent.correctedTime
                    ? selectedEvent.correctedTime + " Updated!"
                    : selectedEvent.time}
                </p>
                <p>Address:{" "}{selectedEvent.location}</p>
                <p>Price:{" "}{selectedEvent.isFree ? ' FREE' : selectedEvent.entry + ' euro'}</p>

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
                      forceStartLoading();

                      const data = encryptData({
                        event: selectedEvent.title,
                        name: values.name,
                        surname: values.surname,
                        email: values.email,
                      });
                      const qrCode = `${process.env.REACT_APP_SERVER_URL}event/check-guest-list?data=${data}&count=${quantity}`;
                      const { ticketBlob } = await createCustomerTicket(selectedEvent.ticket_img, values.name, values.surname, selectedEvent.ticket_color, qrCode);

                      // formData
                      const formData = new FormData();
                      formData.append(
                        "image",
                        ticketBlob,
                        selectedEvent.title +
                        "_" +
                        values.name +
                        values.surname +
                        "_GUEST"
                      );
                      formData.append("region", region);
                      if (selectedEvent.discountPass && (selectedEvent.discountPass.includes(values.email) || selectedEvent.discountPass.includes(values.name + ' ' + values.surname))) {
                        formData.append("itemId", selectedEvent.activeMemberPrice_id);
                      } else {
                        formData.append("itemId", selectedEvent.price_id);
                      }
                      formData.append("quantity", quantity);
                      formData.append("origin_url", window.location.origin);
                      formData.append("method", "buy_guest_ticket");
                      formData.append("eventName", selectedEvent.title);
                      formData.append("eventDate", selectedEvent.date);
                      formData.append("guestEmail", values.email);
                      if (selectedEvent.extraInputsForm) {
                        formData.append('preferences', JSON.stringify({ bar: values.extraOne, }))
                      }
                      if (selectedEvent.marketingInputs && marketingData) {
                        formData.append('marketing', JSON.stringify(marketingData))
                      }
                      formData.append(
                        "guestName",
                        values.name + " " + values.surname
                      );
                      formData.append("guestPhone", values.phone);
                      if (selectedEvent.isFree || selectedEvent.freePass.includes(values.email) || selectedEvent.freePass.includes(values.name + ' ' + values.surname)) {
                        await sendRequest(
                          "event/purchase-ticket/guest",
                          "POST",
                          formData
                        );
                        navigate('/success');
                      } else {
                        const responseData = await sendRequest(
                          "payment/checkout/guest",
                          "POST",
                          formData,
                        );
                        if (responseData.url) {
                          window.location.assign(responseData.url);
                        }
                      }
                    } catch (err) {
                      // console.log(err)
                    }
                  }}
                  initialValues={{
                    name: "",
                    surname: "",
                    email: "",
                    phone: "",
                    extraOne: '',
                    extraTwo: '',
                    extraThree: '',
                    policyTerms: false,
                    payTerms: false,
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
                        {selectedEvent.extraInputsForm.length > 0 && <FormExtras selectedEvent={selectedEvent.extraInputsForm} />}
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
                      <WithBackBtn>
                        <button
                          disabled={loading}
                          type="submit"
                          className="rn-button-style--2 btn-solid mt--20"
                        >
                          {loading ? <Loader /> : <span>Proceed to paying</span>}
                        </button>
                      </WithBackBtn>
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

export default NonMemberPurchase;
