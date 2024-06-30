import React, { Fragment, useEffect, useState } from "react";
import * as yup from "yup";
import { Formik, Form } from "formik";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useHttpClient } from "../../hooks/http-hook";
import Loader from "../../elements/ui/loading/Loader";
import Locked from "../../elements/ui/Locked";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import Footer from "../../component/footer/Footer";
import ImageFb from "../../elements/ui/ImageFb";
import { createCustomerTicket } from "../../util/functions/ticket-creator";
import FormExtras from "../../elements/ui/FormExtras";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/user";
import { decodeJWT } from "../../util/functions/jwt";
import WithBackBtn from "../../elements/ui/WithBackBtn";
import HeaderPageLoading from "../../elements/ui/loading/HeaderPageLoading";

const MemberPurchase = () => {
  const { loading, sendRequest, forceStartLoading } = useHttpClient();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState();
  const [loadingPage, setLoadingPage] = useState(true);
  const [eventClosed, setEventClosed] = useState(false)

  const { region, eventName } = useParams()

  const user = useSelector(selectUser);

  const navigate = useNavigate()

  // const schema = yup.object().shape({
  //   extraOne: (selectedEvent.extraInputsForm && selectedEvent.extraInputsForm[0] && selectedEvent.extraInputsForm[0].required) ? yup.string().required("Required field") : yup.string(),
  //   extraTwo: (selectedEvent.extraInputsForm && selectedEvent.extraInputsForm[1] && selectedEvent.extraInputsForm[1].required) ? yup.string().required("Required field") : yup.string(),
  //   extraThree: (selectedEvent.extraInputsForm && selectedEvent.extraInputsForm[2] && selectedEvent.extraInputsForm[2].required) ? yup.string().required("Required field") : yup.string(),
  // });

  const schema = () => { }

  useEffect(() => {
    const userId = decodeJWT(user.token).userId;
    const fetchCurrentUser = async () => {
      try {
        const responseData = await sendRequest(`user/${userId}`);
        setCurrentUser(responseData.user);
      } catch (err) {
        console.log(err);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    setLoadingPage(true);
    const getEventDetails = async () => {
      try {
        const responseData = await sendRequest(`event/get-event-details?eventName=${eventName}&region=${region}`);
        setSelectedEvent(responseData.event);
        setEventClosed(!responseData.status);
      } catch (err) {
      } finally {
        setLoadingPage(false);
      }
    };

    getEventDetails();
  }, [])

  if (loadingPage || !currentUser || !selectedEvent) {
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
        {currentUser.status !== "active" && <Locked case='locked' show={currentUser.status} />}
        <div className="container mt--200 mb--120">
          <h2 className="center_text mb--80">Purchase a Ticket</h2>

          <div className="row slide-down center_div">
            <ImageFb src={`${selectedEvent.images[0]}.webp`} fallback={`${selectedEvent.images[0]}.jpg`} alt="Event" className="title_img" />
          </div>
          <div
            style={{ width: "80%", margin: "auto" }}
            className="row team_member_border-3 mt--80 purchase_panel"
          >
            <Formik
              validationSchema={schema}
              onSubmit={async (values) => {
                try {
                  forceStartLoading();

                  const qrCode = `${process.env.REACT_APP_SERVER_URL}event/check-guest-list?event=${selectedEvent.title}&name=${currentUser.name}&surname=${currentUser.surname}&email=${encodeURIComponent(currentUser.email)}`
                  const { ticketBlob } = await createCustomerTicket(selectedEvent.ticket_img, currentUser.name, currentUser.surname, selectedEvent.ticket_color, qrCode);

                  // formData
                  const formData = new FormData();
                  formData.append(
                    "image",
                    ticketBlob,
                    selectedEvent.title + "_" + currentUser.name + currentUser.surname + "_MEMBER"
                  );
                  if (selectedEvent.activeMemberPrice_id && (currentUser.expireDate === "Board Member" || currentUser.expireDate === "Committee Member" || currentUser.expireDate === "VIP" || currentUser.expireDate === "VIP Member" || (selectedEvent.discountPass && selectedEvent.discountPass.includes(currentUser.email)))) {
                    formData.append("itemId", selectedEvent.activeMemberPrice_id);
                  } else {
                    formData.append("itemId", selectedEvent.memberPrice_id);
                  }
                  formData.append("region", region);
                  formData.append("origin_url", window.location.origin);
                  formData.append("method", "buy_member_ticket");
                  formData.append("eventName", selectedEvent.title);
                  formData.append("eventDate", selectedEvent.date);
                  formData.append("userId", currentUser.id);
                  if (selectedEvent.extraInputsFormForm) {
                    formData.append('preferences', JSON.stringify({ bar: values.extraOne, }))
                  }
                  if (selectedEvent.isFree || selectedEvent.isMemberFree || selectedEvent.freePass.includes(currentUser.email) || selectedEvent.freePass.includes(currentUser.name + ' ' + currentUser.surname)) {
                    const responseData = await sendRequest(
                      "event/purchase-ticket/member",
                      "POST",
                      formData
                    );
                    navigate('/success');
                  }
                  else {
                    const responseData = await sendRequest(
                      "payment/checkout/member",
                      "POST",
                      formData,
                    );
                    if (responseData.url) {
                      window.location.assign(responseData.url);
                    }
                  }
                } catch (err) { }
              }}
              initialValues={{
                extraOne: '',
                extraTwo: '',
                extraThree: '',
              }}>
              {() => (
                <Form id='form' encType="multipart/form-data"
                >
                  <div className="col-lg-6 col-md-12 col-12">
                    <div className="event_details">
                      <h2 className="mt--40">Event Details</h2>
                      <p>Name: {selectedEvent.title}</p>
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
                      <p>Address: {selectedEvent.location}</p>
                      <p>Price: {(selectedEvent.isFree || selectedEvent.isMemberFree) ? ' FREE' : selectedEvent.memberEntry ? `${selectedEvent.memberEntry} euro (discounted)` : `${selectedEvent.entry} (no MEMBER discount)`}</p>
                    </div>
                  </div>
                  {selectedEvent.extraInputsFormForm.length && <FormExtras selectedEvent={selectedEvent.extraInputsFormForm} />}
                  <WithBackBtn>
                    <button
                      disabled={loading}
                      type="submit"
                      className="rn-button-style--2 btn-solid mt--80"
                    >
                      {loading ? <Loader /> : <span>Proceed to paying</span>}
                    </button>
                  </WithBackBtn>
                  <p className="information mt--20">
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
