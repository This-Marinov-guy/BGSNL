import React from 'react'
import { REGIONS } from '../../../util/REGIONS_DESIGN'
import capitalizeFirstLetter from '../../../util/capitalize'

const Filter = () => {
    return (
        <div className="common-border-1">
            <h4>Filter</h4>
            <form className="row">
                <div className="col-lg-6 col-12">
                    <select>
                        <option value="" disabled>
                            Select Region
                        </option>
                        {REGIONS.map((val, index) => {
                            return <option value={val} key={index}>{capitalizeFirstLetter(val)}</option>
                        })}
                    </select>
                </div>
                <div className="col-lg-6 col-12">
                    <select>
                        <option value="" disabled>
                            What to display
                        </option>
                        <option value="current">Current Events</option>
                    </select>
                </div>
            </form>
        </div>
    )
}

export default Filter