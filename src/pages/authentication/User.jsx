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
import Locked from "../../elements/ui/Locked";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { decodeJWT } from "../../util/functions/jwt";
import Greeting from "../../elements/Greeting";
import Christmas from "../../elements/special/Christmas";
import { selectUser } from "../../redux/user";
import SubscriptionManage from "../../elements/ui/SubscriptionManage";
import Recruit from "../../elements/special/Recruite";
import { INTERNSHIPS } from "../../util/defines/INTERNSHIPS";
import HeaderPageLoading from "../../elements/ui/loading/HeaderPageLoading";
import UserUpdateModal from "../../elements/ui/modals/UserUpdateModal";
import UserCard from "../../elements/ui/cards/UserCard";

const User = (props) => {
  const [currentUser, setCurrentUser] = useState();
  const [expand, setExpand] = useState(false);

  const { loading, sendRequest } = useHttpClient();

  const user = useSelector(selectUser);

  const location = useLocation();
  const navigate = useNavigate();

  const routePath = location.pathname + location.hash;
  const tab = window.location.hash.substring(1).split('?')[0];

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
        const responseData = await sendRequest(`user/${userId}`);
        setCurrentUser(responseData.user);
      } catch (err) {
      }
    };
    fetchCurrentUser();
  }, []);

  // fix optional url params someday ??!
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.href.split('?')[1]);
    const scrollQuery = searchParams.get('scroll');

    if (scrollRef.current && scrollQuery === 'news') {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentUser])

  let menuContent = null;

  switch (tab) {
    case 'news':
    case '':
      menuContent = <Fragment>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="mb--30 mb_sm--0">
                <h2 className="title">News</h2>
                <ul>
                  <li className="mt--40">
                    <p>Exhibitions of Bulgarian students in Groningen <Link to='/articles/acedemie-minerva'>
                      Check it out
                    </Link>
                    </p>
                  </li>

                  <li className="mt--40">
                    <Recruit />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
      break;
    case 'tickets':
      menuContent = <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="mb--30 mb_sm--0">
              <h2 className="title mb--40">Ticket Collection</h2>
              {currentUser.tickets.length > 0 ? (
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
    case 'internships':
      menuContent = <Fragment>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="mb--30 mb_sm--0">
                <h2 className="title">Internships</h2>
                <p>As a BGSNL member you get special access to our recommended positions. Although public, you get some special credit coming from the organization. Check the section frequently as we aim to add exclusive internships for our members only!</p>
                {INTERNSHIPS.map((i, index) => {
                  return <div key={index} className="row mt--20">
                    <div className="col-lg-6 col-12 reading">
                      <h3>Company: <span>{i.company}</span></h3>
                      <h3>Specialty: <span>{i.specialty}</span></h3>
                      <h3>Location: <span>{i.location}</span></h3>
                      <h3>Duration: <span>{i.duration}</span></h3>
                      {i.bonuses.length > 0 &&
                        <h3>Bonuses: {i.bonuses.map((b, index) => {
                          return <span key={index}> {b} |</span>
                        })}</h3>}
                      {i.requirements.length > 0 &&
                        <h3>Requirements: {i.requirements.map((r, index) => {
                          return <span key={index}> {r} |</span>
                        })}</h3>}
                      <h3>Description: <span>{i.description}</span></h3>
                    </div>
                    <div className="col-lg-6 col-12" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <img src={i.logo} style={{ maxWidth: '300px' }} alt='Company Logo'></img>
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
    return <HeaderPageLoading />
  }

  return <React.Fragment>
    <PageHelmet pageTitle="Profile" />
    <HeaderTwo
      headertransparent="header--transparent"
      colorblack="color--black"
      logoname="logo.png"
    />
    <UserUpdateModal currentUser={currentUser} />
    {/* <Christmas currentUser={currentUser} /> */}
    {currentUser.status !== "active" && (
      <Locked user={currentUser} case="locked" show={currentUser.status} toast={props.toast} />
    )}
    {/* <Christmas currentUser={currentUser} /> */}
    {/* Start Info Area */}
    <div className="service-area ptb--120 bg_color--1 mt--120">
      <div className="container">
        <div className="row service-one-wrapper">
          <div className="col-lg-6 col-md-12 col-12 ">
            {currentUser.subscription && <SubscriptionManage userId={currentUser.id} subscription={currentUser.subscription} toast={props.toast} />}
            <div className="service service__style--2">
              <LazyLoadImage src={currentUser.image} alt="profile" />
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
      <Link to='#news' className={`rn-button-style--2 ${['', 'news'].includes(tab) ? 'btn-solid' : 'rn-btn-reverse'}`}>News</Link>
      <Link to='#tickets' className={`rn-button-style--2 ${tab === 'tickets' ? 'btn-solid' : 'rn-btn-reverse'}`}>Tickets</Link>
      <Link to='#internships' className={`rn-button-style--2 ${tab === 'internships' ? 'btn-solid' : 'rn-btn-reverse'}`}>Internships</Link>
    </div>

    {menuContent !== null && menuContent}
    {/* End User Collection */}

    {/* Start Footer Style  */}
    <FooterTwo />
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
