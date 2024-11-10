import React, { useState } from "react";
import { useHttpClient } from "../../hooks/common/http-hook";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../redux/user";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import { Password } from "primereact/password";
import Loader from "../../elements/ui/loading/Loader";
import { showModal } from "../../redux/modal";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import {
  BIRTHDAY_MODAL,
  GENERAL_ERROR,
  INFO_STYLE,
} from "../../util/defines/common";
import { removeNotification, showNotification } from "../../redux/notification";
import ForgottenPassword from "./ForgottenPassword";

const Login = () => {
  const [loginFormValues, setLoginFormValues] = useState({
    email: "",
    password: "",
  });

  const [isVisible, setIsVisible] = useState(false);

  const { loading, sendRequest } = useHttpClient();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const changeFormInputHandler = (event) => {
    setLoginFormValues((prevState) => {
      return { ...prevState, [event.target.name]: event.target.value };
    });
  };

  const loginHandler = async (event) => {
    event.preventDefault();
    try {
      const responseData = await sendRequest(`security/login`, "POST", {
        email: loginFormValues.email,
        password: loginFormValues.password,
      });

      if (!responseData.hasOwnProperty("token")) {
        return dispatch(showNotification(GENERAL_ERROR));
      }

      dispatch(login(responseData));
      dispatch(
        showNotification({
          severity: "success",
          summary: "Welcome Back",
          detail:
            "Hop in the User section to see your tickets, news and your information",
        })
      );

      dispatch(
        showNotification({
          ...INFO_STYLE,
          position: "bottom-center",
          content: () => (
            <>
              <p>
                Fancy an entry-level job or an internships?{" "}
                <Button
                  size="small"
                  label="Check out our suggestion!"
                  link
                  onClick={() => {
                    navigate("/user#internships");
                    dispatch(removeNotification());
                  }}
                />
              </p>
            </>
          ),
        })
      );

      if (responseData.celebrate) {
        dispatch(showModal(BIRTHDAY_MODAL));
      }

      navigate(sessionStorage.getItem("prevUrl") ?? `/${responseData.region}`);
      sessionStorage.removeItem("prevUrl");
    } catch (err) {}
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
      <div
        className="container team_member_border-3"
        style={{ maxWidth: "600px", marginTop: "25vh" }}
      >
        <h3 style={{ fontSize: "0.8em" }} className="center_text">
          Log in your account
        </h3>
        <form
          className="center_section"
          onSubmit={(event) => loginHandler(event)}
        >
          <div className="col-lg-8 col-md-8 col-sm-11">
            <div className="rn-form-group">
              <input
                type="text"
                name="email"
                placeholder="Email"
                onChange={(event) => changeFormInputHandler(event)}
              />
            </div>
          </div>
          <div className="col-lg-8 col-md-8 col-sm-11">
            <div className="rn-form-group">
              <Password
                name="password"
                placeholder="Password"
                onChange={(event) => changeFormInputHandler(event)}
                toggleMask
                feedback={false}
                unstyled
              />
            </div>
          </div>
          <button
            disabled={
              loading && !loginFormValues.email && !loginFormValues.password
            }
            type="submit"
            className="rn-button-style--2 rn-btn-reverse-green mt--40"
          >
            {loading ? <Loader /> : <span>Log In</span>}
          </button>
        </form>
        <div className="action_btns">
          <button
            style={{ border: "none" }}
            className="rn-button-style--1"
            onClick={() => {
              setIsVisible(true);
            }}
          >
            Forgot my password
          </button>
          <Link
            style={{ fontSize: "0.9em" }}
            className="rn-button-style--1 center_text"
            to="/signup"
          >
            Not a member? Register now!
          </Link>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Login;
