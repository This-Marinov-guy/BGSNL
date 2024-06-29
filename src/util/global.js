import { clarity } from 'react-microsoft-clarity';

export const isProd = () => {
    return process.env.NODE_ENV === 'production'
}

export const removeLogsOnProd = () => {
    if (isProd()) {
        console.error = () => { }
        console.debug = () => { }
    }
}

export const askBeforeRedirect = (basedOnEnv = true) => {
    const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = ''; // This is needed for older browsers
    };

    if (basedOnEnv && isProd()) {
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }
}

export const clarityTrack = () => {
    if (isProd()) {
        clarity.init(process.env.REACT_APP_CLARITY_ID);
        clarity.consent();

        if (clarity.hasStarted()) {
            console.log('Track with Clarity');
            // clarity.identify('USER_ID', { userProperty: 'value' });
        }
    }
}

export const stringToUrl = (str) => {
    // Convert the string to lowercase
    let urlString = str.toLowerCase();
    // Replace spaces with underscores
    urlString = urlString.replace(/ /g, '_');
    // Encode special characters
    urlString = encodeURIComponent(urlString);
    return urlString;
}

export const urlToString = (urlString) => {
    // Decode special characters
    let originalString = decodeURIComponent(urlString);
    // Replace underscores with spaces
    originalString = originalString.replace(/_/g, ' ');
    // Return the original string
    return originalString;
}
