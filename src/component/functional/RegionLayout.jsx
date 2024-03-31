import React, { Fragment } from 'react'
import { Navigate, useLocation } from 'react-router-dom';
import { REGIONS } from '../../util/REGIONS_DESIGN';
import styles from './RegionLayout.module.css'

const RegionLayout = (props) => {
    const region = useLocation().pathname.split('/')[1]
    const isRegionIncluded = REGIONS.includes(region)
    const redirectComp = <Navigate to={props.redirect} replace />

    if (props.optionalRegion && !region) {
        return !isRegionIncluded ? <Fragment>
            {props.children}
        </Fragment> : redirectComp
    } else {
        return isRegionIncluded ?
            <div className={styles[region] || ''}>
                {props.children}
            </div> : redirectComp
    }
}

RegionLayout.defaultProps = {
    redirect: '/404',
    optionalRegion: false
}

export default RegionLayout
