import { SelectInput } from "@/compat/primereact";
import React from 'react'
import FilterPanel from "@/elements/ui/filters/FilterPanel";
import PropTypes from 'prop-types'
import { REGIONS } from '../../../util/defines/REGIONS_DESIGN'
import { capitalizeFirstLetter } from '../../../util/functions/capitalize'
import { useFilterSearchParams } from "@/hooks/common/use-filter-search-params";

const Filter = ({ regions = REGIONS, showRegion = true, children, onClear, title = "Event filters" }) => {
    const [searchParams, setSearchParams] = useFilterSearchParams();

    const handleRegionChange = (event) => {
        setSearchParams((current) => {
            if (event.target.value) current.set("region", event.target.value);
            else current.delete("region");
            return current;
        });
    };

    return (
        <FilterPanel
            className="event-dashboard-filters"
            controlsClassName="event-dashboard-filters__fields"
            title={title}
            onClear={() => {
            setSearchParams(current => { current.delete("region"); return current; });
            onClear?.();
        }}>
                {showRegion && <label>
                    <span>Region</span>
                    <SelectInput value={searchParams.get("region") || ''} onChange={handleRegionChange}>
                        <option value="">All</option>
                        {regions.map((val, index) => (
                            <option value={val} key={index}>{capitalizeFirstLetter(val, true)}</option>
                        ))}
                    </SelectInput>
                </label>}
                {children}
        </FilterPanel>
    )
}

Filter.propTypes = {
    regions: PropTypes.arrayOf(PropTypes.string),
    showRegion: PropTypes.bool,
    children: PropTypes.node,
    onClear: PropTypes.func,
    title: PropTypes.string,
};

export default Filter
