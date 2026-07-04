import React from 'react'
import { Redirect, Route, useLocation } from 'react-router-dom';
import {
    isPublicRegionSlug,
    resolveRegionSlug,
} from '../../util/defines/REGIONS_DESIGN';
import styles from './RegionLayout.module.css'

const RegionParamRoute = ({ component: Component, ...rest }) => {
    const region = useLocation().pathname.split('/')[1]
    const regionKey = resolveRegionSlug(region)

    return isPublicRegionSlug(region) ? <Route
    {...rest}
    render={(props) => (
        <div className={styles[regionKey] || ''}>
            <Component {...props} />
        </div>
    )}
/> : <Redirect to="/404" />
}

export default RegionParamRoute
