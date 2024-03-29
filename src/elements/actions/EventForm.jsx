import React, { Fragment, useEffect, useState } from "react";
import capitalizeFirstLetter from "../../util/capitalize";
import * as yup from "yup";
import moment from 'moment'
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Calendar } from 'primereact/calendar';
import { Tooltip } from 'primereact/tooltip';
import { FileUpload } from 'primereact/fileupload';
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
import { BG_INDEX, REGIONS } from "../../util/REGIONS_DESIGN";
import BackBtn from "../ui/BackBtn";

const EventForm = () => {
    const { sendRequest, loading } = useHttpClient()
    const [files, setFiles] = useState([]);
    const [isValidFiles, setIsValidFiles] = useState(true);

    const handleErrorMsg = (errors, isValid, dirty) => {
        if (errors && !isValid && dirty) {
            props.toast.current.show({ severity: 'error', summary: 'Missing details', detail: 'Please check the form again and fill the missing or incorrect data!' });
        }
    }

    const validFileTypes = ["image/jpg", "image/jpeg", "image/png"];

    const inputHandler = (event) => {
        const pickedFiles = Array.from(event.target.files);
        const filteredFiles = pickedFiles.filter((file) =>
            validFileTypes.includes(file.type)
        );

        if (filteredFiles.length > 0) {
            setFiles(filteredFiles);
            setIsValidFiles(true);
        } else {
            setIsValidFiles(false);
        }
    };

    const bgs = Array.from({ length: BG_INDEX }, (_, i) => i + 1)

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

                files.forEach((file, index) => {
                    let fileName = 'image_' + index

                    let readyFile = new File([file], fileName);
                    formData.append(`images`, readyFile, fileName);
                });

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
                ticket_color: '#faf9f6',
                thumbnail: null,
                bgImage: 1,
                bgImageExtra: null,
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
                                    {REGIONS.map((val, index) => {
                                        return <option value={val} key={index}>{capitalizeFirstLetter(val)}</option>
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
                        <div className="col-lg-6 col-md-6 col-12 mt--20">
                            <hr />
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
                        <div className="col-lg-6 col-md-6 col-12 mt--20">
                            <hr />
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
                            <div className="col-lg-6 col-md-6 col-6" style={{ margin: 'auto' }}>
                                <h5 className="center_text">Name on ticket color</h5>
                                <div className="center_div" style={{ gap: '50px' }}>
                                    <h5 className="center_div">
                                        <Field type="radio" name="ticket_color" value="#faf9f6" />
                                        Light
                                    </h5>
                                    <h5 className="center_div">
                                        <Field type="radio" name="ticket_color" value="#272528" />
                                        Dark
                                    </h5>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='row center_text'>
                        <div className='col-lg-6 col-12 mt--20'>
                            <hr />
                            <h5 className="mt--30">Description Images (The poster is automatically assigned)</h5>
                            <FileUpload name="extraImages" onInput={inputHandler} multiple accept="image/*" maxFileSize={1000000} emptyTemplate={<h4 className="m-0">Drag and drop files to here to upload.</h4>} />
                            <p>
                                <small>* Submit no more than 3</small><br />
                                <small>* Extra images will not be received</small><br />
                            </p>
                            {!isValidFiles && (
                                <p style={{ color: "red" }}>The file is not supported, please try again</p>
                            )}
                        </div>
                        <div className='col-lg-6 col-12 mt--20'>
                            <hr />
                            <h5 className="mt--30" tooltip="Enter your username" tooltipOptions={{ position: 'top' }}>Background Image</h5>
                            <div className="rn-form-group" style={{ margin: 'auto', width: '250px' }}>
                                <Field as="select" name="bgImage">
                                    <option value="" disabled>
                                        Our Selection
                                    </option>
                                    {bgs.map((value) => {
                                        {
                                            return <Fragment>
                                                <Tooltip target={`#option-${value}`} content={`dsada`} />
                                                <option key={value} value={`${value}`} id={`#option-${value}`}>Background {value}</option>
                                            </Fragment>
                                        }
                                    })}
                                </Field>
                                <h5>or choose your own</h5>
                                <ImageInput
                                    style={{ height: '150px' }}
                                    onChange={(event) => {
                                        setFieldValue("bgImageExtra", event.target.files[0]);
                                    }}
                                />
                                <p className="mt--10 information center_text">
                                    *choose a wide one
                                </p>
                                <ErrorMessage
                                    className="error"
                                    name="bgImage"
                                    component="div"
                                />
                            </div>
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
