import { useState, useEffect } from 'react';

const useBreakdown = () => {
    const [breakdown, setBreakdown] = useState(getBreakdown(window.innerWidth));

    useEffect(() => {
        const handleResize = () => {
            setBreakdown(getBreakdown(window.innerWidth));
        };

        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return breakdown;
};

const getBreakdown = (width) => {
    if (width < 480) {
        return 'sm';
    } else if (width >= 480 && width <= 1200) {
        return 'md';
    } else {
        return 'lg';
    }
};

export default useBreakdown;
