import React from "react";
import { ProgressSpinner } from 'primereact/progressspinner';

const Loader = (props) => {
  return (
    <div style={props.center && { margin: 'auto' }} className="hor_section_nospace">
      <span style={{ marginRight: "10px" }}>Processing </span>
      <ProgressSpinner style={{width: '20px', height: '20px'}} strokeWidth="8" animationDuration=".5s" />

    </div>
  );
};

export default Loader;
