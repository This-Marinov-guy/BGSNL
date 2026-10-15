import React from 'react'
import { Dialog } from "@/compat/primereact";
import PropTypes from "prop-types";
import Loader from '../loading/Loader';

const ConfirmCenterModal = ({ visible, setVisible, loading = false, onConfirm, text,
    title = "Confirmation needed", confirmLabel = "Yes", cancelLabel = "No", destructive = false }) => {
    const footerContent = <div className='mt--10 center_div'>
        <button
            type="button"
            onClick={() => setVisible(false)}
            className="rn-button-style--2 rn-btn-reverse mr--5"
            autoFocus>{cancelLabel}</button>
        <button
            type="button"
            onClick={onConfirm}
            className={`rn-button-style--2 ${destructive ? "rn-btn-red" : "rn-btn-reverse-green"}`}
            style={destructive ? { background: "#a61b35", borderColor: "#a61b35", color: "#fff" } : undefined}
        >{confirmLabel}</button>
    </div>

    return (
        <Dialog header={title} visible={visible} style={{ maxWidth: '80%' }} onHide={() => { if (!loading) setVisible(false); }} footer={!loading && footerContent}>
            {loading ? <Loader /> : <p className="m-0">
                {text}
            </p>}
        </Dialog>
    )
}

ConfirmCenterModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    onConfirm: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    title: PropTypes.string,
    confirmLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    destructive: PropTypes.bool,
};

export default ConfirmCenterModal
