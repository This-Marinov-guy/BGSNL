import React, { useState, useEffect, Fragment, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useHttpClient } from "../../hooks/common/http-hook";
import { useSelector, useDispatch } from "react-redux";
import { FiChevronUp, FiArrowRight } from "react-icons/fi";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import Tooltip from "react-bootstrap/Tooltip";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { selectUser } from "../../redux/user";
import SubscriptionManage from "../../elements/ui/buttons/SubscriptionManage";
import Recruit from "../../elements/special/Recruite";
import { Image } from 'primereact/image';
import { INTERNSHIPS_LIST } from "../../util/defines/INTERNSHIPS";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import UserUpdateModal from "../../elements/ui/modals/UserUpdateModal";
import UserCard from "../../elements/ui/cards/UserCard";
import BirthdayBanner from "../../elements/banners/BirthdayBanner";
import Christmas from "../../elements/special/Christmas";
import { isProd } from "../../util/functions/helpers";
import NewsList from "../../elements/ui/lists/NewsList";
import { ACCOUNT_TABS, ACTIVE, INTERNSHIPS, NEWS, TICKETS, USER_STATUSES } from "../../util/defines/enum";

const User = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState();
  const [hasBirthday, setHasBirthday] = useState();
  const [tab, setTab] = useState(window.location.hash.substring(1).split('?')[0]);
  const [disableScroll, setDisableScroll] = useState(false);

  const { sendRequest } = useHttpClient();

  const user = useSelector(selectUser);

  const location = useLocation();
  const navigate = useNavigate();

  const routePath = location.pathname + location.hash;

  const scrollRef = useRef(null);

  useEffect(() => {
    if (!user.token) {
      sessionStorage.setItem('prevUrl', routePath);
      return navigate('/login');
    }

    const fetchCurrentUser = async () => {
      try {
        const responseData = await sendRequest(`user/current?withTickets=${true}&withChristmas=${true}`);

        setCurrentUser(responseData.user);
        setHasBirthday(responseData.celebrate);

      } catch (err) {
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const hash = window.location.hash.substring(1).split('?')[0];
    setTab(hash);
  }, [location.hash]);

  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current && ACCOUNT_TABS.includes(tab) && !disableScroll) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

    setDisableScroll(false);
  }, [tab, currentUser]);

  let menuContent = null;

  switch (tab) {
    case '':
    case NEWS:
      menuContent = <NewsList />
      break;
    case TICKETS:
      menuContent = <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="mb--30 mb_sm--0">
              <h2 className="title">Ticket Collection</h2>
              <p>*Click one to expand it</p>
              {(currentUser && currentUser.tickets?.length > 0) ? (
                <div className="row">
                  {currentUser.tickets.map((ticket, i) => (
                    <Image src={ticket.image} alt="Image with expand" className="col-lg-4 col-md-6 col-12 mt--10 mb--10" key={i} preview />
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
    case INTERNSHIPS:
      menuContent = <Fragment>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="mb--30 mb_sm--0">
                <h2 className="title">Internships</h2>
                <p>As a BGSNL member you get special access to our recommended positions. Check the section frequently as we aim to add exclusive internships for our members only!</p>
                {INTERNSHIPS_LIST.map((i, index) => {
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

  if (isPageLoading) {
    return (<HeaderLoadingError />)
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
    {/* <Christmas currentUser={currentUser} /> */}
    {/* Start Info Area */}
    <div className="service-area ptb--20 bg_color--1 mt--80">
      <div className="container">
        <div className="row service-one-wrapper">
          <div className="col-lg-5 col-md-12 col-12 center_div_col">
            {(!isProd() || currentUser.subscription) ? <SubscriptionManage userId={currentUser.id} subscription={currentUser.subscription} /> : <div className="mt--60" />}
            <div className="service">
              {hasBirthday && <img src='/assets/images/special/birthday-hat.png' alt='hat' className='birthday-hat' />}
              <LazyLoadImage src={currentUser.image} alt="profile" className="profile-image" />
            </div>
          </div>
          <div className="col-lg-5 col-md-12 col-12">
            <UserCard user={currentUser} />
          </div>
        </div>
      </div>
    </div>
    {/* End Info Area */}
    {/* <Greeting /> */}
    {/* Start User Collection */}
    <div ref={scrollRef} className="btn_row row">
      {ACCOUNT_TABS.map((t, i) => (
        <Link
          key={i}
          to={`#${t}`}
          className={`col-lg-2 col-md-4 col-sm-12 center_text rn-button-style--2 ${tab === t || (tab === '' && t === ACCOUNT_TABS[0]) ? 'rn-btn-solid-green' : 'rn-btn-green'}`}
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
