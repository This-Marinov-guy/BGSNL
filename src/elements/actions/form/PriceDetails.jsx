import React from "react";
import { Field, ErrorMessage } from "formik";
import AdditionalPrices from "../../inputs/AdditionalPrices";
import PromotionalPrices from "../../inputs/PromotionalPrice";
import { START_TIMER } from "../../../util/defines/enum";
import "./formStyles.scss";

const PriceDetails = ({ values, setFieldValue }) => {
  return (
    <div className="form-wrapper">
      <h3 className="section-title">Price Details</h3>
      <div className="checkbox-grid">
        <div className="checkbox-item">
          <Field type="checkbox" name="isFree" className="rn-input" />
          <p>Make event FREE for all</p>
        </div>
        <div className="checkbox-item">
          <Field type="checkbox" name="isMemberFree" className="rn-input" />
          <p>Make event FREE for members only</p>
        </div>
        <div className="checkbox-item">
          <Field type="checkbox" name="isTicketLink" className="rn-input" />
          <p>Buy tickets from external platform</p>
        </div>
      </div>
      {!values.isSaleClosed && !values.isFree && (
        <>
          {values.isTicketLink ? (
            <div className="form-group full-width">
              <Field
                type="text"
                placeholder="External Ticket Link"
                name="ticketLink"
                className="rn-input"
              />
              <small>*Redirects users to another website</small>
              <ErrorMessage className="error" name="ticketLink" component="div" />
            </div>
          ) : (
            <div className="price-grid">
              <div className="price-item">
                <h5>Basic Price</h5>
                <Field
                  type="number"
                  placeholder="Price"
                  name="guestPrice"
                  min={1}
                  step="0.01"
                  className="rn-input"
                />
                <ErrorMessage className="error" name="guestPrice" component="div" />
                <Field
                  type="text"
                  placeholder="Includes"
                  name="entryIncluding"
                  className="rn-input"
                />
                <ErrorMessage className="error" name="entryIncluding" component="div" />
              </div>
              {!values.isMemberFree && (
                <>
                  <div className="price-item">
                    <h5>Member Price</h5>
                    <Field
                      type="number"
                      placeholder="Price"
                      name="memberPrice"
                      min={1}
                      step="0.01"
                      className="rn-input"
                    />
                    <ErrorMessage className="error" name="memberPrice" component="div" />
                    <Field
                      type="text"
                      placeholder="Includes"
                      name="memberIncluding"
                      className="rn-input"
                    />
                    <ErrorMessage className="error" name="memberIncluding" component="div" />
                  </div>
                  <div className="price-item">
                    <h5>Active Member Price</h5>
                    <Field
                      type="number"
                      placeholder="Price"
                      name="activeMemberPrice"
                      min={1}
                      step="0.01"
                      className="rn-input"
                    />
                    <ErrorMessage
                      className="error"
                      name="activeMemberPrice"
                      component="div"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
      <div className="form-section">
        <h3 className="section-title">Variable Price Options</h3>
        <div className="checkbox-item">
          <Field type="checkbox" name="earlyBird[isEnabled]" />
          <p>Add Early Bird Price</p>
        </div>
        <AdditionalPrices
          visible={values.earlyBird.isEnabled}
          label="Early Bird"
          setFieldValue={setFieldValue}
          initialCalendarValue={values.earlyBird.ticketTimer}
        />
        <div className="checkbox-item">
          <Field type="checkbox" name="lateBird[isEnabled]" />
          <p>Add Late Bird Price</p>
        </div>
        <AdditionalPrices
          visible={values.lateBird.isEnabled}
          label="Late Bird"
          setFieldValue={setFieldValue}
          initialCalendarValue={values.lateBird.ticketTimer}
          timerType={START_TIMER}
        />
      </div>
      <div className="form-section">
        <h3 className="section-title">Promotions</h3>
        <div className="checkbox-item">
          <Field type="checkbox" name="guestPromotion[isEnabled]" />
          <p>Add Guest Promotion</p>
        </div>
        <PromotionalPrices
          visible={values.guestPromotion.isEnabled}
          label="Guest Promotion"
          setFieldValue={setFieldValue}
          initialStartValue={values.guestPromotion.startTimer}
          initialEndValue={values.guestPromotion.endTimer}
        />
        <div className="checkbox-item">
          <Field type="checkbox" name="memberPromotion[isEnabled]" />
          <p>Add Member Promotion</p>
        </div>
        <PromotionalPrices
          visible={values.memberPromotion.isEnabled}
          label="Member Promotion"
          setFieldValue={setFieldValue}
          initialStartValue={values.memberPromotion.startTimer}
          initialEndValue={values.memberPromotion.endTimer}
        />
      </div>
    </div>
  );
};

export default PriceDetails;
