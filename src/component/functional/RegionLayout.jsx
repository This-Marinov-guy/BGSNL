import React, { Fragment } from 'react'
import { Navigate, useLocation } from 'react-router-dom';
import { REGIONS } from '../../util/REGIONS_DESIGN';
import styles from './RegionLayout.module.css'

const RegionLayout = (props) => {
    const region = useLocation().pathname.split('/')[1]

    return REGIONS.includes(region) ?
        <div className={styles[region] || ''}>
            {props.children}
        </div> : <Navigate to={props.redirect} replace />
}

RegionLayout.defaultProps = {
    redirect: '/404',
}

export default RegionLayout
