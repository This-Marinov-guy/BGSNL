"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "@/util/navigation";
import HeaderTwo from "../../component/header/HeaderTwo";
import EventForm from "../../elements/actions/form/EventForm";
import EventEditSummary from "../../elements/actions/form/EventEditSummary";
import { EVENT_DRAFT } from "../../util/defines/common";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import { useHttpClient } from "../../hooks/common/http-hook";
import {
  loadSingleEventDashboard,
  selectSingleEventDashboard,
} from "../../redux/events";

const EditEvent = () => {
  const [pageLoading, setPageLoading] = useState(true);

  const { sendRequest } = useHttpClient();
  const requestRef = useRef(sendRequest);
  requestRef.current = sendRequest;

  const navigate = useNavigate();

  const event = useSelector(selectSingleEventDashboard);

  const { eventId } = useParams();
  const [searchParams] = useSearchParams();

  const dispatch = useDispatch();

  useEffect(() => {
    let active = true;
    setPageLoading(true);
    const reloadEvent = async () => {
      const response = await requestRef.current(`future-event/full-event-details/${eventId}`);
      if (!active) return;
      if (!response?.event) {
        navigate("/user/dashboard/events", { replace: true });
        return;
      }
      dispatch(loadSingleEventDashboard(response.event));
      setPageLoading(false);
    };
    reloadEvent();
    return () => { active = false; };
  }, [dispatch, eventId, navigate]);

  if (pageLoading || !event || event.id !== eventId) {
    return <HeaderLoadingError />;
  }

  return (
    <React.Fragment>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <div className="container mt--120">
        <h3 className="center_text">{event.status === EVENT_DRAFT ? "Edit Draft" : "Edit Event"}</h3>
        <EventEditSummary key={event.id} event={event} />
      </div>
      <EventForm key={event.id} edit initialData={event} completeDraft={event.status === EVENT_DRAFT && searchParams.get("complete") === "1"} />

      {/* End Footer Style  */}
      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </React.Fragment>
  )
}

export default EditEvent