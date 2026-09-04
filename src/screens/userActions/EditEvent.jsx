"use client";

import React, {
  useEffect,
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
} from "@/util/navigation";
import HeaderTwo from "../../component/header/HeaderTwo";
import EventForm from "../../elements/actions/form/EventForm";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import { useHttpClient } from "../../hooks/common/http-hook";
import {
  loadSingleEventDashboard,
  selectSingleEventDashboard,
} from "../../redux/events";

const EditEvent = (props) => {
  const [pageLoading, setPageLoading] = useState(false);

  const { loading, sendRequest } = useHttpClient();

  const navigate = useNavigate();

  const event = useSelector(selectSingleEventDashboard);

  const { eventId } = useParams();

  const dispatch = useDispatch();

  useEffect(() => {
    const reloadEvent = async () => {
      if (event && event.id === eventId ) {
        return setPageLoading(false);
      }
      
      try {
        setPageLoading(true);
        const responseData = await sendRequest(`future-event/full-event-details/${eventId}`);
        dispatch(loadSingleEventDashboard(responseData.event));

        if (!event) {
          navigate('/user/dashboard');
        }
      } catch (err) {
      } finally {
        setPageLoading(false);
      }
    };

    reloadEvent();
  }, [])

  if (pageLoading) {
    return <HeaderLoadingError />
  } 

  return (
    <React.Fragment>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <div className="container mt--200">
        <h3 className="center_text">Edit Event</h3>
      </div>
      <EventForm edit initialData={event} />

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