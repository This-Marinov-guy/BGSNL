// React and Redux Required
import React, { useEffect, useState, lazy, Suspense, Fragment } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./redux/store";
import { PrimeReactProvider } from "primereact/api";
import { isProd } from "./util/functions/helpers";
import PageLoading from "./elements/ui/loading/PageLoading";
import RegionLayout from "./layouts/common/RegionLayout";
import { removeLogsOnProd } from "./util/functions/helpers";
import AuthLayout from "./layouts/authentication/AuthLayout";
import { removeModal, showModal } from "./redux/modal";
import {
  ACCESS_1,
  ACCESS_2,
  ACCESS_3,
  ACCESS_4,
  INACTIVITY_MODAL,
  JWT_RESET_TIMER,
  LOCAL_STORAGE_SESSION_LIFE,
  LOCAL_STORAGE_USER_DATA,
  SESSION_TIMEOUT,
  WARNING_THRESHOLD,
} from "./util/defines/common";
import InactivityModal from "./elements/ui/modals/InactivityModal";
import { calculateTimeRemaining } from "./util/functions/date";
import { login, logout, selectUser } from "./redux/user";
import { isTokenExpired } from "./util/functions/authorization";
import { useHttpClient } from "./hooks/common/http-hook";
import { isObjectEmpty } from "./util/functions/helpers";
import { startPageLoading, stopPageLoading } from "./redux/loading";

// Style
import "./index.scss";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import MainLayout from "./layouts/MainLayout";
import GlobalError from "./component/common/GlobalError";
import { useJWTRefresh } from "./hooks/common/api-hooks";
import { useAppInitialization } from "./hooks/session/app-init";
import { useAuthSession } from "./hooks/session/auth-session";

// Pages
const Home = lazy(() => import("./pages/Home"));
const Toni = lazy(() => import("./pages/information/articles/Toni"));
const Minerva = lazy(() => import("./pages/information/articles/Minerva"));
const Article = lazy(() => import("./pages/information/articles/Article"));
const StudentMigration = lazy(() =>
  import("./pages/information/articles/StudentMigration")
);
const About = lazy(() => import("./pages/information/About"));
const Developers = lazy(() => import("./pages/information/Developers"));
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

const AddEvent = lazy(() => import("./pages/userActions/AddEvent"));
const EditEvent = lazy(() => import("./pages/userActions/EditEvent"));
const EventDashboard = lazy(() => import("./pages/userActions/EventDashboard"));

const GuestPurchase = lazy(() => import("./pages/eventActions/GuestPurchase"));
const GuestCheck = lazy(() => import("./pages/redirects/CheckTicket"));
const Success = lazy(() => import("./pages/redirects/Success"));
const SuccessDonation = lazy(() => import("./pages/redirects/SuccessDonation"));
const Fail = lazy(() => import("./pages/redirects/Fail"));

const TicketComponent = lazy(() => import("./pages/private/TicketComponent"));

const PageNavigationFunc = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const Root = () => {
  // DO not change order!
  const { isLoading } = useAppInitialization();
  const { timeRemaining } = useAuthSession();

  const user = useSelector(selectUser);

  if (process.env.REACT_APP_MAINTENANCE == true) {
    return <Maintenance />;
  }

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <BrowserRouter basename={"/"}>
      <PageNavigationFunc />
      <InactivityModal timeRemaining={timeRemaining} />
      <GlobalError>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            {/* The '/' route can be found in the seperate Routeses in order to work the current functionality */}
            <Route exact path="/404" element={<Error404 />} />
            <Route exact path={`/about`} element={<About />} />
            <Route exact path={`/developers`} element={<Developers />} />
            <Route exact path={`/rules-and-regulations`} element={<Policy />} />
            <Route exact path={`/articles/toni-villa`} element={<Toni />} />
            <Route
              exact
              path={`/articles/from-bulgaria-to-the-netherlands`}
              element={<StudentMigration />}
            />
            <Route
              exact
              path={`/articles/acedemie-minerva`}
              element={<Minerva />}
            />
            <Route
              exact
              path={`/articles/:articleId/:articleTitle`}
              element={<Article />}
            />
            {/* <Route exact path={`/active-member`} >
                <ActiveMember />
              </Route> */}
            {/* <Route exact path={`/contest/promo-video`} element={<Contest} /> */}
            {/* <Route exact path={`/contest/register`}>
              <ContestRegister />
              </Route> */}

            {/* <Route exact path={`/:region/board`} element={<RegionLayout><Board /></RegionLayout>} />
              <Route exact path={`/:region/committees`} element={<RegionLayout><Committees /></RegionLayout>} /> */}
            <Route
              exact
              path={`/:region/contact`}
              element={
                <RegionLayout>
                  <Contact />
                </RegionLayout>
              }
            />
            <Route
              exact
              path={`/:region/events`}
              element={
                <RegionLayout>
                  <Events />
                </RegionLayout>
              }
            />
            <Route
              exact
              path={`/:region/future-events`}
              element={
                <RegionLayout>
                  <FutureEvents />
                </RegionLayout>
              }
            />
            <Route
              exact
              path={`/:region/past-events`}
              element={
                <RegionLayout>
                  <PastEvents />
                </RegionLayout>
              }
            />
            <Route
              exact
              path={`/:region/event-details/:eventId`}
              element={
                <RegionLayout>
                  <EventDetails />
                </RegionLayout>
              }
            />
            <Route
              exact
              path={"/:region/other-event-details/:eventId"}
              element={
                <RegionLayout>
                  <NonSocietyEvent />
                </RegionLayout>
              }
            ></Route>
            <Route
              path={`/:region/event-reflection/:eventId`}
              element={
                <RegionLayout>
                  <EventReflection />
                </RegionLayout>
              }
            />

            {/* Redirect pages */}

            {!isProd() && (
              <Route exact path={`/test`} element={<TicketComponent />} />
            )}

            <Route exact path={`/success`} element={<Success />} />
            <Route
              exact
              path={`/donation/success`}
              element={<SuccessDonation />}
            />
            <Route exact path={`/fail`} element={<Fail />} />

            {/* TICKET PURCHASE */}
            <Route
              exact
              path={"/:region/purchase-ticket/:eventId"}
              element={
                <RegionLayout>
                  {user && !!user.token ? (
                    <MemberPurchase />
                  ) : (
                    <GuestPurchase />
                  )}
                </RegionLayout>
              }
            />

            {/* Auth pages */}
            <Fragment>
              <Route
                exact
                path={`/user`}
                element={
                  <AuthLayout>
                    <User />
                  </AuthLayout>
                }
              />
              <Route
                exact
                path={`/user/add-event`}
                element={
                  <AuthLayout access={ACCESS_3}>
                    <AddEvent />
                  </AuthLayout>
                }
              />
              <Route
                exact
                path={`/user/edit-event/:eventId`}
                element={
                  <AuthLayout access={ACCESS_3}>
                    <EditEvent />
                  </AuthLayout>
                }
              />
              <Route
                exact
                path={`/user/dashboard`}
                element={
                  <AuthLayout access={ACCESS_3}>
                    <EventDashboard />
                  </AuthLayout>
                }
              />
              <Route
                exact
                path={`/user/check-guest-list`}
                element={
                  <AuthLayout access={ACCESS_4}>
                    <GuestCheck />
                  </AuthLayout>
                }
              />
            </Fragment>

            {/* Un-auth pages */}
            {!user?.token && (
              <Fragment>
                <Route exact path={`/login`} element={<LogIn />} />
                <Route exact path={`/:region?/signup`} element={<SignUp />} />
                {/* NOTE: purchase ticket is moved to a dynamic check in the auth routes */}
              </Fragment>
            )}

            <Route exact path="/:region?" element={<Home />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </Suspense>
      </GlobalError>
    </BrowserRouter>
  );
};

removeLogsOnProd();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <PrimeReactProvider>
      <MainLayout>
        <Root />
      </MainLayout>
    </PrimeReactProvider>
  </Provider>
);
