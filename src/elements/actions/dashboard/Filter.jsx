import React from 'react'
import { REGIONS } from '../../../util/defines/REGIONS_DESIGN'
import { capitalizeFirstLetter } from '../../../util/functions/capitalize'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

const PAGES = [
    { label: 'Members', path: '/user/members' },
    { label: 'Events', path: '/user/dashboard' },
    { label: 'Event Analysis', path: '/user/events-analytics' },
];

const Filter = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleRegionChange = (event) => {
        setSearchParams({ region: event.target.value });
    };

    const handlePageChange = (event) => {
        const region = searchParams.get('region');
        const query = region ? `?region=${region}` : '';
        navigate(event.target.value + query);
    };

    return (
        <div className="common-border-1">
            <h4>Filter</h4>
            <form className="row">
                <div className="col-lg-6 col-12">
                    <select defaultValue={searchParams.get("region") || ''} onChange={handleRegionChange}>
                        <option value="" disabled>Select Region</option>
                        <option value="">All</option>
                        {REGIONS.map((val, index) => (
                            <option value={val} key={index}>{capitalizeFirstLetter(val, true)}</option>
                        ))}
                    </select>
                </div>
                <div className="col-lg-6 col-12">
                    <select value={pathname} onChange={handlePageChange}>
                        <option value="" disabled>What to display</option>
                        {PAGES.map(({ label, path }) => (
                            <option value={path} key={path}>{label}</option>
                        ))}
                    </select>
                </div>
            </form>
        </div>
    )
}

export default Filter