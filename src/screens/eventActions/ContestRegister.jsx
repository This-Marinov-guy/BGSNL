"use client";

import React from "react";
import {
  ErrorMessage,
  Field,
  Form,
} from "formik";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import {
  Link,
  useNavigate,
} from "@/util/navigation";
import PageHelmet from "../../component/common/Helmet";
import Footer from "../../component/footer/Footer";
import Header from "../../component/header/Header";
import Breadcrumb from "../../elements/common/Breadcrumb";
import ValidatedFormik from "../../elements/ui/forms/ValidatedFormik";
import Loader from "../../elements/ui/loading/Loader";
import { useHttpClient } from "../../hooks/common/http-hook";
import { showNotification } from "../../redux/notification";

const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    surname: yup.string().required("Surname is required"),
    email: yup.string().email("Please enter a valid email").required(),
    comments: yup.string(),
    policyTerms: yup
        .bool()
        .oneOf([true], "Terms must be accepted")
        .required(),
});

const ContestRegister = () => {
    const { loading, sendRequest } = useHttpClient();

    const navigate = useNavigate();

    const dispatch = useDispatch();

    return (
        <React.Fragment>
            <PageHelmet pageTitle="Event Details" />

            <Header
                headertransparent="header--transparent"
                colorblack="color--black"
                logoname="logo.png"
            />

            <Breadcrumb
              title="Video Creation Contest"
              description="Create a short promotional video for the society and enter the contest."
            />

            {/* Start Portfolio Details */}
            <div className="rn-portfolio-details ptb--120 bg_color--1">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="portfolio-details">
                                <div className="inner">
                                    <h2>About</h2>
                                    <p>Do you love editing videos, making reels or spending time on social media? Create a short dynamic  promo video (0:20 - 0:40 min long) in a reel format (16:9) using the materials provided and enter for a chance to win 50€!
                                    </p>
                                    <p>After signing up you will receive a folder with photos and videos from previous events as well as some statistics. You can select which of these to use to best represent BGSG.
                                    </p>

                                    <p>You can submit a maximum of 2 short videos via email using Google Drive or WeTransfer. Read carefully the Terms & Conditions for more information.
                                    </p><br />
                                    <p>Deadline: 5th September, 23:59
                                    </p>
                                    <p>Announcing the winner: 20th September, 13:00
                                    </p>
                                    <span className="m--a"><Link to='/contest/promo-video'>Terms and Conditions</Link></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="blog-comment-form pb--120 bg_color--1">
                <div className="container">
                    <ValidatedFormik
                        className="inner"
                        validationSchema={schema}
                        onSubmit={async (values) => {
                            try {
                                const responseData = await sendRequest(
                                    "contest/register",
                                    "POST",
                                    {
                                        contestName: 'video-creation',
                                        name: values.name,
                                        surname: values.surname,
                                        email: values.email,
                                        comments: values.comments,
                                        policyTerms: values.policyTerms,
                                    }
                                );
                                if (responseData?.message !== "Success") return;

                                dispatch(showNotification({ severity: 'success', summary: 'Success', detail: 'You successfully changed your password' }));
                                navigate("/");
                                return;
                            } catch (err) {
                                // The shared request hook reports submission failures.
                            }
                        }}
                        initialValues={{
                            name: '',
                            surname: '',
                            email: '',
                            comments: '',
                            policyTerms: false,
                        }}
                    >
                        {() => (
                            <Form
                                id="form"
                                style={{ padding: "2%" }}
                            >
                                <h3>Register</h3>
                                <div className="row">
                                    <div className="col-lg-6 col-md-12 col-12">
                                        <div className="rn-form-group">
                                            <Field
                                                type="text"
                                                placeholder="Name"
                                                name="name"
                                            ></Field>
                                            <ErrorMessage
                                                className="error"
                                                name="name"
                                                component="div"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-12 col-12">
                                        <div className="rn-form-group">
                                            <Field
                                                type="text"
                                                placeholder="Surname"
                                                name="surname"
                                            ></Field>
                                            <ErrorMessage
                                                className="error"
                                                name="surname"
                                                component="div"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-6 col-md-12 col-12">
                                        <div className="rn-form-group">
                                            <Field
                                                type="email"
                                                placeholder="Email"
                                                name="email"
                                            ></Field>
                                            <ErrorMessage
                                                className="error"
                                                name="email"
                                                component="div"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row mt--40">
                                    <div className="col-lg-12 col-md-12 col-12">
                                        <div className="rn-form-group">
                                            <Field
                                                style={{ padding: '1% 0 0 3%' }}
                                                as='textarea'
                                                placeholder="Comments/questions"
                                                name="comments"
                                            ></Field>
                                            <ErrorMessage
                                                className="error"
                                                name="comments"
                                                component="div"
                                            />
                                        </div>
                                    </div>

                                </div>

                                <div className="row">
                                    <div className="col-lg-6 col-md-6 col-12">
                                        <div className="hor_section_nospace mt--40">
                                            <Field
                                                style={{ maxWidth: "30px", margin: "10px" }}
                                                type="checkbox"
                                                name="policyTerms"
                                            ></Field>
                                            <p className="information">
                                                I have read and accept the&nbsp;
                                                <a
                                                    style={{ color: "#017363" }}
                                                    href="/contest/promo-video"
                                                    target="_blank"
                                                >
                                                    Terms & Conditions


                                                </a>
                                            </p>
                                        </div>
                                        <ErrorMessage
                                            className="error"
                                            name="policyTerms"
                                            component="div"
                                        />

                                    </div>
                                </div>
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="rn-button-style--2 rn-btn-reverse-green mt--80"
                                >
                                    {loading ? <Loader /> : <span>Finish Registration</span>}
                                </button>

                            </Form>
                        )}
                    </ValidatedFormik>
                </div>
            </div>
            {/* End Form Area */}
            {/* End Portfolio Details */}

            {/* Start Back To Top */}
            <div className="backto-top">
                <ScrollToTop showUnder={160}>
                    <FiChevronUp size={26} />
                </ScrollToTop>
            </div>
            {/* End Back To Top */}

            <Footer />
        </React.Fragment >
    );
};
export default ContestRegister;
