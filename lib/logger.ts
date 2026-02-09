// Logging utility for the audit platform

type LogLevel = 'info' | 'warn' | 'error' | 'success';

class Logger {
    private formatTimestamp(): string {
        return new Date().toISOString();
    }

    private formatMessage(level: LogLevel, message: string): string {
        const timestamp = this.formatTimestamp();
        const prefix = {
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
            success: '✅',
        }[level];

        return `[${timestamp}] ${prefix} ${message}`;
    }

    info(message: string): void {
        console.log(this.formatMessage('info', message));
    }

    warn(message: string): void {
        console.warn(this.formatMessage('warn', message));
    }

    error(message: string, error?: Error): void {
        console.error(this.formatMessage('error', message));
        if (error) {
            console.error(error);
        }
    }

    success(message: string): void {
        console.log(this.formatMessage('success', message));
    }

    progress(current: number, total: number, item: string): void {
        const percentage = Math.round((current / total) * 100);
        this.info(`Progress: ${current}/${total} (${percentage}%) - ${item}`);
    }
}

export const logger = new Logger();
