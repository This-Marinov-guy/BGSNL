"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import {
  ErrorMessage,
  Form,
} from "formik";
import moment from "moment";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import {
  Dialog,
  InputOtp,
  Password,
  Steps,
} from "@/compat/primereact";
import ValidatedFormik from "../../elements/ui/forms/ValidatedFormik";
import Loader from "../../elements/ui/loading/Loader";
import { useHttpClient } from "../../hooks/common/http-hook";
import { showNotification } from "../../redux/notification";
import {
  FORGOTTEN_PASSWORD_STEPS_ENUM,
  FP_CHANGE_PASSWORD,
  FP_SEND_EMAIL_TOKEN,
  FP_VERIFY_TOKEN,
} from "../../util/defines/enum";

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

    const [step, setStep] = useState(FORGOTTEN_PASSWORD_STEPS_ENUM[FP_SEND_EMAIL_TOKEN]);
    const [formValues, setFormValues] = useState(initialValues);

    const { loading, sendRequest } = useHttpClient();

    const dispatch = useDispatch();
    const formId = "forgotten-password-step-" + step;

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
                "security/send-password-token",
                "POST",
                {
                    email: formValues.email,
                }
            );

            if (responseData.status) {
                setStep(FORGOTTEN_PASSWORD_STEPS_ENUM[FP_VERIFY_TOKEN]);
            }
        } catch (error) {
            void error;
        }
    };

    const verifyToken = async (event) => {
        event.preventDefault();

        const tokenInput = event.currentTarget.querySelector("input");
        tokenInput?.setCustomValidity(
            String(formValues.token).length === 6
                ? ""
                : "Please enter the complete 6-digit verification token."
        );

        if (!event.currentTarget.reportValidity()) {
            return;
        }

        const parameters = {
            ...formValues,
            birth: moment(formValues.birth).format('DD MM YY')
        }
        
        try {
            const responseData = await sendRequest(
                "security/verify-token",
                "POST",
                parameters
            );

            if (responseData.status) {
                setStep(FORGOTTEN_PASSWORD_STEPS_ENUM[FP_CHANGE_PASSWORD]);
            }
        } catch (error) {
            void error;
        }
    }

    const changePassword = async (values) => {
        try {
            const responseData = await sendRequest(
                `security/change-password`,
                "PATCH",
                {
                    token: formValues.token,
                    email: formValues.email,
                    password: values.password,
                }
            );

            if (responseData.status) {
                setStep(FORGOTTEN_PASSWORD_STEPS_ENUM[FP_SEND_EMAIL_TOKEN]);
                setFormValues(initialValues);
                dispatch(showNotification({ severity: 'success', summary: 'Success', detail: 'You successfully changed your password', life: 7000 }));
                onHide();
            }
        } catch (error) {
            void error;
        }
    }

    let content;

    switch (step) {
        case FORGOTTEN_PASSWORD_STEPS_ENUM[FP_SEND_EMAIL_TOKEN]:
            content = <form
                id={formId}
                className="center_div_col"
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
                        value={formValues.email}
                        required
                        placeholder="Email"
                        className="col-12 mt--20"
                        onChange={(event) => changeFormInputHandler(event)}
                    />
                </div>
            </form>;
            break;
        case FORGOTTEN_PASSWORD_STEPS_ENUM[FP_VERIFY_TOKEN]:
            content = <form
                id={formId}
                className="center_div_col"
                onSubmit={verifyToken}
            >
                <div className="row mb--20" style={{ maxWidth: '20em' }}>
                    <p>
                        We have sent an email containing the token. <br /> In order to verify it is you, we will need it back!
                    </p>
                    <h4 className="col-12 center_div">Verification Token</h4>
                    <div
                        className="col-12 mt--10 center_div"
                        data-field-name="token"
                    >
                        <InputOtp
                            value={formValues.token}
                            name="token"
                            onChange={(e) => {
                                e.originalEvent?.target
                                    ?.closest("[data-field-name='token']")
                                    ?.querySelectorAll("input")
                                    .forEach((input) => input.setCustomValidity(""));
                                setFormValues(prevState => {
                                    return {
                                        ...prevState,
                                        token: e.value
                                    }
                                });
                            }}
                            integerOnly
                            length={6} />
                    </div>
                        {/* Remove the need of birth and phone verification */}
                    {/* <h4 className="col-12 center_div mt--10">Additional Information</h4>
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
                    /> */}
                </div>
            </form>;
            break;
        case FORGOTTEN_PASSWORD_STEPS_ENUM[FP_CHANGE_PASSWORD]:
            content = <ValidatedFormik
                className="inner"
                validationSchema={schema}
                onSubmit={(values) => changePassword(values)}
                initialValues={{
                    password: "",
                    confirmPassword: "",
                }}
            >
                {({ setFieldValue }) => (
                    <Form id={formId}>
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
                    </Form>
                )}
            </ValidatedFormik>;
            break;
        default:
            content = '';

    }

    const actions = loading ? <Loader /> : (
        <>
            <button
                onClick={handleBack}
                type="button"
                className="rn-button-style--2 rn-btn-reverse"
            >
                Back
            </button>
            <button
                type="submit"
                form={formId}
                className="rn-button-style--2 rn-btn-reverse-green"
            >
                Proceed
            </button>
        </>
    );

    return (
        <Dialog
            header="Reset your password"
            visible={visible}
            style={{ width: "560px" }}
            onHide={onHide}
            footer={actions}
        >
            <Steps model={stepConfig} activeIndex={step} className="mb--30" />
            {content}
        </Dialog>
    )
}

ForgottenPassword.propTypes = {
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
};

export default ForgottenPassword
