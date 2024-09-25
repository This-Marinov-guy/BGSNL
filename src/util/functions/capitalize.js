export const capitalizeFirstLetter = (string) => {
    if (!string) return string;
    
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const capitalizeAfterSpace = (string) => {
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export const replaceSpaceWithNewLine = (string) => {
    return string.replace(/ /g, '\n');
}