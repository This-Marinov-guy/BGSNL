import { SelectInput } from "@/compat/primereact";
import React from 'react'
import PropTypes from 'prop-types'
import { REGIONS } from '../../../util/defines/REGIONS_DESIGN'
import { capitalizeFirstLetter } from '../../../util/functions/capitalize'
import { useSearchParams } from "@/util/navigation";

const Filter = ({ regions = REGIONS }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const handleRegionChange = (event) => {
        setSearchParams((current) => {
            if (event.target.value) current.set("region", event.target.value);
            else current.delete("region");
            return current;
        });
    };

    return (
        <aside className="event-dashboard-filters" aria-label="Dashboard filters">
            <form>
                <label>
                    <span>Region</span>
                    <SelectInput value={searchParams.get("region") || ''} onChange={handleRegionChange}>
                        <option value="">All</option>
                        {regions.map((val, index) => (
                            <option value={val} key={index}>{capitalizeFirstLetter(val, true)}</option>
                        ))}
                    </SelectInput>
                </label>
            </form>
        </aside>
    )
}

Filter.propTypes = {
    regions: PropTypes.arrayOf(PropTypes.string),
};

export default Filter
