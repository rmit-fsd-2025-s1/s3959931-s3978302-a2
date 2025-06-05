/**
 * Date utility functions for Melbourne timezone
 * Melbourne timezone: Australia/Melbourne (UTC+10/UTC+11 with DST)
 */

const MELBOURNE_TIMEZONE = 'Australia/Melbourne';

/**
 * Get current date/time in Melbourne timezone
 */
export const getMelbourneTime = (): Date => {
    return new Date(new Date().toLocaleString("en-US", { timeZone: MELBOURNE_TIMEZONE }));
};

/**
 * Get Melbourne time as ISO string with timezone info
 */
export const getMelbourneISOString = (): string => {
    const melbourneTime = getMelbourneTime();
    return melbourneTime.toISOString();
};

/**
 * Get Melbourne timestamp for database operations
 */
export const getMelbourneTimestamp = (): string => {
    return getMelbourneISOString();
};

/**
 * Format date for Melbourne timezone display
 */
export const formatMelbourneDate = (date?: Date | string, format: 'full' | 'date' | 'time' = 'full'): string => {
    const targetDate = date ? new Date(date) : getMelbourneTime();

    const options: Intl.DateTimeFormatOptions = {
        timeZone: MELBOURNE_TIMEZONE,
    };

    switch (format) {
        case 'date':
            options.year = 'numeric';
            options.month = '2-digit';
            options.day = '2-digit';
            break;
        case 'time':
            options.hour = '2-digit';
            options.minute = '2-digit';
            options.second = '2-digit';
            break;
        case 'full':
        default:
            options.year = 'numeric';
            options.month = '2-digit';
            options.day = '2-digit';
            options.hour = '2-digit';
            options.minute = '2-digit';
            options.second = '2-digit';
            break;
    }

    return targetDate.toLocaleString('en-AU', options);
};

/**
 * Get date only in Melbourne timezone (YYYY-MM-DD format)
 */
export const getMelbourneDateOnly = (): string => {
    const melbourneTime = getMelbourneTime();
    const year = melbourneTime.getFullYear();
    const month = String(melbourneTime.getMonth() + 1).padStart(2, '0');
    const day = String(melbourneTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Convert UTC timestamp to Melbourne timezone display
 */
export const utcToMelbourne = (utcTimestamp: string | Date): string => {
    const date = new Date(utcTimestamp);
    return formatMelbourneDate(date);
};

/**
 * Get timezone offset for Melbourne
 */
export const getMelbourneOffset = (): string => {
    const melbourneTime = new Date().toLocaleString("en-US", {
        timeZone: MELBOURNE_TIMEZONE,
        timeZoneName: 'short'
    });

    // Extract timezone info
    const offsetMatch = melbourneTime.match(/GMT([+-]\d{1,2})/);
    return offsetMatch ? offsetMatch[1] : '+10';
};

/**
 * Log timestamp in Melbourne timezone
 */
export const logWithMelbourneTime = (message: string): void => {
    const timestamp = formatMelbourneDate();
    console.log(`[${timestamp} AEST/AEDT] ${message}`);
}; 