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
import ImageInput from "../inputs/ImageInput";
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
import BackBtn from "../ui/BackBtn";

const EventForm = () => {
    const { sendRequest, loading } = useHttpClient()

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = ''; // This is needed for older browsers
        };

        if (process.env.NODE_ENV === 'development') {
            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        }
    }, []);

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
                where: '',
                ticketTimer: '',
                ticketLimit: 0,
                entry: null,
                memberEntry: null,
                activeMemberEntry: null,
                entryIncluding: '',
                memberIncluding: '',
                including: [],
                ticket_link: '',
                price_id: '',
                memberPrice_id: '',
                activeMemberPrice_id: "",
                text: '',
                title: '',
                images: [],
                ticket_img: null,
                thumbnail: null,
            }}
        >
            {({ values, setFieldValue, errors, isValid, dirty }) => (
                <Form
                    encType="multipart/form-data"
                    id="form"
                    style={{ padding: "2%" }}
                >
                    <h3 className="label">Basic Information</h3>
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
                        <div className="col-lg-6 col-md-12 col-12">
                            <Field
                                type="text"
                                placeholder="Location of event"
                                name="where"
                            ></Field>
                            <ErrorMessage
                                className="error"
                                name="where"
                                component="div"
                            />
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
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="rn-form-group">
                                <Calendar id="date" name="date"
                                    value={values.date}
                                    onChange={(event) => values.date = event.target.value}
                                    dateFormat="dd/mm/yy"
                                    minDate={new Date()}
                                    mask="99/99/9999"
                                    style={{ width: '100%' }}
                                    placeholder="Date of Event"
                                    showIcon />
                                <ErrorMessage
                                    className="error"
                                    name="date"
                                    component="div"
                                />
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="rn-form-group">
                                <Calendar value={values.time}
                                    onChange={(event) => values.time = event.target.value}
                                    style={{ width: '100%' }}
                                    placeholder="Time of Event"
                                    timeOnly />
                                <ErrorMessage
                                    className="error"
                                    name="time"
                                    component="div"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="row mt--20">
                        <div className="col-lg-12 col-md-12 col-12">
                            <Field as='textarea' placeholder="Full Description" name="text" rows={6} />
                            <ErrorMessage
                                className="error"
                                name="text"
                                component="div"
                            />
                        </div>
                    </div>
                    <h3 className="mt--30 label">Price Details</h3>
                    <div className="row">
                        <div className="col-lg-4 col-md-6 col-12">
                            <h5 className="mt--10">Basic Price</h5>
                            <div className="rn-form-group">
                                <Field type="number" placeholder="Price" name="entry" />
                                <ErrorMessage
                                    className="error"
                                    name="entry"
                                    component="div"
                                />
                            </div>
                            <div className="rn-form-group">
                                <Field type="text" placeholder="Including" name="entryIncluding" />
                                <ErrorMessage
                                    className="error"
                                    name="entryIncluding"
                                    component="div"
                                />
                            </div>
                            <div className="rn-form-group">
                                <Field type="text" placeholder="Price ID" name="price_id" />
                                <ErrorMessage
                                    className="error"
                                    name="price_id"
                                    component="div"
                                />
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-12">
                            <h5 className="mt--10">Member Price</h5>
                            <div className="rn-form-group">
                                <Field type="number" placeholder="Member Price" name="memberEntry" />
                                <ErrorMessage
                                    className="error"
                                    name="memberEntry"
                                    component="div"
                                />
                            </div>
                            <div className="rn-form-group">
                                <Field type="text" placeholder="Including" name="memberIncluding" />
                                <ErrorMessage
                                    className="error"
                                    name="memberIncluding"
                                    component="div"
                                />
                            </div>
                            <div className="rn-form-group">
                                <Field type="text" placeholder="Price ID" name="memberPrice_id" />
                                <ErrorMessage
                                    className="error"
                                    name="memberPrice_id"
                                    component="div"
                                />
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-12">
                            <h5 className="mt--10">Active Member Price</h5>
                            <div className="rn-form-group">
                                <Field type="number" placeholder="Active Member Price" name="activeMemberEntry" />
                                <ErrorMessage
                                    className="error"
                                    name="activeMemberEntry"
                                    component="div"
                                />
                            </div>
                            <div className="rn-form-group">
                                <Field type="text" placeholder="Price ID" name="activeMemberPrice_id" />
                                <ErrorMessage
                                    className="error"
                                    name="activeMemberPrice_id"
                                    component="div"
                                />
                            </div>
                        </div>
                    </div>
                    <h3 className="mt--30 label">Images</h3>
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-12">
                            <h5 className="center_text">Poster Image</h5>
                            <ImageInput
                                onChange={(event) => {
                                    setFieldValue("thumbnail", event.target.files[0]);
                                }}
                            />
                            <ErrorMessage
                                className="error"
                                name="thumbnail"
                                component="div"
                            />
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                            <h5 className="center_text">Ticket Image</h5>
                            <ImageInput
                                onChange={(event) => {
                                    setFieldValue("ticket_img", event.target.files[0]);
                                }}
                            />
                            <p className="mt--10 information center_text">
                                *ticket must be jpg or png in resolution 300:97 (like 1500 x 485)
                            </p>
                            <ErrorMessage
                                className="error"
                                name="ticket_img"
                                component="div"
                            />
                        </div>
                    </div>

                    <div className="small_flex mt--80">
                        <button
                            disabled={loading}
                            type="submit"
                            onClick={() => handleErrorMsg(errors, isValid, dirty)}
                            className="rn-button-style--2 btn-solid"
                        >
                            {loading ? <Loader /> : <span>Submit Event</span>}
                        </button>
                        <BackBtn />
                    </div>
                </Form>
            )}
        </Formik>
    )
}

export default EventForm