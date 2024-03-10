import React from 'react'
import styles from '../../component/functional/RegionLayout.module.css'
import { Link, useParams } from 'react-router-dom'
import capitalizeFirstLetter from '../../util/capitalize'
import { REGIONS_MEMBERSHIP } from '../../util/REGIONS_AUTH_CONFIG'

const RegionOptions = (props) => {

    const {region} = useParams();
    
  return (
    <div className="mt--200">
                <h3 style={{ textAlign: 'center', fontFamily: 'Archive' }}>{region ? `Welcome to ${capitalizeFirstLetter(region)}` : 'Choose your Region'}</h3>
                <ul className="brand-style-2">
                {REGIONS_MEMBERSHIP.map((region, index) => {
                    return <li key={index} className={styles[region]}>
                        <Link to={`/${region}/${props.to}`}>
                            <button  className={' rn-button-style--2 btn-solid'}>{region}</button>
                        </Link>
                    </li>
                })}
                   
                </ul>
            </div>
  )
}

export default RegionOptions