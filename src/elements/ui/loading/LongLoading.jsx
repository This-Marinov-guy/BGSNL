import React from 'react'
import PropTypes from "prop-types";
import { Dialog } from "@/compat/primereact";

const LongLoading = ({ visible }) => {
    return (
        <Dialog
            header="Please wait"
            visible={visible}
            modal blockScroll closable={false} closeOnEscape={false} draggable={false}
        >
            <div className="center_div_col">
                <img
                    src='https://media1.tenor.com/images/fc8442a618ad1ef0485d894d64b2b077/tenor.gif'
                    alt='loading'
                />
                <p className='mt--10'>Please stand by - you will be ready shortly!</p>
            </div>
        </Dialog>
    )
}

LongLoading.propTypes = {
    visible: PropTypes.bool.isRequired,
};

export default LongLoading
