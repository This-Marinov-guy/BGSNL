"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Password } from "@/compat/primereact";
import {
  Link,
  useNavigate,
} from "@/util/navigation";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import Loader from "../../elements/ui/loading/Loader";
import { useHttpClient } from "../../hooks/common/http-hook";
import { showModal } from "../../redux/modal";
import {
  removeNotification,
  showNotification,
} from "../../redux/notification";
import { login, selectIsAuth } from "../../redux/user";
import {
  BIRTHDAY_MODAL,
  GENERAL_ERROR,
} from "../../util/defines/common";
import ForgottenPassword from "./ForgottenPassword";
import GoogleLogin from "@/elements/authentication/GoogleLogin";

const Login = () => {
  const isAuthenticated = useSelector(selectIsAuth);
  const loginDestination = useRef(null);

  const [loginFormValues, setLoginFormValues] = useState({
    email: "",
    password: "",
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  useEffect(() => {
    setIsFormReady(true);
  }, []);

  const { sendRequest } = useHttpClient();

  const [loading, setLoading] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(loginDestination.current || "/user#profile", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const changeFormInputHandler = (event) => {
    setLoginFormValues((prevState) => {
      return { ...prevState, [event.target.name]: event.target.value };
    });
  };

  const finishLogin = (responseData) => {
    if (!responseData?.token) {
      dispatch(showNotification(GENERAL_ERROR));
      return;
    }
    const previous = sessionStorage.getItem("prevUrl");
    let destination = "/user#profile";
    if (previous?.startsWith("/") && !previous.startsWith("//") && !previous.includes("\\")) destination = previous;
    if (responseData.billingLocked || responseData.status === "locked" || responseData.billingVerificationUnavailable) destination = "/user#settings";
    loginDestination.current = destination;
    sessionStorage.removeItem("prevUrl");
    dispatch(removeNotification());
    dispatch(login(responseData));
    dispatch(showNotification({ severity: "success", detail: "Welcome back" }));
    if (responseData.celebrate) dispatch(showModal(BIRTHDAY_MODAL));
  };

  const loginHandler = async (event) => {
    event.preventDefault();
    if (loading || googlePending) return;
    setLoading(true);
    try {
      const responseData = await sendRequest("security/login", "POST", {
        email: loginFormValues.email,
        password: loginFormValues.password,
      });
      if (responseData) finishLogin(responseData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Login" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <ForgottenPassword
        visible={isVisible}
        onHide={() => setIsVisible(false)}
      />
      <main className="login_screen">
        <section className="login_card" aria-labelledby="login-title">
          <article className="login_card_visual">
            <img
              src="/assets/images/bg/login-community.jpg"
              alt="BGSNL guests enjoying a Bulgarian folk performance"
            />
            <div className="login_card_story">
              <h2>Closer to home, together.</h2>
              <p>
                Access your events, memberships and community profile in one
                place.
              </p>
            </div>
          </article>

          <div className="login_card_content">
            <div className="login_card_content_inner">
              <h1 id="login-title">Welcome back</h1>

              {isFormReady ? (
                <form
                  className="login_form"
                  onSubmit={(event) => loginHandler(event)}
                >
                  <div className="rn-form-group">
                    <label htmlFor="login-email">Email</label>
                    <input
                      id="login-email"
                      className="bgsnl-form-control"
                      type="email"
                      name="email"
                      value={loginFormValues.email}
                      autoComplete="email"
                      required
                      onChange={(event) => changeFormInputHandler(event)}
                    />
                  </div>
                  <div className="rn-form-group">
                    <label htmlFor="login-password">Password</label>
                    <Password
                      id="login-password"
                      inputClassName="bgsnl-form-control"
                      name="password"
                      value={loginFormValues.password}
                      autoComplete="current-password"
                      required
                      onChange={(event) => changeFormInputHandler(event)}
                      toggleMask
                      feedback={false}
                      unstyled
                    />
                  </div>
                  <button
                    disabled={loading || googlePending}
                    type="submit"
                    className="login_submit"
                  >
                    {loading ? <Loader /> : <span>Log in</span>}
                  </button>
                </form>
              ) : null}


              <GoogleLogin onLogin={finishLogin} disabled={loading} onPendingChange={setGooglePending} />

              <div className="login_actions">
                <button
                  type="button"
                  className="login_text_link"
                  onClick={() => {
                    setIsVisible(true);
                  }}
                >
                  Forgot your password?
                </button>
                <Link className="login_join_banner" to="/join-the-society">
                  No account? Let&apos;s sign you up.
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </React.Fragment>
  );
};

export default Login;
