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
        </Dialog>
    )
}

export default EventModal