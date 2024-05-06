import React, { Fragment, useEffect, useState } from "react";
import capitalizeFirstLetter from "../../util/capitalize";
import * as yup from "yup";
import moment from 'moment'
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Calendar } from 'primereact/calendar';
import { Tooltip } from 'primereact/tooltip';
import { FileUpload } from 'primereact/fileupload';
import { useHttpClient } from "../../hooks/http-hook";
import Loader from "../../elements/ui/Loader";
import ImageInput from "../inputs/ImageInput";
import { BG_INDEX, REGIONS } from "../../util/REGIONS_DESIGN";
import WithBackBtn from "../ui/WithBackBtn";
import StringDynamicInputs from "../inputs/StringDynamicInputs";
import InputsBuilder from "../inputs/InputsBuilder";
import { askBeforeRedirect } from "../../util/global";

const EventForm = (props) => {
    const { loading, sendRequest, forceStartLoading } = useHttpClient();
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
        askBeforeRedirect();
    }, []);

    const schema = yup.object().shape({
        region: yup.string().required("Region is required"),
        title: yup.string().required("Title is required"),
        description: yup.string().required("Description is required"),
        date: yup.string().required("Date is required"),
        time: yup.string().required("Time is required"),
        where: yup.string().required("Location is required"),
        date: yup.string().required("Date is required"),
        ticketTimer: yup.string().required("Ticket Timer is required"),
        ticketLimit: yup.number().required("Ticket Limit is required"),
        entry: yup.number().required("Normal Price is required"),
        memberEntry: yup.number().required("Member Price is required"),
        ticketLink: yup.string().required("Ticket Link is required"),
        priceId: yup.string().required("Provide Stripe id for guest price"),
        memberPriceId: yup.string().required("Provide Stripe id for member price"),
        activeMemberPriceId: yup.string().required("Provide Stripe id for active member price"),
        text: yup.string().required("Add some content to the event"),
        title: yup.string().required("Title is required"),
        ticketImg: yup.mixed().required('A ticket image is required'),
        poster: yup.mixed().required('A poster is required'),
    });

    return (
        <Formik
            className="container"
            validationSchema={schema}
            onSubmit={async (values) => {
                try {
                    forceStartLoading();

                    const formData = new FormData();

                    files.forEach((file, index) => {
                        let fileName = 'image_' + index

                        let readyFile = new File([file], fileName);
                        formData.append(`images`, readyFile, fileName);

                    });

                    Object.entries(values).forEach(([key, val]) => {
                        if (key === 'extraInputsForm') {
                            formData.append(key, JSON.stringify(val));
                        } else {
                            formData.append(key, val);
                        }
                    });

                    const responseData = await sendRequest('event/actions/add-event', 'POST', formData)

                    if (responseData.status) {
                        props.toast.current.show({ severity: 'success', summary: 'Event added' });
                        navigate('/user/events');
                    }

                } catch (err) {
                }
            }}
            initialValues={{
                membersOnly: false,
                visible: true,
                extraInputsForm: [
                    // { type: '', placeholder: '', required: false, options: [] }
                ],
                freePass: [],
                discountPass: [],
                subEventDescription: '',
                subEventLinks: [],
                region: '',
                title: '',
                description: '',
                date: '',
                time: '',
                where: '',
                ticketTimer: '',
                ticketLimit: 1000,
                isTicketLink: false,
                isSaleClosed: false,
                isFree: false,
                isMemberFree: false,
                entry: null,
                memberEntry: null,
                activeMemberEntry: null,
                entryIncluding: '',
                memberIncluding: '',
                ticketLink: '',
                priceId: '',
                memberPriceId: '',
                activeMemberPriceId: "",
                text: '',
                title: '',
                images: [],
                ticketImg: null,
                ticketColor: '#faf9f6',
                poster: null,
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
                                    placeholder="Sub-Title"
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
                                    touchUI
                                    showButtonBar
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
                        <div className="col-lg-4 col-12">
                            <div className="hor_section_nospace mt--20">
                                <Field
                                    style={{ maxWidth: "30px" }}
                                    type="checkbox"
                                    name="isFree"
                                ></Field>
                                <p className="information">
                                    Make event FREE for all
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-12">
                            <div className="hor_section_nospace mt--20 mb--20">
                                <Field
                                    style={{ maxWidth: "30px" }}
                                    type="checkbox"
                                    name="isMemberFree"
                                ></Field>
                                <p className="information">
                                    Make event FREE for members only
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-12">
                            <div className="hor_section_nospace mt--20 mb--20">
                                <Field
                                    style={{ maxWidth: "30px" }}
                                    type="checkbox"
                                    name="isTicketLink"
                                ></Field>
                                <p className="information">
                                    Buy tickets from external platform
                                </p>
                            </div>
                        </div>
                    </div>
                    {!(values.isSaleClosed || values.isFree) && (values.isTicketLink ?
                        <div className="row">
                            <div className="col-12">
                                <h5 className="mt--10"></h5>
                                <div className="rn-form-group">
                                    <Field type="text" placeholder="External Platform Ticket Link" name="ticketLink" />
                                    <ErrorMessage
                                        className="error"
                                        name="ticketLink"
                                        component="div"
                                    />
                                </div>
                            </div>
                        </div> :
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
                                    <Field type="text" placeholder="Price ID" name="priceId" />
                                    <ErrorMessage
                                        className="error"
                                        name="priceId"
                                        component="div"
                                    />
                                </div>
                            </div>
                            {!values.isMemberFree && <><div className="col-lg-4 col-md-6 col-12">
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
                                    <Field type="text" placeholder="Price ID" name="memberPriceId" />
                                    <ErrorMessage
                                        className="error"
                                        name="memberPriceId"
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
                                        <Field type="text" placeholder="Price ID" name="activeMemberPriceId" />
                                        <ErrorMessage
                                            className="error"
                                            name="activeMemberPriceId"
                                            component="div"
                                        />
                                    </div>
                                </div>
                            </>}
                        </div>)}
                    <h3 className="mt--30 label">Images</h3>
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-12 mt--20">
                            <hr />
                            <h5 className="center_text">Poster Image</h5>
                            <ImageInput
                                onChange={(event) => {
                                    setFieldValue("poster", event.target.files[0]);
                                }}
                            />
                            <ErrorMessage
                                className="error"
                                name="poster"
                                component="div"
                            />
                        </div>
                        <div className="col-lg-6 col-md-6 col-12 mt--20">
                            <hr />
                            <h5 className="center_text">Ticket Image</h5>
                            <ImageInput
                                onChange={(event) => {
                                    setFieldValue("ticketImg", event.target.files[0]);
                                }}
                            />
                            <p className="mt--10 information center_text">
                                *ticket must be jpg or png in resolution 300:97 (like 1500 x 485)
                            </p>
                            <ErrorMessage
                                className="error"
                                name="ticketImg"
                                component="div"
                            />
                            <div className="col-lg-6 col-md-6 col-6" style={{ margin: 'auto' }}>
                                <h5 className="center_text">Name on ticket color</h5>
                                <div className="center_div" style={{ gap: '50px' }}>
                                    <h5 className="center_div">
                                        <Field type="radio" name="ticketColor" value="#faf9f6" />
                                        Light
                                    </h5>
                                    <h5 className="center_div">
                                        <Field type="radio" name="ticketColor" value="#272528" />
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
                            <FileUpload name="extraImages" onInput={inputHandler} multiple accept="image/*" maxFileSize={100000000000} emptyTemplate={<h4 className="m-0">Drag and drop files to here to upload.</h4>} />
                            <FileUpload name="extraImages" onInput={inputHandler} multiple accept="image/*" maxFileSize={100000000000} emptyTemplate={<h4 className="m-0">Drag and drop files to here to upload.</h4>} />
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
                            <h5 className="mt--30">Background Image (hover for preview)</h5>
                            <div className="rn-form-group" style={{ margin: 'auto', width: '250px' }}>
                                {values.bgImage && <Tooltip target='.bg-input' position="top" style={{ maxWidth: '200px' }}>
                                    <img src={`/assets/images/bg/bg-image-${values.bgImage}.webp`} alt='bg preview' />
                                </Tooltip>}
                                <Field as="select" name="bgImage" className='bg-input'>
                                    <option value="" disabled >
                                        Our Selection
                                    </option>
                                    {bgs.map((value) => {
                                        {
                                            return <option key={value} value={`${value}`} className='bg-input'>Background {value}</option>
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
                    <h3 className="label">Additional Settings</h3>
                    <div className="row mt--40">
                        <div className="col-lg-6 col-12">
                            <div className="hor_section_nospace mt--20">
                                <Field
                                    style={{ maxWidth: "30px" }}
                                    type="checkbox"
                                    name="isSaleClosed"
                                ></Field>
                                <p className="information">
                                    Close Sale of Tickets (only display event)
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-6 col-12">
                            <div className="hor_section_nospace mt--20">
                                <Field
                                    style={{ maxWidth: "30px" }}
                                    type="checkbox"
                                    name="membersOnly"
                                ></Field>
                                <p className="information">
                                    Make event only purchasable by members (Still visible for non-members)
                                </p>
                            </div>
                            <ErrorMessage
                                className="error"
                                name="membersOnly"
                                component="div"
                            />
                        </div>
                        <div className="col-lg-6 col-12">
                            <div className="hor_section_nospace mt--20">
                                <Field
                                    style={{ maxWidth: "30px" }}
                                    type="checkbox"
                                    name="visible"
                                ></Field>
                                <p className="information">
                                    Hide event from News section (only accessible from url or subevent link)
                                </p>
                            </div>
                            <ErrorMessage
                                className="error"
                                name="visible"
                                component="div"
                            />
                        </div>
                    </div>

                    <div className='row'>
                        <div className="col-12 mt--20">
                            <h5>Link a sub-event</h5>
                            <Field as='textarea' placeholder="Sub-event description" name="subEventDescription" rows={2} />
                            <StringDynamicInputs name='subEventLinks' onChange={(inputs) => values.subEventLinks = inputs} intValues={values.subEventLinks} max={6} placeholder='Add first link' />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-6 col-12">
                            <div className="rn-form-group">
                                <Field type="number" placeholder="Ticket Limit" name="ticketLimit" />
                                <ErrorMessage
                                    className="error"
                                    name="ticketLimit"
                                    component="div"
                                />
                            </div>
                        </div>
                        <div className="col-lg-6 col-12">
                            <div className="rn-form-group">
                                <Calendar id="ticket-date" name="ticketTimer"
                                    value={values.ticketTimer}
                                    onChange={(event) => values.ticketTimer = event.target.value}
                                    dateFormat="dd/mm/yy"
                                    minDate={new Date()}
                                    style={{ width: '100%' }}
                                    placeholder="Ticket Sale End"
                                    touchUI
                                    showButtonBar
                                    showIcon
                                    showTime
                                    hourFormat="24"
                                />
                                <ErrorMessage
                                    className="error"
                                    name="ticketTimer"
                                    component="div"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-6 col-12 mt--20">
                            <h5>Discount emails (extra from the active members)</h5>
                            <StringDynamicInputs name='discountPass' onChange={(inputs) => values.discountPass = inputs} intValues={values.discountPass} placeholder='Add email' />
                        </div>
                        <div className="col-lg-6 col-12 mt--20">
                            <h5>Free Pass emails (for those who need a free ticket)</h5>
                            <StringDynamicInputs name='freePass' onChange={(inputs) => values.freePass = inputs} intValues={values.freePass} placeholder='Add email' />
                        </div>
                    </div>

                    <h3 className="label mt--40">Add extra inputs by your choice</h3>
                    <InputsBuilder onChange={(inputs) => values.extraInputsForm = inputs} />

                    <WithBackBtn >
                        <button
                            disabled={loading}
                            type="submit"
                            onClick={() => handleErrorMsg(errors, isValid, dirty)}
                            className="rn-button-style--2 btn-solid"
                        >
                            {loading ? <Loader /> : <span>Submit Event</span>}
                        </button>
                    </WithBackBtn>
                </Form>
            )}
        </Formik>
    )
}

export default EventForm
