import React from "react";
import { Link } from 'react-router-dom'
import { REGIONS } from "../util/REGIONS_DESIGN";

const RegionLogos = () => {
    return (
        <div className="rn-brand-area brand_logos" style={{marginBottom:'-20px'}}>
            <ul className="brand-style-3">
                {REGIONS.map((r, i) => {
                    return <li key={i}>
                        <Link to={`./${r}`}><img src={`/assets/images/logo/${r}.jpg`} alt="Logo Images" /></Link>
                    </li>
                })}
            </ul>
        </div>

    )
}
export default RegionLogos;