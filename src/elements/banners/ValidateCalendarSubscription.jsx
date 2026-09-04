import { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { FiCheck } from "@/elements/ui/icons/IconlyIcons";
import { useHttpClient } from "../../hooks/common/http-hook";
import { showNotification } from "../../redux/notification";
import ImageInput from "../inputs/common/ImageInput";
import Loader from "../ui/loading/Loader";

const ValidateCalendarSubscription = (props) => {
  const { border = 4, calendarImage } = props;

  const { sendRequest } = useHttpClient();

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const responseData = await sendRequest(
        "user/verify-calendar-subscription",
        "POST",
        formData,
        {},
        true,
        false
      );

      if (responseData?.status) {
        dispatch(
          showNotification({
            severity: "success",
            summary: "Great job!",
            detail: "Submitted for review.",
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={`team_member_border_${border} row align-items-center container`}
      onSubmit={handleSubmit}
      style={{
        margin: "20px auto",
      }}
    >
      <ImageInput
        name="calendarSubscriptionImage"
        required
        onChange={(event) => {
          setImage(event.target.files[0]);
        }}
        initialImage={calendarImage}
        className="col-lg-4 col-md-6 col-12"
      />
      <div
        style={{ paddingRight: 0, paddingLeft: 0 }}
        className="col-lg-8 col-md-6 col-12 text-center"
      >
        <h5 className="mt--20">March is Membership Month {calendarImage && <FiCheck style={{color: "green"}}/>}</h5>
        <p className="information center_text">
          Tag a travel buddy in the comments of BGSNL campaign post (click below on &quot;Explain&quot;) and submit a proof here that you have subscribed to one of our calendars and
          enter a giveway to win 2 free tickets to any BGSNL event and 2 two-way
          train tickets for the event. You have time until{" "}
          <span className="body_emphasis">31st of March</span>. Do not waste
          time and{" "}
          <a href="/events/future-events" target="_blank">
            go make that screenshot (click here)!
          </a>
        </p>
        {loading ? (
          <Loader />
        ) : (
          <div className="row d-flex justify-content-center g--4 mt--20">
            <button
              type="submit"
              className="rn-button-style--2 rn-btn-reverse-green center_text"
            >
              <span className="">Submit</span>
            </button>
            <a href='https://www.instagram.com/p/DGvu4Dftnwg' target="_blank" rel="noreferrer" className="rn-button-style--2 rn-btn-green center_text">
              <span className="">Explain</span>
            </a>
          </div>
        )}
      </div>
    </form>
  );
};

ValidateCalendarSubscription.propTypes = {
  border: PropTypes.number,
  calendarImage: PropTypes.string,
};

export default ValidateCalendarSubscription;
