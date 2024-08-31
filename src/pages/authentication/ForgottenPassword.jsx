import React, { useState } from "react";
import * as yup from "yup";
import { Formik, Form, ErrorMessage } from "formik";
import { useHttpClient } from "../../hooks/http-hook";
import { Steps } from 'primereact/steps';
import { useDispatch } from "react-redux";
import { Dialog } from 'primereact/dialog';
import { InputOtp } from 'primereact/inputotp';
import { Password } from 'primereact/password';
import Loader from "../../elements/ui/loading/Loader";
import { showNotification } from "../../redux/notification";
import { Calendar } from 'primereact/calendar';
import { convertToUTC } from "../../util/functions/date";

const initialValues = {
    email: "",
    phone: "",
    birth: "",
    token: ""
};

const stepConfig = [
    {
        label: 'Email',
    },
    {
        label: 'Verify'
    },
    {
        label: 'Password'
    },
];

const schema = yup.object().shape({
    password: yup
        .string()
        .min(8, 'Password should be at least 8 characters')
        .matches(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/,
            "Please create a stronger password with capital and small letters, number and a special symbol"
        )
        .required(),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password"), null], "Passwords do not match")
        .required("Passwords do not match"),
});

const ForgottenPassword = (props) => {
    const { visible, onHide } = props;

    const [step, setStep] = useState(0);
    const [formValues, setFormValues] = useState(initialValues);

    const { loading, sendRequest } = useHttpClient();

    const dispatch = useDispatch();

    const changeFormInputHandler = (event) => {
        setFormValues((prevState) => {
            return { ...prevState, [event.target.name]: event.target.value };
        });
    };

    const handleBack = () => {
        if (step === 0) {
            return onHide();
        }

        setStep(prevState => prevState - 1);
    }

    const sendTokenHandler = async (event) => {
        event.preventDefault();
        try {
            const responseData = await sendRequest(
                "user/send-password-token",
                "POST",
                {
                    email: formValues.email,
                }
            );

            if (responseData.status) {
                setStep(1);
            }
        } catch (err) { }
    };

    const verifyToken = async (event) => {
        event.preventDefault();
        try {
            const responseData = await sendRequest(
                "user/verify-token",
                "POST",
                formValues
            );

            if (responseData.status) {
                setStep(2);
            }
        } catch (err) { }
    }

    const changePassword = async (values) => {
        try {
            const responseData = await sendRequest(
                `user/change-password`,
                "PATCH",
                {
                    token: formValues.token,
                    email: formValues.email,
                    password: values.password,
                }
            );

            if (responseData.status) {
                setStep(0);
                setFormValues(initialValues);
                dispatch(showNotification({ severity: 'success', summary: 'Success', detail: 'You successfully changed your password', life: 7000 }));
                onHide();
            }
        } catch (err) { }
    }

    let content;

    switch (step) {
        case 0:
            content = <form
                className="center_div_col"
                style={{ padding: "10px 20px" }}
                onSubmit={sendTokenHandler}
            >
                <div className="row mb--20" style={{ maxWidth: '20em' }}>
                    <p className="col-12">
                        You are about to start procedure for changing your password! <br />
                        Please enter your account email and we will send you a verification token!
                    </p>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="col-12 mt--20"
                        onChange={(event) => changeFormInputHandler(event)}
                    />

                </div>
                {loading ? <Loader /> :
                    <div className="center_div mt--60">
                        <button
                            onClick={handleBack}
                            type="button"
                            className="rn-button-style--2 rn-btn-reverse mr--5">
                            Back
                        </button>
                        <button
                            type="submit"
                            className="rn-button-style--2 rn-btn-reverse-green"
                        >
                            Proceed
                        </button>
                    </div>
                }
            </form>;
            break;
        case 1:
            content = <form
                className="center_div_col"
                style={{ padding: "10px 20px" }}
                onSubmit={verifyToken}
            >
                <div className="row mb--20" style={{ maxWidth: '20em' }}>
                    <p>
                        We have sent an email containing the token. <br /> In order to verify it is you, we will need some extra information!
                    </p>
                    <h4 className="col-12 center_div">Verification Token</h4>
                    <InputOtp
                        value={formValues.token}
                        name="token"
                        onChange={(e) => setFormValues(prevState => {
                            return {
                                ...prevState,
                                token: e.value
                            }
                        })}
                        integerOnly
                        length={6}
                        className="col-12 mt--10" />
                    <h4 className="col-12 center_div mt--10">Additional Information</h4>
                    <div className="col-12" style={{ padding: '0' }}>
                        <Calendar
                            value={formValues.birth}
                            placeholder="Enter birth date"
                            onChange={(e) => setFormValues(prevState => {
                                return {
                                    ...prevState,
                                    birth: e.value
                                }
                            })}
                            touchUI
                            dateFormat="dd/mm/yy"
                        />
                    </div>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Enter your phone (with + and country code)"
                        className="col-12 mt--10"
                        onChange={(event) => changeFormInputHandler(event)}
                    />
                </div>
                {loading ? <Loader /> :
                    <div className="center_div mt--60">
                        <button
                            onClick={handleBack}
                            type="button"
                            className="rn-button-style--2 rn-btn-reverse mr--5">
                            Back
                        </button>
                        <button
                            type="submit"
                            className="rn-button-style--2 rn-btn-reverse-green"
                        >
                            Proceed
                        </button>
                    </div>
                }
            </form>;
            break;
        case 2:
            content = <Formik
                className="inner"
                validationSchema={schema}
                validateOnChange={false}
                validateOnBlur={false}
                onSubmit={(values) => changePassword(values)}
                initialValues={{
                    password: "",
                    confirmPassword: "",
                }}
            >
                {({ setFieldValue }) => (
                    <Form id="form" style={{ padding: "10px 20px" }}>
                        <div className="hor_section">
                            <p>Now it is time to make your new password</p>
                        </div>
                        <div className="row mt--20">
                            <div className="col-12">
                                <div className="rn-form-group">
                                    <Password
                                        autoComplete="off"
                                        placeholder="New Password"
                                        name="password"
                                        onChange={(event) => setFieldValue('password', event.target.value)}
                                        toggleMask
                                        feedback={false}
                                        unstyled />
                                    <ErrorMessage
                                        className="error"
                                        name="password"
                                        component="div"
                                    />
                                </div>
                            </div>
                            <div className="col-12 mt--10">
                                <div className="rn-form-group">
                                    <Password
                                        autoComplete="off"
                                        placeholder="Confirm New Password"
                                        name="confirmPassword"
                                        onChange={(event) => setFieldValue('confirmPassword', event.target.value)}
                                        toggleMask
                                        feedback={false}
                                        unstyled />
                                    <ErrorMessage
                                        className="error"
                                        name="confirmPassword"
                                        component="div"
                                    />
                                </div>
                            </div>
                        </div>
                        {loading ? <Loader /> :
                            <div className="center_div mt--60">
                                <button
                                    onClick={handleBack}
                                    type="button"
                                    className="rn-button-style--2 rn-btn-reverse mr--5">
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="rn-button-style--2 rn-btn-reverse-green"
                                >
                                    Proceed
                                </button>
                            </div>
                        }
                    </Form>
                )}
            </Formik>;
            break;
        default:
            content = '';

    }

    return (
        <>
            <Dialog header="Reset your password" visible={visible} style={{ maxWidth: '80vw', textAlign: 'center' }} onHide={onHide}>
                <Steps model={stepConfig} activeIndex={step} className="mt--20" />
                {content}
            </Dialog>
        </>
    )
}

export default ForgottenPassword
