import React, { Fragment, useEffect, useState } from "react";
import capitalizeFirstLetter from "../../util/capitalize";
import * as yup from "yup";
import moment from 'moment'
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Calendar } from 'primereact/calendar';
import { FiCheck } from "react-icons/fi";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import { useHttpClient } from "../../hooks/http-hook";
import Loader from "../../elements/ui/Loader";
import ImageInput from "../../elements/ui/ImageInput";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../redux/user";
import { Link, useParams } from "react-router-dom";
import RegionOptions from "../../elements/ui/RegionOptions";
import { REGIONS_MEMBERSHIP_SPECIFICS } from "../../util/REGIONS_AUTH_CONFIG";
import { REGIONS } from "../../util/REGIONS_DESIGN";

const EventForm = () => {
    const { sendRequest, loading } = useHttpClient()

    const schema = {}

    return (
        <Formik
            className="container"
            validationSchema={null}
            onSubmit={async (values) => {
                const formData = new FormData();
            }}
            initialValues={{
                is_tickets_closed: false,
                membersOnly: false,
                visible: true,
                marketingInputs: false,
                extraInputs: false,
                freePass: [],
                discountPass: [],
                subEvent: {
                    description: '',
                    links: []
                },
                region: '',
                title: '',
                description: '',
                bgImage: '',
                date: '',
                time: '',
                ticketTimer: '',
                ticketLimit: 0,
                where: '',
                entry: null,
                memberEntry: null,
                including: [],
                ticket_link: '',
                price_id: '',
                memberPrice_id: '',
                activeMemberPrice_id: "",
                text: [],
                title: '',
                ticket_img: '',
                images: [],
                thumbnail: '',
            }}
        >
            {({ values, setFieldValue, errors, isValid, dirty }) => (
                <Form
                    encType="multipart/form-data"
                    id="form"
                    style={{ padding: "2%" }}
                >
                    <div className="row mb--40 mt--40">
                        <div className="col-lg-12 col-md-6 col-12">
                            <h3 className="center_text label">Profile picture</h3>
                            <ImageInput
                                onChange={(event) => {
                                    setFieldValue("image", event.target.files[0]);
                                }}
                            />
                            <p className="mt--10 information center_text">
                                *optional - we will assign you a cool avatar
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="rn-form-group">
                                <Field as="select" name="region">
                                    <option value="" disabled>
                                        Select Region
                                    </option>
                                    {REGIONS.map((val) => {
                                        return <option value={val}>{capitalizeFirstLetter(val)}</option>
                                    })}

                                </Field>
                                <ErrorMessage
                                    className="error"
                                    name="region"
                                    component="div"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="rn-form-group">
                                <Field
                                    type="text"
                                    placeholder="Event Name"
                                    name="title"
                                ></Field>
                                <ErrorMessage
                                    className="error"
                                    name="title"
                                    component="div"
                                />
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="rn-form-group">
                                <Field
                                    type="text"
                                    placeholder="Small Description"
                                    name="description"
                                ></Field>
                                <ErrorMessage
                                    className="error"
                                    name="description"
                                    component="div"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="row mt--40">
                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="rn-form-group">
                                <Calendar id="date" name="date"
                                    value={values.date}
                                    onChange={(event) => values.date = event.target.value}
                                    dateFormat="dd/mm/yy"
                                    mask="99/99/9999"
                                    style={{ width: '100%' }}
                                    showIcon />
                                <p className="information">
                                    *Event must be uploaded at least the day after
                                </p>
                                <ErrorMessage
                                    className="error"
                                    name="date"
                                    component="div"
                                />
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="rn-form-group">
                                <Field
                                    type="time"
                                    name="time"
                                />
                                <ErrorMessage
                                    className="error"
                                    name="time"
                                    component="div"
                                />
                            </div>
                        </div>
                        {values.university !== "working" && (
                            <Fragment>
                                <div className="col-lg-6 col-md-12 col-12">
                                    <Field
                                        type="number"
                                        min="2020"
                                        max="2050"
                                        placeholder="Graduation Year"
                                        name="graduationDate"
                                    ></Field>
                                    <ErrorMessage
                                        className="error"
                                        name="graduationDate"
                                        component="div"
                                    />
                                </div>
                                <div className="col-lg-6 col-md-12 col-12">
                                    <div className="rn-form-group">
                                        <Field
                                            type="text"
                                            placeholder="Study Program"
                                            name="course"
                                        ></Field>
                                        <ErrorMessage
                                            className="error"
                                            name="course"
                                            component="div"
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-12 col-12">
                                    <div className="rn-form-group">
                                        <Field
                                            type="text"
                                            placeholder="Student Number"
                                            name="studentNumber"
                                        ></Field>
                                        <ErrorMessage
                                            className="error"
                                            name="studentNumber"
                                            component="div"
                                        />
                                    </div>
                                </div>
                            </Fragment>
                        )}
                    </div>
                    <h3 className="mt--30 label">Login details</h3>
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="rn-form-group">
                                <Field type="email" placeholder="Email" name="email" />
                                <ErrorMessage
                                    className="error"
                                    name="email"
                                    component="div"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="rn-form-group">
                                <Field
                                    autoComplete="off"
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                ></Field>
                                <ErrorMessage
                                    className="error"
                                    name="password"
                                    component="div"
                                />
                            </div>
                        </div>

                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="rn-form-group">
                                <Field
                                    autoComplete="off"
                                    type="password"
                                    placeholder="Confirm Password"
                                    name="confirmPassword"
                                ></Field>
                                <ErrorMessage
                                    className="error"
                                    name="confirmPassword"
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
                                        href="/rules-and-regulations"
                                        target="_blank"
                                    >
                                        society's rules and regulations
                                    </a>
                                </p>
                            </div>
                            <ErrorMessage
                                className="error"
                                name="policyTerms"
                                component="div"
                            />

                            <div className="hor_section_nospace mt--40">
                                <Field
                                    style={{ maxWidth: "30px", margin: "10px" }}
                                    type="checkbox"
                                    name="dataTerms"
                                ></Field>
                                <p className="information">
                                    I consent to my data being processed confidentially for
                                    the purposes of the organization
                                </p>
                            </div>
                            <ErrorMessage
                                className="error"
                                name="dataTerms"
                                component="div"
                            />

                            <div className="hor_section_nospace mt--40">
                                <Field
                                    style={{ maxWidth: "30px", margin: "10px" }}
                                    type="checkbox"
                                    name="notificationTerms"
                                ></Field>
                                <p className="information">
                                    I consent to being notified by BGSNL about events and
                                    discounts from us and our sponsors
                                </p>
                            </div>
                            <Field as="select" name="notificationTypeTerms">
                                <option value="" disabled>
                                    Contact By
                                </option>
                                <option value="Email">Email</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Email & WhatsApp">Both</option>
                            </Field>

                            <div className="hor_section_nospace mt--40">
                                <Field
                                    style={{ maxWidth: "30px", margin: "10px" }}
                                    type="checkbox"
                                    name="payTerms"
                                ></Field>
                                <p className="information">
                                    I consent BGSNL to deduct the membership fee at the agreed period in order to keep my benefits as a member and I keep my rights to cancel or update my payment methods.
                                </p>
                            </div>
                            <ErrorMessage
                                className="error"
                                name="payTerms"
                                component="div"
                            />
                        </div>
                        <div
                            style={{ borderWidth: "30px" }}
                            className="col-lg-6 col-md-6 col-12 mt--60 mb--60 center_div team_member_border-1"
                        >
                            <div className="rn-form-group">
                                <h3 className="center_text">
                                    For users with already paid membership
                                </h3>
                                <Field
                                    autoComplete="off"
                                    type="password"
                                    placeholder="Access Key"
                                    name="memberKey"
                                ></Field>
                                <p className="information">
                                    This is an access key field for users, provided with a key for their email from the board. Please ignore it if you do not have an access
                                    key. If you use key that does not belong to you, your account will be suspended!
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        disabled={loading}
                        type="submit"
                        onClick={() => handleErrorMsg(errors, isValid, dirty)}
                        className="rn-button-style--2 btn-solid mt--80"
                    >
                        {loading ? <Loader /> : <span>Finish Registration</span>}
                    </button>
                    <div
                        style={{ alignItems: "flex-start" }}
                        className="action_btns"
                    >
                        <Link className="rn-button-style--1" to="/login">
                            I already have a member account
                        </Link>
                    </div>
                </Form>
            )}
        </Formik>
    )
}

export default EventForm