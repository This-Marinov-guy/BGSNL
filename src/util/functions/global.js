export const isProd = () => {
    return process.env.NODE_ENV === 'production'
}

export const removeLogsOnProd = () => {
    if (isProd()) {
        console.error = () => { }
        console.debug = () => { }
    }
}

export const clarityTrack = () => {
    if (!isProd()) {
        return;
    }

    clarity.init(process.env.REACT_APP_CLARITY_ID);
    clarity.consent();

    if (clarity.hasStarted()) {
        console.log('Track with Clarity');
        // clarity.identify('USER_ID', { userProperty: 'value' });
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

export const encodeForURL = (string) => {
    let encodedString = inputString.toLowerCase().replace(/ /g, '_');

    return encodeURIComponent(encodedString);
}

export const decodeFromURL = (url) => {
    const decodedString = inputString.replace(/_/g, ' ').replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });

    return decodeURIComponent(decodedString);
}
