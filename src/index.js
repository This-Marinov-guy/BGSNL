// React and Redux Required
import React, { useEffect, lazy, Suspense, Fragment, useRef } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { useSelector } from "react-redux";
import { login, logout, selectUser } from "./redux/user";
import { useDispatch } from "react-redux";
import { selectError, selectErrorMsg } from "./redux/error";
import { PrimeReactProvider } from 'primereact/api';

// Style
import './index.scss'
import "primereact/resources/themes/lara-light-cyan/theme.css";

// Blocks Layout
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PageLoading from "./elements/ui/PageLoading";
import Articles from "./pages/information/Articles";
import RegionLayout from "./component/functional/RegionLayout";
import { Toast } from 'primereact/toast';

// Pages
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/information/About"));
const Contact = lazy(() => import("./pages/information/Contact"));
const Policy = lazy(() => import("./pages/information/Policy"));
const Error404 = lazy(() => import("./pages/Error404"));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const Board = lazy(() => import("./pages/information/Board"));
const Contest = lazy(() => import("./pages/information/Contest"));
const Gala = lazy(() => import("./pages/information/Gala"));
const Committees = lazy(() => import("./pages/information/Committees"));
const LogIn = lazy(() => import("./pages/authentication/LogIn"));
const SignUp = lazy(() => import("./pages/authentication/SignUp"));
const ActiveMember = lazy(() => import("./pages/authentication/ActiveMember"));
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
const ListEvents = lazy(() =>
  import("./pages/userActions/ListEvents")
);

const NonMemberPurchase = lazy(() =>
  import("./pages/eventActions/NonMemberPurchase")
);
const Error = lazy(() => import("./elements/ui/Error"));
const Success = lazy(() => import("./pages/redirects/Success"));
const SuccessDonation = lazy(() => import("./pages/redirects/SuccessDonation"));
const Fail = lazy(() => import("./pages/redirects/Fail"));

const Root = () => {
  const maintenanceBreak = false;

  const toast = useRef(null)

  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const error = useSelector(selectError);
  const errorMessage = useSelector(selectErrorMsg);

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
    let storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expirationDate) > new Date()
    ) {
      dispatch(
        login({
          userId: storedData.userId,
          token: storedData.token,
          expirationDate: new Date(
            new Date().getTime() + 36000000
          ).toISOString(),
        })
      );
    }
  }, [dispatch]);

  useEffect(() => {
    if (errorMessage) {
      toast.current.show({ severity: 'error', summary: 'You got an error :(', detail: errorMessage, life: 8000 });
    }
  }, [error])

  if (maintenanceBreak) {
    return <Maintenance />
  }
  else {
    return (
      <BrowserRouter basename={"/"}>
        <Suspense fallback={<PageLoading />}>
          <Toast ref={toast} />
          <Routes>
            {/* The '/' route can be found in the seperate Routeses in order to work the current functionality */}
            <Route exact path="/404" element={<Error404 />} />
            <Route exact path={`/about`} element={<About />} />
            <Route exact path={`/rules-and-regulations`} element={<Policy />} />
            <Route exact path={`/articles`} element={<Articles />} />
            <Route exact path={`/gala`} element={<Gala />} />
            {/* <Route exact path={`/active-member`} >
                <ActiveMember toast={toast} />
              </Route> */}
            {/* <Route exact path={`/contest/promo-video`} element={<Contest} /> */}
            {/* <Route exact path={`/contest/register`}>
              <ContestRegister toast={toast} />
            </Route> */}

            <Route exact path={`/:region/board`} element={<RegionLayout><Board /></RegionLayout>} />
            <Route exact path={`/:region/contact`} element={<RegionLayout><Contact /></RegionLayout>} />
            <Route exact path={`/:region/committees`} element={<RegionLayout><Committees /></RegionLayout>} />
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

            <Route exact path={`/success`} element={<Success />} />
            <Route exact path={`/donation/success`} element={<SuccessDonation />} />
            <Route exact path={`/fail`} element={<Fail />} />

            {/* Auth pages */}
            {(user && user.token) ? (
              <Fragment>
                <Route exact path={`/user`} element={<User toast={toast} />} />
                <Route
                  exact
                  path={"/:region/purchase-ticket/:eventId"}
                  element={<RegionLayout><MemberPurchase /></RegionLayout>}
                />
                <Route exact path={`/user/add-event`} element={<AddEvent toast={toast} />} />
                <Route exact path={`/user/edit-event/:eventId`} element={<EditEvent toast={toast} />} />
                <Route exact path={`/user/all-events`} element={<ListEvents toast={toast} />} />
              </Fragment>
            ) : (
              <Fragment>
                <Route exact path={`/user/add-event`} element={<AddEvent toast={toast} />} />

                <Route exact path={`/login`} element={<LogIn toast={toast} />} />
                <Route exact path={`/:region?/signup`} element={<SignUp toast={toast} />} />
                <Route
                  exact
                  path={"/:region/purchase-ticket/:eventId"}
                  element={<RegionLayout><NonMemberPurchase /></RegionLayout>}
                />

              </Fragment>
            )}
            <Route exact path="/:region?" element={<Home />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    );
  };
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <PrimeReactProvider>
      <Root />
    </PrimeReactProvider>
  </Provider>
);


