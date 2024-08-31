import React from "react";
import { ProgressSpinner } from 'primereact/progressspinner';

const Loader = () => {
  return (
    <div style={{ margin: 'auto', width: '7em' }} className="center_div disabled">
      <span style={{ marginRight: "-5px" }}>Loading </span>
      <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8" animationDuration=".5s" />
    </div>
  );
};

export default Loader;
