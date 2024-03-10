import React from 'react'
import { Navigate, useLocation } from 'react-router-dom';
import { REGIONS } from '../../util/REGIONS_DESIGN';
import styles from './RegionLayout.module.css'

const RegionLayout = ({ children }) => {
    const region = useLocation().pathname.split('/')[1]

    return REGIONS.includes(region) ?
        <div className={styles[region] || ''}>
            {children}
        </div> : <Navigate to="/404" replace />
}

export default RegionLayout
