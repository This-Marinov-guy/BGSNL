import { hasOverlap } from "./helpers";

export const decodeJWT = (token) => {
    const [header, payload, signature] = token.split('.');

    const decodedPayload = atob(payload);

    const decodedPayloadJSON = JSON.parse(decodedPayload);

    return decodedPayloadJSON;
}

export const isTokenExpired = (token) => {
    const {exp} = decodeJWT(token);

    const currentTime = Math.floor(Date.now() / 1000); 
    return exp < currentTime; 
}

export const checkAuthorization = (token, roles) => {
    if (!token) {
        return false;
    }
    
    const userRoles = decodeJWT(token)['roles'];

    if (userRoles && hasOverlap(userRoles, roles)) {
        return true;
    } else {
        return false;
    }
}