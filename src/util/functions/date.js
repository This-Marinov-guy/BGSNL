
// type 15th May 24 10:27
export const dateConvertor = (dateString, getAsValue = false) => {
    // Extracting components
    const parts = dateString.split(' ');

    // Extracting day and month
    const day = parseInt(parts[0]); // Extract day as number
    const monthName = parts[1]; // Extract month name

    // Converting month name to month number
    const monthMap = {
        "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
        "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
    };
    const month = monthMap[monthName];

    // Extracting year, hours, and minutes
    const year = parseInt(parts[2]);
    const hours = parseInt(parts[3].split(':')[0]);
    const minutes = parseInt(parts[3].split(':')[1]);

    // Creating Date object
    return getAsValue ? new Date(year, month, day, hours, minutes).valueOf : new Date(year, month, day, hours, minutes);
}