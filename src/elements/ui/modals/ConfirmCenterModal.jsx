import React from 'react'
import { Dialog } from 'primereact/dialog';
import { useHttpClient } from '../../../hooks/http-hook';
import Loader from '../Loader';

const ConfirmCenterModal = (props) => {
    const { loading } = useHttpClient

    const footerContent = loading ? <Loader /> : (
        <div className='mt--10'>
            <button
                onClick={() => props.setVisible(false)}
                className="rn-button-style--2 rn-btn-reverse mr--5">No</button>
            <button
                onClick={() => props.onConfirm()}
                className="rn-button-style--2 btn-solid"
            >Yes</button>
        </div>);

    return (
        <Dialog header="Confirmation needed" visible={props.visible} style={{ maxWidth: '80%' }} onHide={() => props.setVisible(false)} footer={footerContent}>
            <p className="m-0">
                {props.text}
            </p>
        </Dialog>
    )
}

export default ConfirmCenterModal