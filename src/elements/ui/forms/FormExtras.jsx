import React from "react";

const FormExtras = ({target}) => {
    return (
        <div className="row container mt--40">
            {target.map((input) => {return input.element})}
        </div>
    )
}

export default FormExtras