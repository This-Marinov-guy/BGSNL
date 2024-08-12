import React from 'react'
import { Dialog } from 'primereact/dialog';

const LongLoading = ({ visible }) => {
    return (
        <Dialog
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

export default LongLoading