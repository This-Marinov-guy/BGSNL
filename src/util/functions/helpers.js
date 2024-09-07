import { clarity } from 'react-microsoft-clarity';
import Resizer from "react-image-file-resizer";
import CryptoJS from 'crypto-js';
import { checkAuthorization } from './authorization';
import { ACCESS_3 } from '../defines/defines';

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

    return encryptedData;
}

export const decryptData = (string) => {
    if (!string) {
        return null;
    }

    let decryptedData;

    try {
        const decryptedBytes = CryptoJS.AES.decrypt(decodeURIComponent(string), process.env.REACT_APP_ENCRYPTION_KEY);
        decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
    } catch (err) {
        return null;
    }

    return decryptedData;
}

export const estimatePriceByEvent = (selectedEvent, user = {}, blockDiscounts = false) => {
    let price;
    const {product} = selectedEvent

    const isMember = user && !!user.token;
    const isActiveMember = isMember && checkAuthorization(user.token, ACCESS_3);
    const isMemberDataFull = user?.name && user?.surname && user?.email; 

    if (selectedEvent.isFree) {
        price = 'FREE'
    } else if (selectedEvent.ticketLink) {
        price = 'Check ticket portal'
    } else if (isActiveMember && product?.activeMember.price) {
        price = product?.activeMember.price + (!isNaN(product?.activeMember.price) ? ' euro (extra discounted)' : ' ') + ((selectedEvent.including && selectedEvent.including.length > 1) ? selectedEvent.including[1] : '')
    } else if (isMember && (product?.member.price || selectedEvent.isMemberFree)) {
        price = selectedEvent.isMemberFree ? 'FREE'
            : product?.member.price + (!isNaN(product?.member.price) ? ' euro (discounted)' : ' ') + ((selectedEvent.including && selectedEvent.including.length > 0) ? selectedEvent.including[0] : '')
    } else if (product?.guest.price) {
        price = product?.guest.price + (!isNaN(product?.guest.price) ? ' euro ' : ' ') + ((selectedEvent.including && selectedEvent.including.length > 1) ? selectedEvent.including[1] : '')
    } else {
        price = 'TBA'
    }

    if (!blockDiscounts && isMemberDataFull && selectedEvent.activeMemberPriceId && selectedEvent.discountPass.length > 0 && (selectedEvent.discountPass.includes(user.email) || selectedEvent.discountPass.includes(user.name + ' ' + user.surname))) {
        price = product?.activeMember.price + (!isNaN(product?.activeMember.price) ? ' euro ' : ' ') + ((selectedEvent.including && selectedEvent.including.length > 1) ? selectedEvent.including[1] : '');
    }

    if (!blockDiscounts && isMemberDataFull && selectedEvent.freePass.length > 0 && (selectedEvent.freePass.includes(user.email) || selectedEvent.freePass.includes(user.name + ' ' + user.surname))) {
        price = 'FREE';
    }

    return price;
}

export const checkObjectOfArraysEmpty = (obj) => {
    const allArrays = Object.values(obj);
    return allArrays.every((arr) => arr.length === 0);
};

export const resizeFile = (file , width = 1500, height= 485, format = 'WEBP') =>
    new Promise((resolve) => {
        Resizer.imageFileResizer(
            file,
            width,
            height,
            format,
            100,
            0,
            (uri) => {
                resolve(uri);
            },
            "blob"
        );
    });

export const hasOverlap = (array1, array2) => {
    const set = new Set(array2);
    for (let item of array1) {
        if (set.has(item)) return true;
    }
    return false;
}

export const removeSpaces = (input) => {
    return input.replace(/\s+/g, '');
}

export const removeSpacesAndLowercase = (str) => {
    return str.replace(/\s+/g, '').toLowerCase();
}
