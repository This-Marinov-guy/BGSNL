import React, { useEffect, useState } from 'react'
import HeaderTwo from "../../component/header/HeaderTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import EventForm from '../../elements/actions/form/EventForm';
import { useHttpClient } from '../../hooks/http-hook';
import PageLoading from '../../elements/ui/PageLoading';
import { loadSingleEvent, selectSingleEvent } from '../../redux/events';
import { useDispatch } from 'react-redux';
import { useNavigation } from 'react-router-dom';

const EditEvent = (props) => {
  const [pageLoading, setPageLoading] = useState(false);

  const { loading, sendRequest } = useHttpClient();

  const navigate = useNavigation();

  const event = useSelector(selectSingleEvent);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCurrentEvent = async () => {
      try {
        setPageLoading(true);
        const responseData = await sendRequest(`event/actions/event/${userId}`);
        dispatch(loadSingleEvent(responseData.user));

        if (!event) {
          navigate('/user/dashboard')
        }
      } catch (err) {
      } finally {
        setPageLoading(false);
      }
    };
    fetchCurrentEvent();
  }, [])

  if (pageLoading) return <PageLoading />

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
      <EventForm toast={props.toast} />

      {/* End Footer Style  */}
      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </React.Fragment>
  )
}

export default EditEvent