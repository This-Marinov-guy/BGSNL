import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import * as yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Dialog } from 'primereact/dialog';
import Loader from "../loading/Loader";
import CheckoutForm from "../../CheckoutForm";
import { loadStripe } from "@stripe/stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { useHttpClient } from "../../../hooks/common/http-hook";
import { removeModal, selectModal } from "../../../redux/modal";
import { DONATION_MODAL } from "../../../util/defines/common";
import { REGION_GO_FUND_ME } from "../../../util/defines/REGIONS_DESIGN";

const schema = yup.object().shape({
    name: yup.string(),
    amount: yup.number().positive("Please insert a positive amount").min(2, 'Minimum Amount is 2 euro')
        .required("Please insert an amount"),
    comments: yup.string()
});

const DonationModal = () => {
    const modal = useSelector(selectModal);
    const dispatch = useDispatch();

    const {sendRequest} = useHttpClient();

    const hideModal = () => {
        dispatch(removeModal(DONATION_MODAL));
    }

    const [loading, setLoading] = useState(false)
    const [stripePromise, setStripePromise] = useState(null);
    const [clientSecret, setClientSecret] = useState("");
    const [error, setError] = useState('');

    return (
      <Dialog
        header="Your contribution means a lot!"
        visible={modal.includes(DONATION_MODAL)}
        onHide={hideModal}
        centered
      >
        <div className="payment bg_color--1">
          <div className="center_div_col center_text">
            <p>
              Support our mission by donating through our GoFundMe or directly
              through our payment system!
            </p>
            <a
              href={REGION_GO_FUND_ME.netherlands}
              target="_blank"
              className="rn-button-style--2 rn-btn-green"
            >
              GoFundMe
            </a>
            <hr className="mt--20"/>
          </div>
          {clientSecret && stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm />
            </Elements>
          ) : (
            <Formik
              className="inner"
              style={{ display: "flex" }}
              validationSchema={schema}
              onSubmit={async (values) => {
                try {
                  setLoading(true);
                  setError("");

                  const responseData = await sendRequest(
                    "payment/donation/config"
                  );

                  if (!responseData.publishableKey) {
                    return;
                  }

                  setStripePromise(loadStripe(responseData.publishableKey));

                  const paymentIntentResponse = await sendRequest(
                    "payment/donation/create-payment-intent",
                    "POST",
                    {
                      name: values.name,
                      amount: values.amount,
                      comments: values.comments,
                    }
                  );

                  if (
                    paymentIntentResponse.status === false &&
                    paymentIntentResponse.message
                  ) {
                    setError(paymentIntentResponse.message);
                    return;
                  }

                  const { clientSecret } = paymentIntentResponse;
                  setClientSecret(clientSecret);
                } catch (err) {
                  setError(err.message || paymentIntentResponse.message);
                } finally {
                  setLoading(false);
                }
              }}
              initialValues={{
                name: "",
                amount: "",
                comments: "",
              }}
            >
              {() => (
                <Form id="form" className="payment" style={{ padding: "2%" }}>
                  <div className="row">
                    <div className="col-lg-6 col-md-12 col-12 mt--10">
                      <div className="rn-form-group">
                        <Field
                          type="text"
                          placeholder="Name (optional)"
                          name="name"
                        ></Field>
                        <ErrorMessage
                          className="error"
                          name="name"
                          component="div"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-12 col-12 mt--10">
                      <div className="rn-form-group">
                        <div className="input-container">
                          <Field
                            type="number"
                            step="0.5"
                            placeholder="Amount in EUR"
                            name="amount"
                            inputMode="numeric"
                            min="2"
                          ></Field>
                        </div>
                        <ErrorMessage
                          className="error"
                          name="amount"
                          component="div"
                        />
                      </div>
                    </div>
                    <div className="col-lg-12 col-md-12 col-12 mt--40">
                      <div className="rn-form-group">
                        <Field
                          style={{ padding: "1% 0 0 3%" }}
                          as="textarea"
                          placeholder="Message to be sent to us (optional)"
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
                  <p className="error" style={{ margin: "10px auto" }}>
                    {error}
                  </p>
                  <button
                    disabled={loading}
                    type="submit"
                    className="rn-button-style--2 rn-btn-reverse-green mt--20"
                  >
                    {loading ? <Loader /> : <span>Continue the payment</span>}
                  </button>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </Dialog>
    );
}

export default DonationModal;



