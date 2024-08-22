import React, { useCallback, useEffect, useState } from "react";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";
import * as yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Tooltip } from 'primereact/tooltip';
import { FileUpload } from 'primereact/fileupload';
import { useHttpClient } from "../../../hooks/http-hook";
import Loader from "../../ui/loading/Loader";
import ImageInput from "../../inputs/ImageInput";
import { BG_INDEX, REGIONS } from "../../../util/defines/REGIONS_DESIGN";
import StringDynamicInputs from "../../inputs/StringDynamicInputs";
import InputsBuilder from "../../inputs/InputsBuilder";
import { askBeforeRedirect, isProd } from "../../../util/functions/helpers";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { EVENT_ADDED, EVENT_EDITED, INCORRECT_MISSING_DATA } from "../../../util/defines/defines";
import LongLoading from "../../ui/loading/LongLoading";
import SubEventBuilder from "../../inputs/SubEventBuilder";
import {Calendar, CalendarWithClock} from "../../inputs/Calendar";
import ConfirmCenterModal from "../../ui/modals/ConfirmCenterModal";

const EventForm = (props) => {
    const { loading, sendRequest, forceStartLoading } = useHttpClient();

    const [visible, setVisible] = useState(false);
    const [confirmResolver, setConfirmResolver] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [files, setFiles] = useState([]);
    const [isValidFiles, setIsValidFiles] = useState(true);

    const navigate = useNavigate();

    const { eventId } = useParams();

    const edit = props.edit;
    const initialData = edit ? props.initialData : null;
    const bgs = Array.from({ length: BG_INDEX }, (_, i) => i + 1);
    const validFileTypes = ["image/jpg", "image/jpeg", "image/png"];

    const preSubmitCheck = (errors, isValid, dirty) => {
        if (!isProd()) {
            console.log(errors);
        }

        if (errors && !isValid && dirty) {
            return props.toast.current.show(INCORRECT_MISSING_DATA);
        }
    }

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

    const onSubmit = useCallback(() => {
        if (confirmResolver) {
            confirmResolver();
            setConfirmResolver(null);
            setVisible(false);
        }
    }, [confirmResolver]);

    const waitForConfirmation = () => {
        return new Promise((resolve) => {
            setVisible(true);
            setConfirmResolver(() => resolve);
        });
    };

    useEffect(() => {
        askBeforeRedirect();
    }, []);

    const schema = yup.object().shape({
        region: yup.string().required("Region is required"),
        title: yup.string().required("Title is required"),
        description: yup.string().required("Description is required"),
        date: yup.string().required("Date is required"),
        time: yup.string().required("Time is required"),
        location: yup.string().required("Location is required"),
        ticketTimer: yup.string().required("Ticket Timer is required"),
        ticketLimit: yup.number().required("Ticket Limit is required").min(1, 'Must be greater than 0'),
        isFree: yup.bool(),
        isMemberFree: yup.bool(),
        memberOnly: yup.bool(),
        isTicketLink: yup.bool(),

        priceId: yup.string().when(
            ['isFree', 'isTicketLink'],
            {
                is: (isFree, isTicketLink) => isFree || isTicketLink,
                then: () => yup.string(),
                otherwise: () => yup.string().required("Provide Stripe id for guest price"),
            }
        ),

        entry: yup.number().when(
            ['isFree', 'isTicketLink'],
            {
                is: (isFree, isTicketLink) => isFree || isTicketLink,
                then: () => yup.number().nullable(),
                otherwise: () => yup.number().required("Guest Price is required").min(1, 'Must be greater than 0'),
            }
        ),

        memberPriceId: yup.string().when(
            ['isFree', 'isMemberFree', 'memberOnly', 'isTicketLink'],
            {
                is: (isFree, isMemberFree, memberOnly, isTicketLink) =>
                    (isFree || isMemberFree) && !memberOnly && !isTicketLink,
                then: () => yup.string(),
                otherwise: () => yup.string().required("Provide Stripe id for member price"),
            }
        ),

        memberEntry: yup.number().when(
            ['isFree', 'isMemberFree', 'memberOnly', 'isTicketLink'],
            {
                is: (isFree, isMemberFree, memberOnly, isTicketLink) =>
                    (isFree || isMemberFree) && !memberOnly && !isTicketLink,
                then: () => yup.number().nullable(),
                otherwise: () => yup.number().required("Member Price is required").min(1, 'Must be greater than 0'),
            }
        ),

        ticketLink: yup.string().when('isTicketLink', {
            is: (isTicketLink) => isTicketLink,
            then: () => yup.string().required("Link to the ticket platform is required"),
            otherwise: () => yup.string(),
        }),

        activeMemberEntry: yup.number().min(1, 'Must be greater than 0').nullable(),
        activeMemberPriceId: yup.string().nullable(),

        text: yup.string().required("Add some content to the event"),
        title: yup.string().required("Title is required"),
        ticketImg: yup.mixed().required('A ticket image is required'),
        poster: yup.mixed().required('A poster is required'),
    });

    return (
        <>
            <ConfirmCenterModal text='Are you sure you want to submit the event?' onConfirm={onSubmit} visible={visible} setVisible={setVisible} />
            <LongLoading visible={submitting} />
            <Formik
                className="container"
                validationSchema={schema}
                onSubmit={async (values) => {
                    try {
                        await waitForConfirmation();

                        setSubmitting(true);
                        forceStartLoading();

                        const formData = new FormData();

                        files.forEach((file, index) => {
                            let fileName = 'image_' + index

                            let readyFile = new File([file], fileName);
                            formData.append(`images`, readyFile, fileName);

                        });

                        Object.entries(values).forEach(([key, val]) => {
                            if (key === 'extraInputsForm' || key === 'subEvent') {
                                formData.append(key, JSON.stringify(val));
                            } else if (Array.isArray(val)) {
                                val.forEach((v, i) => {
                                    formData.append(`${key}[]`, v);
                                })
                            } else if (!!val) {
                                formData.append(key, val);
                            }
                        });

                        const responseData = props.edit ?
                            await sendRequest(`event/actions/edit-event/${eventId}`, 'PATCH', formData)
                            : await sendRequest('event/actions/add-event', 'POST', formData);

                        if (responseData.status) {
                            props.toast.current.show(props.edit ? EVENT_EDITED : EVENT_ADDED);
                            navigate('/user/dashboard');
                        }

                    } catch (err) {
                    } finally {
                        setSubmitting(false);
                    }
                }}
                initialValues={{
                    memberOnly: initialData?.memberOnly ?? false,
                    hidden: initialData?.hidden ?? false,
                    extraInputsForm: initialData?.extraInputsForm ?? [],
                    freePass: initialData?.freePass ?? [],
                    discountPass: initialData?.discountPass ?? [],
                    subEvent: initialData?.subEvent ?? null,
                    region: initialData?.region ?? '',
                    title: initialData?.title ?? '',
                    description: initialData?.description ?? '',
                    date: initialData?.date ? new Date(initialData.date) : '',
                    time: initialData?.time ? new Date(initialData.time) : '',
                    location: initialData?.location ?? '',
                    ticketLimit: initialData?.ticketLimit ?? '',
                    ticketTimer: initialData?.ticketTimer ? new Date(initialData.ticketTimer) : '',
                    isTicketLink: initialData?.isTicketLink ?? false,
                    isSaleClosed: initialData?.isSaleClosed ?? false,
                    isFree: initialData?.isFree ?? false,
                    isMemberFree: initialData?.isMemberFree ?? false,
                    entry: !isNaN(initialData?.entry) ? initialData.entry : undefined,
                    memberEntry: !isNaN(initialData?.memberEntry) ? initialData.memberEntry : undefined,
                    activeMemberEntry: !isNaN(initialData?.activeMemberEntry) ? initialData.activeMemberEntry : undefined,
                    entryIncluding: initialData?.entryIncluding ?? '',
                    memberIncluding: initialData?.memberIncluding ?? '',
                    ticketLink: initialData?.ticketLink ?? '',
                    priceId: initialData?.priceId ?? '',
                    memberPriceId: initialData?.memberPriceId ?? '',
                    activeMemberPriceId: initialData?.activeMemberPriceId ?? "",
                    text: initialData?.text ?? '',
                    title: initialData?.title ?? '',
                    images: initialData?.images ?? [],
                    ticketImg: initialData?.ticketImg ?? null,
                    ticketColor: initialData?.ticketColor ?? '#faf9f6',
                    poster: initialData?.poster ?? null,
                    bgImage: initialData?.bgImage ?? 1,
                    bgImageExtra: initialData?.bgImageExtra ?? null,
                    bgSelection: initialData?.bgSelection ?? 'bgImageExtra',
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
                                    name="location"
                                ></Field>
                                <ErrorMessage
                                    className="error"
                                    name="location"
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
                                <Calendar placeholder='Date of event' onSelect={(value) => {
                                    setFieldValue('date', value)
                                }} />
                                <ErrorMessage
                                    className="error"
                                    name="date"
                                    component="div"
                                />
                            </div>
                            <div className="col-lg-6 col-md-12 col-12">
                                <div className="rn-form-group">
                                    <Field type='time' name='time' placeholder='Time of event' id='event-time'/>
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
                                    initialImage={values.poster}
                                    onChange={(event) => {
                                        setFieldValue("poster", event.target.files[0]);
                                    }}
                                />
                                <ErrorMessage
                                    className="error center_div"
                                    name="poster"
                                    component="div"
                                />
                            </div>
                            <div className="col-lg-6 col-md-6 col-12 mt--20">
                                <hr />
                                <h5 className="center_text">Ticket Image</h5>
                                <ImageInput
                                    initialImage={values.ticketImg}
                                    onChange={(event) => {
                                        setFieldValue("ticketImg", event.target.files[0]);
                                    }}
                                />
                                <p className="mt--10 information center_text">
                                    *ticket must be jpg or png in resolution 300:97 (like 1500 x 485)
                                </p>
                                <ErrorMessage
                                    className="error center_div"
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
                                        initialImage={values.bgImageExtra}
                                        style={{ height: '150px' }}
                                        onChange={(event) => {
                                            setFieldValue("bgImageExtra", event.target.files[0]);
                                        }}
                                    />
                                    <p className="mt--10 information center_text">
                                        *choose a wide one
                                    </p>
                                    {(values.bgImage && values.bgImageExtra) && <div className="col-lg-6 col-md-6 col-6" style={{ margin: 'auto' }}>
                                        <h5 className="center_text">Select which want to display</h5>
                                        <div className="center_div" style={{ gap: '50px' }}>
                                            <h5 className="center_div">
                                                <Field type="radio" name="bgSelection" value="bgImage" />
                                                Default Backgrounds
                                            </h5>
                                            <h5 className="center_div">
                                                <Field type="radio" name="bgSelection" value="bgImageExtra" />
                                                Extra Background
                                            </h5>
                                        </div>
                                    </div>}
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
                                        name="memberOnly"
                                    ></Field>
                                    <p className="information">
                                        Make event only purchasable by members (Still visible for non-members)
                                    </p>
                                </div>
                                <ErrorMessage
                                    className="error"
                                    name="memberOnly"
                                    component="div"
                                />
                            </div>
                            <div className="col-lg-6 col-12">
                                <div className="hor_section_nospace mt--20">
                                    <Field
                                        style={{ maxWidth: "30px" }}
                                        type="checkbox"
                                        name="hidden"
                                    ></Field>
                                    <p className="information">
                                        Hide event from News section (only accessible from url or subevent link)
                                    </p>
                                </div>
                                <ErrorMessage
                                    className="error"
                                    name="hidden"
                                    component="div"
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-6 col-12">
                                <div className="rn-form-group">
                                    <Field type="number" placeholder="Ticket Limit" name="ticketLimit" min={1} />
                                    <ErrorMessage
                                        className="error"
                                        name="ticketLimit"
                                        component="div"
                                    />
                                </div>
                            </div>
                            <div className="col-lg-6 col-12">
                                <div className="rn-form-group">
                                    <CalendarWithClock
                                        mode="single"
                                        locale='en-nl'
                                        placeholder='Ticket Timer'
                                        captionLayout="dropdown"
                                        onSelect={(value) => {
                                            setFieldValue('ticketTimer', value)
                                        }} />
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
                                <StringDynamicInputs name='discountPass' onChange={(inputs) => setFieldValue('discountPass', inputs)} initialValues={values.discountPass} placeholder='Add email' />
                            </div>
                            <div className="col-lg-6 col-12 mt--20">
                                <h5>Free Pass emails (for those who need a free ticket)</h5>
                                <StringDynamicInputs name='freePass' onChange={(inputs) => setFieldValue('freePass', inputs)} initialValues={values.freePass} placeholder='Add email' />
                            </div>
                        </div>

                        <SubEventBuilder onChange={(input) => setFieldValue('subEvent', input)} initialValues={values.subEvent} />

                        <h3 className="label mt--40">Add extra inputs by your choice</h3>
                        <InputsBuilder onChange={(inputs) => setFieldValue('extraInputsForm', inputs)} initialValues={values.extraInputsForm} />

                        <ConfirmDialog />
                        <div className="mt--40 mb--20 center_div">
                            <button
                                onClick={() => navigate('/user/dashboard')}
                                className="rn-button-style--2 rn-btn-reverse mr--5">Dashboard</button>
                            <button
                                disabled={loading}
                                type="submit"
                                onClick={() => preSubmitCheck(errors, isValid, dirty)}
                                className="rn-button-style--2 rn-btn-reverse-green"
                            >
                                {loading ? <Loader /> : <span>{props.edit ? 'Edit Event' : 'Submit Event'}</span>}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    )
}

export default EventForm
