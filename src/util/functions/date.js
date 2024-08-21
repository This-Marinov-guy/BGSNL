
export const dateConvertor = (date, time, getAsValue = false) => {
    // Ensure date is a Date object
    date = new Date(date);

    // Parse time string if it's not a Date object
    if (!(time instanceof Date)) {
        const [hours, minutes] = time.split(':').map(Number);
        time = new Date();
        time.setUTCHours(hours, minutes, 0, 0);
    }

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();

    const hours = time.getUTCHours();
    const minutes = time.getUTCMinutes();
    const seconds = time.getUTCSeconds();
    const milliseconds = time.getUTCMilliseconds();

    const combinedDateTime = new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds));

    // Creating Date object
    return getAsValue ? combinedDateTime.valueOf() : combinedDateTime.toISOString();
}

export const yearsSinceBirthday = (birthDate) => {
    const birth = new Date(birthDate);
    const now = new Date();

    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    const dayDiff = now.getDate() - birth.getDate();

    // If birthday hasn't occurred this year yet, subtract a year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age;
}

export const TIME_OPTIONS = {
    timeZone: 'Europe/Amsterdam',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Use 24-hour format
};