import React, { useEffect, useState } from 'react'
import HeaderTwo from "../../component/header/HeaderTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import EventForm from '../../elements/actions/form/EventForm';
import { useHttpClient } from '../../hooks/common/http-hook';
import HeaderLoadingError from '../../elements/ui/errors/HeaderLoadingError';
import { loadSingleEventDashboard, selectSingleEventDashboard } from '../../redux/events';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

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
          <FiChevronUp size={26} style={{ fontSize: '26px' }} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </React.Fragment>
  )
}

export default EditEvent