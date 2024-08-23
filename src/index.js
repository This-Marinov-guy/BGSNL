// React and Redux Required
import React, { useEffect, lazy, Suspense, Fragment, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ReactGA from 'react-ga';
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { useSelector } from "react-redux";
import { login, logout, selectUser } from "./redux/user";
import { useDispatch } from "react-redux";
import { removeError, selectError, selectErrorMsg } from "./redux/error";
import { PrimeReactProvider } from 'primereact/api';
import { clarityTrack, isProd } from "./util/functions/helpers";
import PageLoading from "./elements/ui/loading/PageLoading";
import RegionLayout from "./layouts/common/RegionLayout";
import { Toast } from 'primereact/toast';
import { removeLogsOnProd } from "./util/functions/helpers";
import Toni from "./pages/information/articles/Toni";
import Minerva from "./pages/information/articles/Minerva";
import GlobalError from "./component/common/GlobalError";
import BirthdayModal from "./elements/ui/modals/BirthdayModal";

// Style
import './index.scss'
import "primereact/resources/themes/lara-light-cyan/theme.css";
import AuthLayout from "./layouts/authentication/AuthLayout";
import { removeInfoNotification, selectNotification, selectNotificationDetails } from "./redux/information";
import GuestLayout from "./layouts/authentication/GuestLayout";

// Pages  
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/information/About"));
const Contact = lazy(() => import("./pages/information/Contact"));
const Policy = lazy(() => import("./pages/information/Policy"));
const Error404 = lazy(() => import("./pages/Error404"));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const Board = lazy(() => import("./pages/information/Board"));
const Committees = lazy(() => import("./pages/information/Committees"));
const LogIn = lazy(() => import("./pages/authentication/LogIn"));
const SignUp = lazy(() => import("./pages/authentication/SignUp"));
const User = lazy(() => import("./pages/authentication/User"));
const Events = lazy(() => import("./pages/information/Events"));
const FutureEvents = lazy(() =>
  import("./pages/information/FutureEvents").then((module) => ({
    default: module.FutureEvents,
  }))
);
const PastEvents = lazy(() =>
  import("./pages/information/PastEvents").then((module) => ({
    default: module.PastEvents,
  }))
);
const NonSocietyEvent = lazy(() =>
  import("./pages/eventActions/NonSocietyEvent")
);
const EventDetails = lazy(() => import("./pages/eventActions/EventDetails"));
const EventReflection = lazy(() => import("./elements/EventReflection"));
const MemberPurchase = lazy(() =>
  import("./pages/eventActions/MemberPurchase")
);
const ContestRegister = lazy(() =>
  import("./pages/eventActions/ContestRegister")
);

const AddEvent = lazy(() =>
  import("./pages/userActions/AddEvent")
);
const EditEvent = lazy(() =>
  import("./pages/userActions/EditEvent")
);
const EventDashboard = lazy(() =>
  import("./pages/userActions/EventDashboard")
);

const GuestPurchase = lazy(() =>
  import("./pages/eventActions/GuestPurchase")
);
const Error = lazy(() => import("./elements/ui/errors/Error"));
const GuestCheck = lazy(() => import("./pages/redirects/GuestCheck"));
const Success = lazy(() => import("./pages/redirects/Success"));
const SuccessDonation = lazy(() => import("./pages/redirects/SuccessDonation"));
const Fail = lazy(() => import("./pages/redirects/Fail"));

const TicketComponent = lazy(() => import("./pages/private/TicketComponent"));

let gaInit = false;

const PageNavigationFunc = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const Root = () => {
  const toast = useRef(null);

  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const error = useSelector(selectError);
  const errorMessage = useSelector(selectErrorMsg);
  const informationNotification = useSelector(selectNotification);
  const informationNotificationDetails = useSelector(selectNotificationDetails);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [window.location.pathname]);

  //auto logout
  useEffect(() => {
    let logoutTimer;
    if (user.token && user.expirationDate) {
      let remainingTime =
        new Date(user.expirationDate).getTime() - new Date().getTime();
      logoutTimer = setTimeout(handler, remainingTime);
      function handler() {
        dispatch(logout());
      }
    } else {
      clearTimeout(logoutTimer);
    }
  }, [user.token, logout, user.expirationDate]);

  useEffect(() => {
    clarityTrack();

    if (!gaInit) {
      ReactGA.initialize(process.env.REACT_APP_GOOGLE_TAG);
    }

    ReactGA.pageview(window.location.pathname + window.location.search);
    let storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expirationDate) > new Date()
    ) {
      dispatch(
        login({
          token: storedData.token,
          expirationDate: new Date(
            new Date().getTime() + 36000000
          ).toISOString(),
        })
      );
    }
  }, []);

  useEffect(() => {
    // to show to toast on ref null
    setTimeout(() => {
      if (errorMessage) {
        toast.current.show({
          severity: 'error',
          summary: 'You got an error :(',
          detail: errorMessage,
          life: 80000,
          style: { background: '#ffcccb', color: '#8b0000' },
          contentStyle: { background: '#ffcccb', color: '#8b0000' }        
        });
      }

      if (informationNotification) {
        toast.current.show({ severity: informationNotificationDetails.severity, detail: informationNotificationDetails.detail, life: 8000 });
      }
    }, 50)

  }, [errorMessage, informationNotificationDetails.severity, informationNotificationDetails.detail])

  const handleHideToast = () => {
    if (errorMessage) {
      dispatch(removeError());
    }

    if (informationNotification) {
      dispatch(removeInfoNotification());
    }
  }

  if (process.env.REACT_APP_MAINTENANCE == true) {
    return <Maintenance />
  }

  else {
    return (
      <BrowserRouter basename={"/"}>
        <PageNavigationFunc />
        <Suspense fallback={<PageLoading />}>
          <GlobalError>
            <BirthdayModal />
            <Toast ref={toast} position="top-center" onHide={handleHideToast} />
            <Routes>
              {/* The '/' route can be found in the seperate Routeses in order to work the current functionality */}
              <Route exact path="/404" element={<Error404 />} />
              <Route exact path={`/about`} element={<About />} />
              <Route exact path={`/rules-and-regulations`} element={<Policy />} />
              <Route exact path={`/articles/toni-villa`} element={<Toni />} />
              <Route exact path={`/articles/acedemie-minerva`} element={<Minerva />} />
              {/* <Route exact path={`/active-member`} >
                <ActiveMember toast={toast} />
              </Route> */}
              {/* <Route exact path={`/contest/promo-video`} element={<Contest} /> */}
              {/* <Route exact path={`/contest/register`}>
              <ContestRegister toast={toast} />
              </Route> */}

              {/* <Route exact path={`/:region/board`} element={<RegionLayout><Board /></RegionLayout>} />
              <Route exact path={`/:region/committees`} element={<RegionLayout><Committees /></RegionLayout>} /> */}
              <Route exact path={`/:region/contact`} element={<RegionLayout><Contact /></RegionLayout>} />
              <Route exact path={`/:region/events`} element={<RegionLayout><Events /></RegionLayout>} />
              <Route exact path={`/:region/future-events`} element={<RegionLayout><FutureEvents /></RegionLayout>} />
              <Route exact path={`/:region/past-events`} element={<RegionLayout><PastEvents /></RegionLayout>} />
              <Route exact path={`/:region/event-details/:eventId`} element={<RegionLayout><EventDetails /></RegionLayout>} />
              <Route exact path={"/:region/other-event-details/:eventId"} element={<RegionLayout><NonSocietyEvent toast={toast} /></RegionLayout>}>

              </Route>
              <Route
                path={`/:region/event-reflection/:eventId`}
                element={<RegionLayout><EventReflection /></RegionLayout>}
              />


              {/* Redirect pages */}

              {!isProd() && <Route exact path={`/ticket`} element={<TicketComponent />} />}

              <Route exact path={`/success`} element={<Success />} />
              <Route exact path={`/donation/success`} element={<SuccessDonation />} />
              <Route exact path={`/fail`} element={<Fail />} />

              {/* TICKET PURCHASE */}
              <Route exact path={"/:region/purchase-ticket/:eventId"}
                element={
                  <RegionLayout>
                    {user && !!user.token ? <MemberPurchase /> : <GuestPurchase />}
                  </RegionLayout>
                }
              />

              {/* Auth pages */}
              <Fragment>
                <Route exact path={`/user`}
                  element={
                    <AuthLayout>
                      <User toast={toast} />
                    </AuthLayout>
                  }
                />
                <Route exact path={`/user/add-event`}
                  element={
                    <AuthLayout>
                      <AddEvent toast={toast} />
                    </AuthLayout>
                  }
                />
                <Route exact path={`/user/edit-event/:eventId`}
                  element={
                    <AuthLayout>
                      <EditEvent toast={toast} />
                    </AuthLayout>
                  }
                />
                <Route exact path={`/user/dashboard`}
                  element={
                    <AuthLayout>
                      <EventDashboard toast={toast} />
                    </AuthLayout>
                  }
                />
                <Route exact path={`/check-guest-list/:data`}
                  element={
                    <AuthLayout>
                      <GuestCheck />
                    </AuthLayout>
                  }
                />
              </Fragment>

              {/* Un-auth pages */}
              <Fragment>
                <Route exact path={`/login`}
                  element={
                    <GuestLayout>
                      <LogIn toast={toast} />
                    </GuestLayout>
                  }
                />
                <Route exact path={`/:region?/signup`}
                  element={
                    <GuestLayout>
                      <SignUp toast={toast} />
                    </GuestLayout>
                  }
                />
                {/* NOTE: purchase ticket is moved to a dynamic check in the auth routes */}
              </Fragment>

              <Route exact path="/:region?" element={<Home />} />
              <Route path="*" element={<Error404 />} />
            </Routes>
          </GlobalError>
        </Suspense>
      </BrowserRouter>
    );
  };
}

removeLogsOnProd();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <PrimeReactProvider>
      <Root />
    </PrimeReactProvider>
  </Provider>
);


