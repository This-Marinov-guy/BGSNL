import { useState } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import {
  Dialog,
  Image,
  Tooltip,
} from "@/compat/primereact";
import { FiInfo } from "@/elements/ui/icons/IconlyIcons";
import { useNavigate } from "@/util/navigation";
import { useHttpClient } from "../../../../hooks/common/http-hook";
import {
  loadSingleEventDashboard,
  removeEventFromAll,
} from "../../../../redux/events";
import { showNotification } from "../../../../redux/notification";
import { selectUser } from "../../../../redux/user";
import {
  ACCESS_3,
  EVENT_DELETED,
} from "../../../../util/defines/common";
import { checkAuthorization } from "../../../../util/functions/authorization";
import { capitalizeFirstLetter } from "../../../../util/functions/capitalize";
import {
  formatCorrectedDateTime,
  MOMENT_DATE_TIME,
} from "../../../../util/functions/date";
import ConfirmCenterModal from "../../../ui/modals/ConfirmCenterModal";
import GenerateTicketsModal from "./GenerateTicketsModal";

const EventModal = (props) => {
    const [visible, setVisible] = useState(false);
    const [ticketGeneratorModal, setTicketGeneratorModal] = useState(false);

    const { sendRequest, loading } = useHttpClient();

    const user = useSelector(selectUser);

    const navigate = useNavigate();

    const dispatch = useDispatch();
    const isDraft = props.event.status === "draft";
    const formatOptionalDate = (value) =>
      value ? moment(value).format(MOMENT_DATE_TIME) : "Not set";

    const onDelete = async () => {
        const responseData = await sendRequest(`future-event/delete-event/${props.event.id}`, 'DELETE');

        if (responseData.status) {
            dispatch(showNotification(EVENT_DELETED));
            props.loadData();
            setVisible(false);
            props.setShow(false);
            dispatch(removeEventFromAll({
                region: props.event.region,
                eventId: props.event.id
            }));
        }
    }

    const InfoRow = ({ label, value, highlight = false }) => (
        <div className="info-row" style={{ 
            display: 'flex', 
            padding: '10px 0', 
            borderBottom: '1px solid #f0f0f0',
            alignItems: 'center'
        }}>
            <span style={{ 
                minWidth: '160px',
                color: '#374151'
            }}>
                {label}:
            </span>
            <span style={{ 
                flex: 1,
                color: highlight ? '#059669' : '#6b7280'
            }}>
                {value}
            </span>
        </div>
    );

    const SectionCard = ({ title, children }) => (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
        }}>
            <h4 style={{ 
                marginBottom: '15px',
                color: '#111827',
                paddingBottom: '10px',
                borderBottom: '2px solid #e5e7eb'
            }}>
                {title}
            </h4>
            {children}
        </div>
    );

    return (
      <>
        <ConfirmCenterModal
          text={
            "Deleting an event is an irreversible action! Are you sure you want to delete it?"
          }
          onConfirm={onDelete}
          visible={visible}
          setVisible={setVisible}
          loading={loading}
        />
        <GenerateTicketsModal
          visible={ticketGeneratorModal}
          onHide={() => setTicketGeneratorModal(false)}
          event={props.event}
        />
        <Dialog
          header={
            <div>
              <div style={{ marginBottom: "4px" }}>
                {props.event.title || "Untitled draft"}
              </div>
              <div style={{ color: "#6b7280" }}>
                {capitalizeFirstLetter(props.event.region, true) || "Region not set"} •{" "}
                {formatOptionalDate(props.event.date)}
              </div>
            </div>
          }
          visible={props.show}
          style={{ maxWidth: "95%", width: "900px" }}
          onHide={() => props.setShow(false)}
          dismissableMask
        >
          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            {!isDraft && checkAuthorization(user.token, ACCESS_3) && (
              <button
                onClick={() => setTicketGeneratorModal(true)}
                className="rn-button-style--2 rn-btn-reverse-green"
                style={{
                  flex: "1 1 auto",
                  minWidth: "140px",
                  transition: "all 0.3s ease",
                }}
              >
                Generate Tickets
              </button>
            )}
            <button
              onClick={() => {
                dispatch(loadSingleEventDashboard(props.event));
                navigate(`/user/edit-event/${props.event.id}`);
              }}
              className="rn-button-style--2 rn-btn-reverse-green"
              style={{
                flex: "1 1 auto",
                minWidth: "140px",
                transition: "all 0.3s ease",
              }}
            >
              {isDraft ? "Edit Draft" : "Edit Event"}
            </button>
            <button
              onClick={() => setVisible(true)}
              className="rn-button-style--2 rn-btn-reverse"
              style={{
                flex: "1 1 auto",
                minWidth: "140px",
                transition: "all 0.3s ease",
              }}
            >
              Delete Event
            </button>
          </div>

          <div
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
              paddingRight: "10px",
            }}
          >
            {/* Event Details */}
            <SectionCard title="Event Details">
              <InfoRow
                label="Status"
                value={props.event.status}
                highlight={props.event.status === "active"}
              />
              <InfoRow
                label="Region"
                value={capitalizeFirstLetter(props.event.region) || "Not set"}
              />
              <InfoRow label="Location" value={props.event.location || "Not set"} />
              <InfoRow
                label="Date & Time"
                value={
                  props.event.correctedDate
                    ? formatCorrectedDateTime(props.event.correctedDate)
                    : formatOptionalDate(props.event.date)
                }
              />
              <InfoRow
                label="Subtitle"
                value={props.event.description || "None"}
              />
              <InfoRow
                label="Member Only"
                value={props.event.memberOnly ? "Yes" : "No"}
              />
              <InfoRow
                label="Hidden"
                value={props.event.hidden ? "Yes" : "No"}
              />
            </SectionCard>

            {/* Ticket Information */}
            <SectionCard title="Ticket Settings">
              <InfoRow label="Ticket Limit" value={props.event.ticketLimit ?? "Not set"} />
              <InfoRow
                label="Ticket Timer"
                value={formatOptionalDate(props.event.ticketTimer)}
              />
              <InfoRow
                label="Sale Closed"
                value={props.event.isSaleClosed ? "Yes" : "No"}
              />
              <InfoRow
                label="Extra Inputs"
                value={props.event.extraInputsForm?.length > 0 ? "Yes" : "No"}
              />
              {props.event.subEventDescription && (
                <InfoRow
                  label="Sub-event"
                  value={props.event.subEventDescription}
                />
              )}
            </SectionCard>

            {/* Pricing Information */}
            <SectionCard title="Pricing">
              {props.event.isFree ? (
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#d1fae5",
                    borderRadius: "6px",
                    textAlign: "center",
                  }}
                >
                  <strong style={{ color: "#059669" }}>
                    Event is FREE for everyone
                  </strong>
                </div>
              ) : props.event.ticketLink ? (
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#dbeafe",
                    borderRadius: "6px",
                    textAlign: "center",
                  }}
                >
                  <strong>External Ticketing: </strong>
                  <a
                    href={props.event.ticketLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#2563eb", textDecoration: "underline" }}
                  >
                    Buy Tickets Here
                  </a>
                </div>
              ) : (
                <>
                  <InfoRow
                    label="Event Free"
                    value={props.event.isFree ? "Yes" : "No"}
                  />
                  <InfoRow
                    label="Member Free"
                    value={props.event.isMemberFree ? "Yes" : "No"}
                  />

                  {props.event.product?.guest && (
                    <>
                      <div
                        style={{
                          marginTop: "12px",
                          marginBottom: "8px",
                          color: "#374151",
                        }}
                      >
                        Guest Pricing
                      </div>
                      <InfoRow
                        label="Price"
                        value={`€${props.event.product.guest.price}`}
                        highlight
                      />
                      <InfoRow
                        label="Including"
                        value={props.event.entryIncluding || "Standard entry"}
                      />
                      <InfoRow
                        label="Price ID"
                        value={props.event.product.guest.priceId}
                      />
                    </>
                  )}

                  {!props.event.isMemberFree && props.event.product?.member && (
                    <>
                      <div
                        style={{
                          marginTop: "12px",
                          marginBottom: "8px",
                          color: "#374151",
                        }}
                      >
                        Member Pricing
                      </div>
                      <InfoRow
                        label="Price"
                        value={`€${props.event.product.member.price}`}
                        highlight
                      />
                      <InfoRow
                        label="Including"
                        value={props.event.memberIncluding || "Standard entry"}
                      />
                      <InfoRow
                        label="Price ID"
                        value={props.event.product.member.priceId}
                      />

                      {props.event.product?.activeMember && (
                        <>
                          <div
                            style={{
                              marginTop: "8px",
                              marginBottom: "8px",
                              color: "#374151",
                            }}
                          >
                            Active Member
                          </div>
                          <InfoRow
                            label="Price"
                            value={`€${props.event.product.activeMember.price}`}
                            highlight
                          />
                          <InfoRow
                            label="Price ID"
                            value={props.event.product.activeMember.priceId}
                          />
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </SectionCard>

            {/* Description */}
            <SectionCard title="Event Description">
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px",
                  lineHeight: "1.6",
                  color: "#374151",
                  whiteSpace: "pre-wrap",
                }}
              >
                {props.event.text || "No description provided"}
              </div>
            </SectionCard>

            {/* Images */}
            <SectionCard title="Event Images">
              <Tooltip target=".image-info" />
              <div className="row" style={{ gap: "15px 0" }}>
                <div className="col-lg-4 col-md-6 col-12">
                  <div style={{ textAlign: "center" }}>
                    <p style={{ marginBottom: "8px" }}>
                      Ticket
                    </p>
                    {props.event.ticketImg ? (
                      <Image
                        src={props.event.ticketImg}
                        width="100%"
                        style={{ maxWidth: "250px", borderRadius: "8px" }}
                        alt="ticket"
                        preview
                      />
                    ) : (
                      <span>Not uploaded</span>
                    )}
                  </div>
                </div>

                <div className="col-lg-4 col-md-6 col-12">
                  <div style={{ textAlign: "center" }}>
                    <p style={{ marginBottom: "8px" }}>
                      Poster
                    </p>
                    {props.event.poster ? (
                      <Image
                        src={props.event.poster}
                        width="100%"
                        style={{ maxWidth: "250px", borderRadius: "8px" }}
                        alt="poster"
                        loading="eager"
                        fetchPriority="high"
                        preview
                      />
                    ) : (
                      <span>Not uploaded</span>
                    )}
                  </div>
                </div>

                <div className="col-lg-4 col-md-6 col-12">
                  <div style={{ textAlign: "center" }}>
                    <p style={{ marginBottom: "8px" }}>
                      Background{" "}
                      <FiInfo
                        className="image-info"
                        data-pr-tooltip="Click to expand"
                        data-pr-position="top"
                      />
                    </p>
                    {props.event.bgImageExtra &&
                    props.event?.bgImageSelection === 2 ? (
                      <Image
                        src={props.event.bgImageExtra}
                        width="100%"
                        style={{ maxWidth: "250px", borderRadius: "8px" }}
                        alt="background"
                        preview
                      />
                    ) : (
                      <Image
                        src={`/assets/images/bg/bg-image-${props.event.bgImage}.webp`}
                        width="100%"
                        style={{ maxWidth: "250px", borderRadius: "8px" }}
                        alt="background"
                        preview
                      />
                    )}
                  </div>
                </div>

                {props.event.images?.length > 0 && (
                  <div className="col-12">
                    <p style={{ marginBottom: "12px" }}>
                      Additional Images{" "}
                      <FiInfo
                        className="image-info"
                        data-pr-tooltip="Click to expand"
                        data-pr-position="top"
                      />
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      {props.event.images.map((img, index) => (
                        <Image
                          key={index}
                          width="120px"
                          style={{ borderRadius: "8px" }}
                          src={img}
                          alt={`additional-${index}`}
                          preview
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </Dialog>
      </>
    );
}

EventModal.propTypes = {
    event: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    loadData: PropTypes.func.isRequired
};

export default EventModal
