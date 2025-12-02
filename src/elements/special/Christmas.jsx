import React, { useState, Fragment } from "react";
import { useHttpClient } from "../../hooks/common/http-hook";
import Loader from "../ui/loading/Loader";
import * as yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FiX } from "react-icons/fi";

import ModalWindow from "../ui/modals/ModalWindow";

import GifSearch from "./GifSearch";
import GifImage from "./GifImage";
import { HOLIDAYS } from "../../util/configs/common";

const schema = yup.object().shape({
    text: yup.string().required("You are not sending without a wish >:("),
    sender: yup.string().when("hideSender", {
        is: false,
        then: () => yup.string().required("Please fill your name"),
        otherwise: () => yup.string(),
    }),
    receiver: yup.string().when("randomReceiver", {
        is: false,
        then: () => yup.string().required("Please fill the full name of the receiver"),
        otherwise: () => yup.string(),
    }),

});

const Christmas = (props) => {
    const [showInbox, setShowInbox] = useState(false)
    const [showForm, setShowForm] = useState(false);
    const [gif, setGif] = useState(null)
    const [success, setSuccess] = useState(false);

    const { loading, sendRequest } = useHttpClient();

    if (!HOLIDAYS.isChristmas) {
        return;
    }
    
    return (
        <Fragment>
            {showInbox && <ModalWindow show={showInbox}>
                <div className="inner" style={{padding:'20px', maxHeight: '80vh', overflowY: 'auto'}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #e9ecef', paddingBottom: '15px' }}>
                        <h3 style={{ margin: 0, color: '#017363', fontSize: '24px', fontWeight: '600' }}>Your Christmas Cards</h3>
                        <FiX 
                            className="x_icon" 
                            onClick={() => { setShowInbox(false) }} 
                            style={{ 
                                cursor: 'pointer', 
                                fontSize: '24px', 
                                color: '#6c757d',
                                transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#dc3545'}
                            onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                        />
                    </div>
                    {props.currentUser.christmas.length > 0 ? (
                        <div className="row mt--20" style={{ gap: '20px' }}>
                            {props.currentUser.christmas.map((card, index) => (
                                <div key={index} className="col-lg-12 col-md-12 col-12">
                                    <div 
                                        className="card_panel"
                                        style={{
                                            border: '1px solid #e9ecef',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            backgroundColor: '#ffffff',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                            marginBottom: '20px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                            <div style={{ flex: '0 0 auto' }}>
                                                <GifImage src={card.gif} />
                                            </div>
                                            <div className="card_text" style={{ flex: '1', minWidth: '200px' }}>
                                                <div style={{ marginBottom: '12px' }}>
                                                    <strong style={{ color: '#017363', fontSize: '14px', display: 'block', marginBottom: '4px' }}>From:</strong>
                                                    <p style={{ margin: 0, color: '#495057', fontSize: '16px' }}>{card.sender || 'Anonymous'}</p>
                                                </div>
                                                <div style={{ marginBottom: '12px' }}>
                                                    <strong style={{ color: '#017363', fontSize: '14px', display: 'block', marginBottom: '4px' }}>To:</strong>
                                                    <p style={{ margin: 0, color: '#495057', fontSize: '16px' }}>{card.receiver}</p>
                                                </div>
                                                <div>
                                                    <strong style={{ color: '#017363', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Message:</strong>
                                                    <p style={{ margin: 0, color: '#495057', fontSize: '16px', lineHeight: '1.6' }}>{card.text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '12px',
                            border: '2px dashed #dee2e6'
                        }}>
                            <p style={{ 
                                margin: 0, 
                                color: '#6c757d', 
                                fontSize: '18px',
                                fontStyle: 'italic'
                            }}>
                                No cards yet - you can always send one to yourself 😊
                            </p>
                        </div>
                    )}
                </div>
            </ModalWindow>}
            {showForm && <ModalWindow show={showForm}>
                <Formik className="inner" validationSchema={schema}
                    initialValues={{
                        text: '',
                        gif: '',
                        sender: props.currentUser.name + ' ' + props.currentUser.surname,
                        receiver: '',
                        randomReceiver: false,
                        hideSender: false,
                    }}
                    onSubmit={async (values) => {
                        try {
                            const responseData = await sendRequest(
                                "special/add-card",
                                "POST",
                                {
                                    text: values.text,
                                    gif: gif,
                                    sender: values.sender,
                                    receiver: values.receiver,
                                    randomReceiver: values.randomReceiver,
                                    hideSender: values.hideSender
                                },
                                
                            );
                            if (responseData.message == 'Success') {
                                setSuccess(true);
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    }}
                >
                    {success ? <div style={{ padding: '10px' }}>
                        <FiX className="x_icon" onClick={() => { setShowForm(false) }} />
                        <img src='https://i.pinimg.com/originals/ff/6e/bd/ff6ebd0dfb50a44c04c842f365df4446.gif'></img>
                        <p className="mt--20">Hope you had fun - we expect to see you next year as well! Kind regards, BGS-Netherlands!</p>
                    </div> : <Form
                        id="form"
                        style={{ padding: "5%" }}
                    >
                        <div className="hor_section">
                            <h3>Send a Christmas Card to a BGSG member</h3>
                            <FiX className="x_icon" onClick={() => { setShowForm(false) }} />
                        </div>
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-12 mt--20">
                                <Field as='textarea' placeholder="Your holiday wish" name="text" style={{ padding: '5px 10px' }} />
                                <ErrorMessage
                                    className="error"
                                    name="text"
                                    component="div"
                                />
                            </div>
                            <GifSearch value={gif} setValue={(value) => setGif(value)} />
                            <div className="col-lg-6 col-md-12 col-12">
                                <div className="rn-form-group">
                                    <Field type="text" placeholder="Your Name" name="sender" />
                                    <ErrorMessage className="error" name='sender' component='div' />
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-12 col-12">
                                <div className="hor_section_nospace">
                                    <Field
                                        style={{ maxWidth: "30px", margin: '10px' }}
                                        type="checkbox"
                                        name="hideSender"
                                    ></Field>
                                    <p className="information">
                                        Hide your name from receiver
                                    </p>
                                </div>
                            </div>

                            <div className="col-lg-6 col-md-12 col-12">
                                <div className="rn-form-group">
                                    <Field type="text" placeholder="Receiver Full Name" name="receiver" />
                                    <ErrorMessage
                                        className="error"
                                        name="receiver"
                                        component="div"
                                    />
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-12 col-12">
                                <div className="hor_section_nospace">
                                    <Field
                                        style={{ maxWidth: "30px", margin: '10px' }}
                                        type="checkbox"
                                        name="randomReceiver"
                                    ></Field>
                                    <p className="information">
                                        Send to random user
                                    </p>
                                </div>
                            </div>

                        </div>
                        <button
                            disabled={loading}
                            type="submit"
                            className="rn-button-style--2 rn-btn-reverse-green mt--20"
                        >
                            {loading ? <Loader /> : <span>Send Card</span>}
                        </button>
                    </Form>}
                </Formik>
            </ModalWindow>}

            <div className='holiday-special'>
                <img src='/assets/images/special/christmas-hat.png' alt='hat' className="special-icon" />
                <h3 style={{ color: 'white', marginBottom: '25px', fontSize: '28px', fontWeight: '600' }}>Holiday Special</h3>
                <div className='holiday-special-btns' style={{ 
                    display: 'flex', 
                    gap: '15px', 
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={() => {
                            setShowInbox(true)
                        }}
                        style={{
                            padding: '12px 28px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#ffffff',
                            backgroundColor: '#017363',
                            border: '2px solid #017363',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(1, 115, 99, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#015a4d';
                            e.target.style.borderColor = '#015a4d';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(1, 115, 99, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#017363';
                            e.target.style.borderColor = '#017363';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(1, 115, 99, 0.3)';
                        }}
                    >
                        📬 Check Inbox
                    </button>
                    <button
                        onClick={() => {
                            setShowForm(true)
                        }}
                        style={{
                            padding: '12px 28px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#017363',
                            backgroundColor: '#ffffff',
                            border: '2px solid #ffffff',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f8f9fa';
                            e.target.style.borderColor = '#ffffff';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ffffff';
                            e.target.style.borderColor = '#ffffff';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(255, 255, 255, 0.2)';
                        }}
                    >
                        ✉️ Send a Wish
                    </button>
                </div>
            </div>
        </Fragment>
    )
}

export default Christmas