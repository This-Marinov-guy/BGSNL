export const capitalizeFirstLetter = (string) => {    
    if (!string) return "";

    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const capitalizeAfterSpace = (string) => {
    if (!string) return "";

    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export const replaceSpaceWithNewLine = (string) => {
    if (!string) return "";
    
    return string.replace(/ /g, '\n');
}