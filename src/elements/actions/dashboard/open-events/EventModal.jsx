import React from 'react'
import { Dialog } from 'primereact/dialog';
import { Link } from 'react-router-dom';

const EventModal = (props) => {
    return (
        <Dialog header="Rotterdam | Beach Party | 10th May 10:00" visible={props.show} style={{ maxWidth: '90%' }} onHide={() => props.setShow(false)} dismissableMask>
            <div className="options-btns-div">
                <Link
                    to={`/user/edit-event/{1}`}
                    className="rn-button-style--2 btn-solid"
                >
                    Edit
                </Link>
                <button
                    className="rn-button-style--2 rn-btn-reverse"
                >
                    Delete
                </button>
            </div>
            <div>
                <h3>Main Info</h3>
                <hr />
                <p>Status: {props.event.status}</p>
                <p>Region: {props.event.region}</p>
                <p>Title: {props.event.title}</p>
                <p>Descriptions: {props.event.description}</p>
                <p>Date: {props.event.date}</p>
                <p>Time: {props.event.time}</p>
                <p>Location: {props.event.location}</p>
                <p>Ticket Timer: {props.event.ticketTimer}</p>
                <p>Ticket Limit: {props.event.ticketLimit}</p>
                <p>Is it only for members: {props.event.memberOnly ? 'Yes' : 'No'}</p>
                <p>Extra Inputs Required: {!!props.event.extraInputsForm ? 'Yes' : 'No'}</p>
                <p>Sub-event: {props.event.subEventDescription || 'None'}</p>
                <p>Text for the event: {props.event.text}</p>

                <h3>Price Info</h3>
                <hr />
                <p>Is the sale closed: {props.event.isSaleClosed}</p>
                <p>Is the Event Free: {props.event.isFree}</p>
                <p>Is the Event Member Free:{props.event.isMemberFree} </p>
                <p>Price for guests: </p>
                <p>Price for members: </p>
                <p>Price for active members: </p>
                <p>Price for guests: </p>
                <p>Free Pass List: </p>
                <p>Discount Pass List: </p>

                <h3>Images</h3>
                <hr />
                <p>Images: </p>
                <p>Ticket: </p>
                <p>Poster: </p>
                <p>Background: </p>


            </div>
        </Dialog>
    )
}

export default EventModal