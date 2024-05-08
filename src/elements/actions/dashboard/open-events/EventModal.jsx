import React from 'react'
import { Dialog } from 'primereact/dialog';
import { Link } from 'react-router-dom';

const EventModal = (props) => {
    const event = props.event

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
                <p>Status: </p>
                <p>Region: </p>
                <p>Title: </p>
                <p>Descriptions: </p>
                <p>Date: </p>
                <p>Time: </p>
                <p>Location: </p>
                <p>Ticket Timer: </p>
                <p>Ticket Limit: </p>
                <p>Is it only for members: </p>
                <p>Extra Inputs Required: </p>
                <p>Sub-event: </p>
                <p>Text for the event: </p>

                <h3>Price Info</h3>
                <hr />
                <p>Is the sale closed: </p>
                <p>Is the Event Free: </p>
                <p>Is the Event Member Free: </p>
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