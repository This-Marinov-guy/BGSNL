import { clarity } from 'react-microsoft-clarity';
import CryptoJS from 'crypto-js';

export const isProd = () => {
    return process.env.NODE_ENV === 'production'
}

export const removeLogsOnProd = () => {
    if (isProd()) {
        console.error = () => { };
        console.warn = () => { };
        console.debug = () => { };
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
    let encodedString = string.toLowerCase().replace(/ /g, '_');

    return encodeURIComponent(encodedString);
}

export const decodeFromURL = (url) => {
    const decodedString = url.replace(/_/g, ' ').replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });

    return decodeURIComponent(decodedString);
}

export const encryptData = (data) => {
    if (!data) {
        return '';
    }

    const stringifiedData = JSON.stringify(data);
    const encryptedData = CryptoJS.AES.encrypt(stringifiedData, process.env.REACT_APP_ENCRYPTION_KEY).toString();
    const encodedData = encodeURIComponent(encryptedData);

    return encodedData;
}

export const decryptData = (string) => {
    if (!string) {
        return {};
    }

    const decryptedBytes = CryptoJS.AES.decrypt(decodeURIComponent(string), process.env.REACT_APP_ENCRYPTION_KEY);
    const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

    return decryptedData;
}

export const estimatePriceByEvent = (selectedEvent, user = {}) => {
    let price; 

    if (selectedEvent.isFree) {
        price = 'FREE'
    } else if (selectedEvent.ticketLink) {
        price = 'Check ticket portal'
    } else if (user && !!user.token && (selectedEvent.memberEntry || selectedEvent.isMemberFree)) {
        price = selectedEvent.isMemberFree ? 'FREE'
            : selectedEvent.memberEntry + (!isNaN(selectedEvent.memberEntry) ? ' euro ' : ' ') + ((selectedEvent.including && selectedEvent.including.length > 0) ? selectedEvent.including[0] : '')
    } else if (selectedEvent.entry) {
        price = selectedEvent.entry + (!isNaN(selectedEvent.entry) ? ' euro ' : ' ') + ((selectedEvent.including && selectedEvent.including.length > 1) ? selectedEvent.including[1] : '')
    } else {
        price = 'TBA'
    }

    return price;
}

export const checkObjectOfArraysEmpty = (obj) => {
    const allArrays = Object.values(obj);
    return allArrays.every((arr) => arr.length === 0);
};