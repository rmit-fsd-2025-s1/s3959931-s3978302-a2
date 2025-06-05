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
 * Get Melbourne time as ISO string
 */
export const getMelbourneISOString = (): string => {
    const melbourneTime = getMelbourneTime();
    return melbourneTime.toISOString();
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
 * Format date for Melbourne timezone display
 */
export const formatMelbourneDate = (
    date?: Date | string,
    format: 'full' | 'date' | 'time' | 'datetime' = 'full'
): string => {
    const targetDate = date ? new Date(date) : getMelbourneTime();

    const options: Intl.DateTimeFormatOptions = {
        timeZone: MELBOURNE_TIMEZONE,
    };

    switch (format) {
        case 'date':
            options.year = 'numeric';
            options.month = '2-digit';
            options.day = '2-digit';
            return targetDate.toLocaleDateString('en-AU', options);
        case 'time':
            options.hour = '2-digit';
            options.minute = '2-digit';
            options.second = '2-digit';
            return targetDate.toLocaleTimeString('en-AU', options);
        case 'datetime':
            options.year = 'numeric';
            options.month = '2-digit';
            options.day = '2-digit';
            options.hour = '2-digit';
            options.minute = '2-digit';
            return targetDate.toLocaleString('en-AU', options);
        case 'full':
        default:
            options.year = 'numeric';
            options.month = '2-digit';
            options.day = '2-digit';
            options.hour = '2-digit';
            options.minute = '2-digit';
            options.second = '2-digit';
            return targetDate.toLocaleString('en-AU', options);
    }
};

/**
 * Convert UTC timestamp to Melbourne timezone display
 */
export const utcToMelbourne = (utcTimestamp: string | Date): string => {
    const date = new Date(utcTimestamp);
    return formatMelbourneDate(date);
};

/**
 * Get current year in Melbourne timezone
 */
export const getMelbourneYear = (): number => {
    return getMelbourneTime().getFullYear();
};

/**
 * Get timezone offset string for Melbourne
 */
export const getMelbourneOffset = (): string => {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const melbourne = new Date(utc.toLocaleString("en-US", { timeZone: MELBOURNE_TIMEZONE }));

    const offset = (melbourne.getTime() - utc.getTime()) / (1000 * 60 * 60);
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.abs(Math.floor(offset));
    const minutes = Math.abs((offset % 1) * 60);

    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Check if it's currently daylight saving time in Melbourne
 */
export const isMelbourneDST = (): boolean => {
    const now = new Date();
    const january = new Date(now.getFullYear(), 0, 1);
    const july = new Date(now.getFullYear(), 6, 1);

    const januaryOffset = new Date(january.toLocaleString("en-US", { timeZone: MELBOURNE_TIMEZONE })).getTimezoneOffset();
    const julyOffset = new Date(july.toLocaleString("en-US", { timeZone: MELBOURNE_TIMEZONE })).getTimezoneOffset();
    const currentOffset = new Date(now.toLocaleString("en-US", { timeZone: MELBOURNE_TIMEZONE })).getTimezoneOffset();

    return currentOffset === Math.min(januaryOffset, julyOffset);
};

/**
 * Get timezone name (AEST/AEDT)
 */
export const getMelbourneTimezoneName = (): string => {
    return isMelbourneDST() ? 'AEDT' : 'AEST';
};

/**
 * Format relative time in Melbourne timezone
 */
export const formatRelativeTime = (date: Date | string): string => {
    const targetDate = new Date(date);
    const now = getMelbourneTime();
    const diffMs = now.getTime() - targetDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return formatMelbourneDate(targetDate, 'date');
}; 