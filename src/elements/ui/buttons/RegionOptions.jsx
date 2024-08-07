import React, { useState } from 'react'
import styles from '../../../component/functional/RegionLayout.module.css'
import { Link, useParams } from 'react-router-dom'
import {capitalizeFirstLetter} from '../../../util/functions/capitalize'
import { REGIONS } from '../../../util/defines/REGIONS_DESIGN'

const RegionOptions = (props) => {
    const { region } = useParams();
    const [select, setSelected] = useState(region || null)

    return (
        <div className="mt--100" style={{ height: '45vh' }}>
            <h3 style={{ textAlign: 'center', fontFamily: 'Archive' }}>{region ? `Welcome to ${capitalizeFirstLetter(region)}` : 'Choose your Region'}</h3>
            <ul className="brand-style-2">
                {REGIONS.map((r, index) => {
                    return <li key={index} className={(region && r != select) ? styles['disable'] : styles[r]}>
                        <Link to={`/${r}/${props.to}`}>
                            <button
                            //  style={r != select ? {opacity: '50%'} : {}}
                                className={' rn-button-style--2 rn-btn-reverse-green'}
                                onClick={() => setSelected(r)}>{r}</button>
                        </Link>
                    </li>
                })}

            </ul>
        </div>
    )
}

export default RegionOptions