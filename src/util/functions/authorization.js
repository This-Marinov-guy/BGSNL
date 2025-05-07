import { hasOverlap } from "./helpers";

export const decodeJWT = (token) => {
    try {
        const [header, payload, signature] = token.split('.');
    
        const decodedPayload = atob(payload);
    
        const decodedPayloadJSON = JSON.parse(decodedPayload);
    
        return decodedPayloadJSON;
    } catch (err) {
        return null;
    }
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

    const user = decodeJWT(token);
    
    const userRoles = user?.roles ?? [];

    if (userRoles && hasOverlap(userRoles, roles)) {
        return true;
    } else {
        return false;
    }
}