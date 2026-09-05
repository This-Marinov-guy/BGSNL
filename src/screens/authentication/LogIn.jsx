"use client";

import React, { useEffect, useState } from "react";
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

const Login = () => {
  const isAuthenticated = useSelector(selectIsAuth);

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

  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/user#profile", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const changeFormInputHandler = (event) => {
    setLoginFormValues((prevState) => {
      return { ...prevState, [event.target.name]: event.target.value };
    });
  };

  const loginHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const responseData = await sendRequest(`security/login`, "POST", {
        email: loginFormValues.email,
        password: loginFormValues.password,
      });

      if (!Object.hasOwn(responseData, "token")) {
        return dispatch(showNotification(GENERAL_ERROR));
      }

      dispatch(removeNotification());
      dispatch(login(responseData));
      dispatch(
        showNotification({
          severity: "success",
          summary: "Welcome Back",
          detail:
            "Hop in the User section to see your tickets, news and your information",
        })
      );

      // internship advertising
      // dispatch(
      //   showNotification({
      //     ...INFO_STYLE,
      //     position: "bottom-center",
      //     content: () => (
      //       <>
      //         <p>
      //           Fancy an entry-level job or an internship?
      //           <Button
      //             size="small"
      //             label="Check out our suggestion!"
      //             link
      //             onClick={() => {
      //               dispatch(removeNotification());
      //               navigate("/user#internships");
      //             }}
      //           />
      //         </p>
      //       </>
      //     ),
      //   })
      // );

      if (responseData.celebrate) {
        dispatch(showModal(BIRTHDAY_MODAL));
      }

      navigate(sessionStorage.getItem("prevUrl") ?? `/${responseData.region}`);
      sessionStorage.removeItem("prevUrl");
    } catch {
      // useHttpClient reports request failures through the global notification UI.
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
                    disabled={loading}
                    type="submit"
                    className="login_submit"
                  >
                    {loading ? <Loader /> : <span>Log in</span>}
                  </button>
                </form>
              ) : null}

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
