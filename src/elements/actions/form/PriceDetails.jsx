import React from "react";
import { Field, ErrorMessage } from "formik";
import AdditionalPrices from "../../inputs/AdditionalPrices";
import PromotionalPrices from "../../inputs/PromotionalPrice";
import { START_TIMER } from "../../../util/defines/enum";

const PriceDetails = ({ values, setFieldValue }) => {
  return (
    <div>
      <h3 className="mt--30 label">Price Details</h3>
      <div className="row">
        <div className="col-lg-4 col-12">
          <div className="hor_section_nospace mt--20">
            <Field style={{ maxWidth: "30px" }} type="checkbox" name="isFree" />
            <p className="information">Make event FREE for all</p>
          </div>
        </div>
        <div className="col-lg-4 col-12">
          <div className="hor_section_nospace mt--20 mb--20">
            <Field style={{ maxWidth: "30px" }} type="checkbox" name="isMemberFree" />
            <p className="information">Make event FREE for members only</p>
          </div>
        </div>
        <div className="col-lg-4 col-12">
          <div className="hor_section_nospace mt--20 mb--20">
            <Field style={{ maxWidth: "30px" }} type="checkbox" name="isTicketLink" />
            <p className="information">
              Buy tickets from external platform (outside the website)
            </p>
          </div>
        </div>
      </div>
      {!(values.isSaleClosed || values.isFree) &&
        (values.isTicketLink ? (
          <div className="row">
            <div className="col-12">
              <div className="rn-form-group">
                <Field
                  type="text"
                  placeholder="External Platform Ticket Link"
                  name="ticketLink"
                  className="rn-input"
                />
                <small>*Link will redirect the client outside the website</small>
                <ErrorMessage className="error" name="ticketLink" component="div" />
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-lg-4 col-md-6 col-12">
              <h5 className="mt--10">Basic Price</h5>
              <div className="rn-form-group">
                <Field
                  type="number"
                  placeholder="Price"
                  name="guestPrice"
                  min={1}
                  step="0.01"
                  className="rn-input"
                />
                <ErrorMessage className="error" name="guestPrice" component="div" />
              </div>
              <div className="rn-form-group">
                <Field
                  type="text"
                  placeholder="Including"
                  name="entryIncluding"
                  className="rn-input"
                />
                <ErrorMessage className="error" name="entryIncluding" component="div" />
              </div>
            </div>
            {!values.isMemberFree && (
              <>
                <div className="col-lg-4 col-md-6 col-12">
                  <h5 className="mt--10">Member Price</h5>
                  <div className="rn-form-group">
                    <Field
                      type="number"
                      placeholder="Member Price"
                      name="memberPrice"
                      min={1}
                      step="0.01"
                      className="rn-input"
                    />
                    <ErrorMessage className="error" name="memberPrice" component="div" />
                  </div>
                  <div className="rn-form-group">
                    <Field
                      type="text"
                      placeholder="Including"
                      name="memberIncluding"
                      className="rn-input"
                    />
                    <ErrorMessage className="error" name="memberIncluding" component="div" />
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 col-12">
                  <h5 className="mt--10">Active Member Price</h5>
                  <div className="rn-form-group">
                    <Field
                      type="number"
                      placeholder="Active Member Price"
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
                </div>
              </>
            )}
            <div className="col-12">
              <h3 className="mt--30 label">Variable Price Options</h3>
              <div className="hor_section_nospace mt--20 mb--20">
                <Field style={{ maxWidth: "30px" }} type="checkbox" name="earlyBird[isEnabled]" />
                <p>Add Early Bird Price</p>
              </div>
              <AdditionalPrices
                visible={values.earlyBird.isEnabled}
                label="Early Bird"
                setFieldValue={setFieldValue}
                initialCalendarValue={values.earlyBird.ticketTimer || values.earlyBird.startTimer}
              />
            </div>
            <div className="col-12">
              <div className="hor_section_nospace mt--20 mb--20">
                <Field style={{ maxWidth: "30px" }} type="checkbox" name="lateBird[isEnabled]" />
                <p>Add Late Bird Price</p>
              </div>
              <AdditionalPrices
                visible={values.lateBird.isEnabled}
                label="Late Bird"
                setFieldValue={setFieldValue}
                initialCalendarValue={values.lateBird.ticketTimer || values.lateBird.startTimer}
                withLimit={false}
                timerType={START_TIMER}
              />
            </div>
            <div className="col-12">
              <h3 className="mt--30 label">Promotions</h3>
              <div className="hor_section_nospace mt--20 mb--20">
                <Field
                  style={{ maxWidth: "30px" }}
                  type="checkbox"
                  name="guestPromotion[isEnabled]"
                />
                <p>Add Guest Promotion</p>
              </div>
              <PromotionalPrices
                visible={values.guestPromotion.isEnabled}
                label="Guest Promotion"
                setFieldValue={setFieldValue}
                initialStartValue={values.guestPromotion.startTimer}
                initialEndValue={values.guestPromotion.endTimer}
              />
            </div>
            <div className="col-12">
              <div className="hor_section_nospace mt--20 mb--20">
                <Field
                  style={{ maxWidth: "30px" }}
                  type="checkbox"
                  name="memberPromotion[isEnabled]"
                />
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
        ))}
    </div>
  );
};

export default PriceDetails;
