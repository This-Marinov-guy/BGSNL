import React from 'react'
import { Dialog } from 'primereact/dialog';
import { useHttpClient } from '../../../hooks/http-hook';
import Loader from '../loading/Loader';

const ConfirmCenterModal = (props) => {
    const footerContent = <div className='mt--10 center_div'>
        <button
            onClick={() => props.setVisible(false)}
            className="rn-button-style--2 rn-btn-reverse mr--5">No</button>
        <button
            onClick={() => props.onConfirm()}
            className="rn-button-style--2 rn-btn-reverse-green"
        >Yes</button>
    </div>

    return (
        <Dialog header="Confirmation needed" visible={props.visible} style={{ maxWidth: '80%' }} onHide={() => props.setVisible(false)} footer={!props.loading && footerContent}>
            {props.loading ? <Loader /> : <p className="m-0">
                {props.text}
            </p>}
        </Dialog>
    )
}

export default ConfirmCenterModal