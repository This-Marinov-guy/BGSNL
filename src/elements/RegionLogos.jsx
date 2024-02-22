import React, { Component } from "react";
import {Link} from 'react-router-dom'

class RegionLogos extends Component {
    render() {
        return (
            <div className="rn-brand-area brand_logos">
                <ul className="brand-style-3">
                    <li>
                        <Link to='./groningen' target='_blank'><img src="/assets/images/logo/groningen.jpg" alt="Logo Images" /></Link>
                    </li>
                    <li>
                        <Link to='./rotterdam' target='_blank'><img src="/assets/images/logo/rotterdam.jpg" alt="Logo Images" /></Link>
                    </li>
                    <li>
                        <Link to='./leeuwarden' target='_blank'><img src="/assets/images/logo/leeuwarden.jpg" alt="Logo Images" /></Link>
                    </li>
                    <li>
                        <Link to='./amsterdam' target='_blank'><img src="/assets/images/logo/amsterdam.jpg" alt="Logo Images" /></Link>
                    </li>
                    <li>
                        <Link to='./breda' target='_blank'><img src="/assets/images/logo/breda.jpg" alt="Logo Images" /></Link>
                    </li>
                    <li>
                        <Link to='./maastricht' target='_blank'><img src="/assets/images/logo/maastricht.jpg" alt="Logo Images" /></Link>
                    </li>
                </ul>
            </div>

        )
    }
}
export default RegionLogos;