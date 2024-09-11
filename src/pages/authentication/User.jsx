import React, { useState, useEffect, Fragment, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useHttpClient } from "../../hooks/http-hook";
import { useSelector, useDispatch } from "react-redux";
import { FiChevronUp, FiArrowRight } from "react-icons/fi";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import Locked from "../../elements/ui/modals/Locked";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { decodeJWT } from "../../util/functions/authorization";
import { selectUser } from "../../redux/user";
import SubscriptionManage from "../../elements/ui/buttons/SubscriptionManage";
import Recruit from "../../elements/special/Recruite";
import { INTERNSHIPS } from "../../util/defines/INTERNSHIPS";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import UserUpdateModal from "../../elements/ui/modals/UserUpdateModal";
import UserCard from "../../elements/ui/cards/UserCard";
import BirthdayBanner from "../../elements/banners/BirthdayBanner";
import Christmas from "../../elements/special/Christmas";
import { isProd } from "../../util/functions/helpers";
import NewsList from "../../elements/ui/lists/NewsList";

const TABS = ['news', 'tickets', 'internships'];

const User = () => {
  const [currentUser, setCurrentUser] = useState();
  const [hasBirthday, setHasBirthday] = useState();
  const [expand, setExpand] = useState(false);
  const [tab, setTab] = useState(window.location.hash.substring(1).split('?')[0]);
  const [disableScroll, setDisableScroll] = useState(false);

  const { sendRequest } = useHttpClient();

  const user = useSelector(selectUser);

  const location = useLocation();
  const navigate = useNavigate();

  const routePath = location.pathname + location.hash;

  const scrollRef = useRef(null);

  const expandHandler = (elementId) => {
    const ticketImage = document.getElementById(elementId);
    const className = "expand_ticket_img";
    if (!ticketImage.classList.contains(className)) {
      ticketImage.classList.add(className);
      setExpand(true);
    } else {
      ticketImage.classList.remove(className);
      setExpand(false);
    }
  };

  useEffect(() => {
    if (!user.token) {
      sessionStorage.setItem('prevUrl', routePath);
      return navigate('/login');
    }

    const userId = decodeJWT(user.token).userId;
    const fetchCurrentUser = async () => {
      try {
        const responseData = await sendRequest(`user/${userId}?withTickets=${true}`);
        setCurrentUser(responseData.user);
        setHasBirthday(responseData.celebrate);
      } catch (err) {
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const hash = window.location.hash.substring(1).split('?')[0];
    setTab(hash);
  }, [location]);

  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current && TABS.includes(tab) && !disableScroll) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

    setDisableScroll(false);
  }, [tab, currentUser]);

  let menuContent = null;

  switch (tab) {
    case '':
    case TABS[0]:
      menuContent = <NewsList />
      break;
    case TABS[1]:
      menuContent = <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="mb--30 mb_sm--0">
              <h2 className="title mb--40">Ticket Collection</h2>
              {(currentUser && currentUser.tickets?.length > 0) ? (
                <div className="row">
                  {currentUser.tickets.map((ticket, i) => (
                    <div className="col-lg-4 col-md-6 col-12" key={i}>
                      <OverlayTrigger
                        overlay={
                          <Tooltip id="tooltip-disabled">
                            {expand ? "Click to Shrink" : "Click to Expand"}
                          </Tooltip>
                        }
                      >
                        <img
                          id={`ticket${i}`}
                          className="mb--40"
                          src={ticket.image}
                          alt="ticket"
                          onClick={(event) => {
                            expandHandler(event.target.id);
                          }}
                        />
                      </OverlayTrigger>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No tickets purchased</p>
              )}
            </div>
          </div>
        </div>
      </div>
      break;
    case TABS[2]:
      menuContent = <Fragment>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="mb--30 mb_sm--0">
                <h2 className="title">Internships</h2>
                <p>As a BGSNL member you get special access to our recommended positions. Check the section frequently as we aim to add exclusive internships for our members only!</p>
                {INTERNSHIPS.map((i, index) => {
                  return <div key={index} className="row mt--20">
                    <div className="col-lg-8 col-md-6 col-12 reading">
                      <h3>Company: </h3><p>{i.company}</p>
                      <h3>Specialty: </h3><p>{i.specialty}</p>
                      <h3>Location: </h3><p>{i.location}</p>
                      <h3>Duration: </h3><p>{i.duration}</p>
                      {i.bonuses.length > 0 &&
                        <>
                          <h3>Bonuses: </h3><p>{i.bonuses.join(' | ')}</p>
                        </>}

                      {i.requirements.length > 0 && <>
                        <h3>Requirements: </h3><p>{i.requirements.join(' | ')}</p>
                      </>}
                      <h3>Description: </h3><p>{i.description}</p>
                    </div>
                    <div className="col-lg-4 col-md-6 col-12" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <img src={i.logo} className={'responsive_img ' + i.logoClass ?? ''} style={{ maxWidth: '300px' }} alt='Company Logo'></img>
                      <a href={i.link} target="_blank" className="mt--20" style={{ fontSize: '30px' }}>
                        <span>Link to internship</span>
                        <FiArrowRight />
                      </a>
                    </div>
                    <hr />
                  </div>
                })}

              </div>
            </div>
          </div>
        </div>
      </Fragment>
      break
    default:
      menuContent = null
  }

  if (!currentUser) {
    return <HeaderLoadingError />
  }

  return <React.Fragment>
    <PageHelmet pageTitle="Profile" />
    <HeaderTwo
      headertransparent="header--transparent"
      colorblack="color--black"
      logoname="logo.png"
      forceRegion={currentUser.region ?? null}
    />
    <UserUpdateModal currentUser={currentUser} />
    {currentUser.status !== "active" && (
      <Locked user={currentUser} case="locked" show={currentUser.status} />
    )}
    {/* <Christmas currentUser={currentUser} /> */}
    {/* Start Info Area */}
    <div className="service-area ptb--20 bg_color--1 mt--80">
      {/* {hasBirthday && <BirthdayBanner birth={currentUser.birth} name={currentUser.name}/>} */}
      <div className="container">
        <div className="row service-one-wrapper">
          <div className="col-lg-6 col-md-12 col-12 center_div_col">
            {(!isProd() || currentUser.subscription) ? <SubscriptionManage userId={currentUser.id} subscription={currentUser.subscription} /> : <div className="mt--60" />}
            <div className="service">
              {hasBirthday && <img src='/assets/images/special/birthday-hat.png' alt='hat' className='birthday-hat' />}
              <LazyLoadImage src={currentUser.image} alt="profile" className="team_member_border-2" />
            </div>
          </div>
          <div className="col-lg-6 col-md-12 col-12">
            <UserCard user={currentUser} />
          </div>
        </div>
      </div>
    </div>
    {/* End Info Area */}
    {/* <Greeting /> */}
    {/* Start User Collection */}
    <div ref={scrollRef} className="options-btns-div mt--60">
      {TABS.map((t, i) => (
        <Link
          key={i}
          to={`#${t}`}
          className={`rn-button-style--2 ${tab === t || (tab === '' && t === TABS[0]) ? 'btn-solid' : 'rn-btn-reverse'}`}
          onClick={() => {
            setDisableScroll(true);
            setTab(t);
          }}
        >
          {t}
        </Link>
      ))}
    </div>

    {menuContent !== null && menuContent}
    {/* End User Collection */}

    {/* Start Footer Style  */}
    <FooterTwo forceRegion={currentUser.region ?? null} />
    {/* End Footer Style  */}
    {/* Start Back To Top */}
    <div className="backto-top">
      <ScrollToTop showUnder={160}>
        <FiChevronUp />
      </ScrollToTop>
    </div>
    {/* End Back To Top */}
  </React.Fragment>
}

export default User;
