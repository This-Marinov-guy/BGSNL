export const decodeJWT = (token) => {
    const [header, payload, signature] = token.split('.');

    const decodedPayload = atob(payload);

    const decodedPayloadJSON = JSON.parse(decodedPayload);

    return decodedPayloadJSON;
}
