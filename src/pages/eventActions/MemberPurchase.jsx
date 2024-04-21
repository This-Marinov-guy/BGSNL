import React, { Fragment, useEffect, useState } from "react";
import * as yup from "yup";
import { Formik, Form } from "formik";
import PageHelmet from "../../component/common/Helmet";
import Header from "../../component/header/Header";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useHttpClient } from "../../hooks/http-hook";
import Loader from "../../elements/ui/Loader";
import Locked from "../../elements/ui/Locked";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import Footer from "../../component/footer/Footer";
import ImageFb from "../../elements/ui/ImageFb";
import { useObjectGrabUrl } from "../../hooks/object-hook";
import { SOCIETY_EVENTS } from "../../util/OPEN_EVENTS";
import { createCustomerTicket } from "../../util/ticket-creator";
import PageLoading from "../../elements/ui/PageLoading";
import FormExtras from "../../elements/ui/FormExtras";
import { REGIONS } from "../../util/REGIONS_DESIGN";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/user";
import { decodeJWT } from "../../util/jwt";
import WithBackBtn from "../../elements/ui/WithBackBtn";

const MemberPurchase = () => {
  const { loading, sendRequest } = useHttpClient();

  const [currentUser, setCurrentUser] = useState();
  const [loadingPage, setLoadingPage] = useState(true);
  const [eventClosed, setEventClosed] = useState(false)

  const { region } = useParams();

  const user = useSelector(selectUser);

  const navigate = useNavigate()

  const target = useObjectGrabUrl(SOCIETY_EVENTS[region]);

  const schema = yup.object().shape({
    extraOne: (target.extraInputs[0] && target.extraInputs[0].required) ? yup.string().required("Required field") : yup.string(),
    extraTwo: (target.extraInputs[1] && target.extraInputs[1].required) ? yup.string().required("Required field") : yup.string(),
    extraThree: (target.extraInputs[2] && target.extraInputs[2].required) ? yup.string().required("Required field") : yup.string(),
  });

  function calculateTimeRemaining(timer) {
    const now = new Date().getTime();
    const targetTime = new Date(timer).getTime();
    const timeDifference = targetTime - now;
    return Math.max(0, timeDifference);
  }

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
    try {
      if (target.ticketLimit) {
        const checkRemainingTicketQuantity = async () => {
          try {
            const responseData = await sendRequest(`event/sold-ticket-count`, "POST", {
              eventName: target.title,
              region,
              date: target.date
            });
            const isTicketsSold = target.ticketLimit - responseData.ticketsSold <= 0;
            if (isTicketsSold) {
              setEventClosed(true)
            }
          } catch (err) { }
        };
        checkRemainingTicketQuantity();
      }
      if (target.ticketTimer) {
        const timeRemaining = calculateTimeRemaining(target.ticketTimer);
        if (timeRemaining <= 0) {
          setEventClosed(true)
        }
      }
    } catch (err) {
    } finally {
      setLoadingPage(false)
    }
  }, [target])

  if (target.ticket_link) {
    return (<div className="container center_text mt--100">
      <ImageFb
        className="logo mb--40"
        src={`/assets/images/logo/${region && REGIONS.includes(region) ? region : 'logo'}.webp`}
        fallback={`/assets/images/logo/${region && REGIONS.includes(region) ? region : 'logo'}.jpg`}
        alt="Logo"
      />
      <h3 className="">This event is sold through an external platform - click below to see it!</h3>
      <a href={target.ticket_link}
        className="rn-button-style--2 btn-solid mt--20"
      >
        Go to event
      </a>
    </div>)
  }

  if (loadingPage || !currentUser) {
    return <PageLoading />
  } else if (eventClosed) {
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
        <Header
          headertransparent="header--transparent"
          colorblack="color--black"
          logoname="logo.png"
          dark
        />
        {currentUser.status !== "active" && <Locked case='locked' show={currentUser.status} />}
        <div className="container mt--200 mb--120">
          <h2 className="center_text mb--80">Purchase a Ticket</h2>

          <div className="row slide-down center_div">
            <ImageFb src={`${target.images[0]}.webp`} fallback={`${target.images[0]}.jpg`} alt="Event" className="title_img" />
          </div>
          <div
            style={{ width: "80%", margin: "auto" }}
            className="row team_member_border-3 mt--80 purchase_panel"
          >
            <Formik
              validationSchema={schema}
              onSubmit={async (values) => {
                try {
                  const ticket = await createCustomerTicket(target.ticket_img, currentUser.name, currentUser.surname, target.ticket_color);

                  // formData
                  const formData = new FormData();
                  formData.append(
                    "image",
                    ticket,
                    target.title + "_" + currentUser.name + currentUser.surname + "_MEMBER"
                  );
                  if (target.activeMemberPrice_id && (currentUser.expireDate === "Board Member" || currentUser.expireDate === "Committee Member" || currentUser.expireDate === "VIP" || currentUser.expireDate === "VIP Member" || (target.discountPass && target.discountPass.includes(currentUser.email)))) {
                    formData.append("itemId", target.activeMemberPrice_id);
                  } else {
                    formData.append("itemId", target.memberPrice_id);
                  }
                  formData.append("region", region);
                  formData.append("origin_url", window.location.origin);
                  formData.append("method", "buy_member_ticket");
                  formData.append("eventName", target.title);
                  formData.append("eventDate", target.date);
                  formData.append("userId", currentUser.id);
                  if (target.extraInputs) {
                    formData.append('preferences', JSON.stringify({ inputOne: values.extraOne, inputTwo: values.extraTwo, inputThree: values.extraThree, }))
                  }
                  if (target.isFree || target.isMemberFree || target.freePass.includes(currentUser.email) || target.freePass.includes(currentUser.name + ' ' + currentUser.surname)) {
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
                      <p>Name: {target.title}</p>
                      <p>
                        Date:{" "}
                        {target.correctedDate
                          ? target.correctedDate + " Updated!"
                          : target.date}
                      </p>
                      <p>
                        Time:{" "}
                        {target.correctedTime
                          ? target.correctedTime + " Updated!"
                          : target.time}
                      </p>
                      <p>Address: {target.where}</p>
                      <p>Price: {target.isFree ? ' FREE' : target.memberEntry ? `${target.memberEntry} euro (discounted)` : `${target.entry} (no MEMBER discount)`}</p>
                    </div>
                  </div>
                  {target.extraInputs && <FormExtras target={target.extraInputs} />}
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
