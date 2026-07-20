/**
 * ANSI color codes for terminal output formatting.
 * - reset: Resets the terminal color
 * - info: Green color for info messages
 * - warn: Yellow color for warn messages
 * - error: Red color for error messages
 * - debug: Cyan color for debug messages
 */
const colors = {
    reset: "\x1b[0m",
    info: "\x1b[32m", // Green
    warn: "\x1b[33m", // Yellow
    error: "\x1b[31m", // Red
    debug: "\x1b[36m", // Cyan
};

/**
 * Gets the current time formatted as an ISO string.
 * @returns The formatted timestamp.
 */
function getFormattedTime(): string {
    return new Date().toISOString();
}

/**
 * Prints a log message to the console with color formatting and a timestamp.
 * 
 * @param level - The log level determining the color prefix.
 * @param sender - An optional sender string to replace the log level label.
 * @param method - The console method to use.
 * @param messages - The messages or objects to log.
 */
function print(level: keyof typeof colors, sender: string | null, method: 'log' | 'warn' | 'error', ...messages: any[]) {
    const time = getFormattedTime();
    const colorCode = colors[level];
    const resetCode = colors.reset;
    const labelStr = sender ? sender : level.toUpperCase();

    const prefix = `[${colorCode}${labelStr}${resetCode}] [${time}]`;
    console[method](prefix, ...messages);
}

/**
 * Creates a logger instance with an optional custom sender label.
 * @param sender - The custom label to display inside the brackets (e.g. "SERVER CRON").
 */
export const getLogger = (sender?: string) => ({
    info: (...args: any[]) => print('info', sender || null, 'log', ...args),
    warn: (...args: any[]) => print('warn', sender || null, 'warn', ...args),
    error: (...args: any[]) => print('error', sender || null, 'error', ...args),
    debug: (...args: any[]) => print('debug', sender || null, 'log', ...args)
});

/**
 * Default logger utility providing info, warn, error, and debug logging methods.
 */
export const logger = getLogger();