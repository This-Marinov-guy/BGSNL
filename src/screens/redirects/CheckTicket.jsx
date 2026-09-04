"use client";

import {
  useEffect,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import {
  InputNumber,
  Message,
} from "@/compat/primereact";
import { useNavigate } from "@/util/navigation";
import HeaderTwo from "../../component/header/HeaderTwo";
import PageLoading from "../../elements/ui/loading/PageLoading";
import { useHttpClient } from "../../hooks/common/http-hook";
import { showNotification } from "../../redux/notification";

const GuestCheck = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const searchParams = new URLSearchParams(window.location.search);

  const eventId = searchParams.get("event");
  const code = searchParams.get("code");
  const count = searchParams.get("count");

  const { sendRequest, loading } = useHttpClient();
  const [status, setStatus] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [message, setMessage] = useState(null);
  const [eventName, setEventName] = useState(null);
  const [data, setData] = useState({
    name: "",
    email: "",
  });

  const handleCountChange = (e) => {
    const newCount = e.target.value;
    searchParams.set("count", newCount);
  };

  const submitCount = (event) => {
    event.preventDefault();
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });
  };

  const updateGuestList = async () => {
    const responseData = await sendRequest("event/check-guest-list", "PATCH", {
      eventId,
      code,
      count: count || null,
    });

    if (responseData !== undefined) {
      setStatus(responseData.status);
      setEventName(responseData.event);
      setData({
        name: responseData.name,
        email: responseData.email,
      });
    } else {
      return;
    }

    switch (responseData.status) {
      case 0:
        setSeverity("info");
        setMessage("Guest is already checked-in");
        break;
      case 1:
        setSeverity("warn");
        setMessage(
          "We have found multiple purchases with from the guest. Please specify the count of tickets to update"
        );
        break;
      case 2:
        setSeverity("success");
        setMessage("Guest list has been updated");
        break;
      default:
        return;
    }
  };

  useEffect(() => {
    if (!(code && eventId)) {
      dispatch(
        showNotification({
          severity: "warn",
          detail: "It looks like the link was invalid!",
        })
      );

      navigate("/user");
    }

    updateGuestList();
  }, [window.location.href]);

  if (loading) {
    return <PageLoading />;
  }

  const info = (
    <div className="col-lg-12">
      <p>Event: {eventName}</p>
      <p>Name: {data.name}</p>
      <p>Email: {data.email}</p>
      <p>Count of guests: {count || "Not specified"}</p>
    </div>
  );

  switch (status) {
    case 0:
    case 2:
      return (
        <>
          <HeaderTwo logo="light" />
          <div className="container center_text mt--160">
            <div className="row">
              <div className="col-lg-12 mb--40">
                <Message severity={severity} text={message} />
              </div>
              {info}
            </div>
          </div>
        </>
      );
    case 1:
      return (
        <>
          <HeaderTwo logo="light" />
          <div className="container center_text mt--160">
            <div className="row">
              <div className="col-lg-12">
                <Message severity={severity} text={message} />
              </div>
              <form
                className="col-lg-12 mt--40 mb--40"
                onSubmit={submitCount}
              >
                <h3>Ticket Count</h3>
                <div data-field-name="count">
                  <InputNumber
                    name="count"
                    value={count || 1}
                    onValueChange={handleCountChange}
                    showButtons
                    buttonLayout="horizontal"
                    style={{ width: "160px" }}
                    decrementButtonClassName="p-button-danger"
                    incrementButtonClassName="p-button-success"
                    min={1}
                    max={10}
                    required
                  />
                </div>
                <br />
                <button
                  type="submit"
                  className="rn-button-style--2 rn-btn-reverse-green"
                >
                  Submit Count
                </button>
              </form>
              {info}
            </div>
          </div>
        </>
      );
    default:
      return (
        <>
          <HeaderTwo logo="light" />
          <PageLoading />
        </>
      );
  }
};

export default GuestCheck;
