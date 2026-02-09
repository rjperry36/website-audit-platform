import fs from 'fs/promises';
import path from 'path';
import { CrawlReport } from './types';
import { logger } from './logger';
import { format } from 'date-fns';

const AUDIT_DATA_DIR = path.join(process.cwd(), 'audit-data');

export class StorageManager {
    /**
     * Initialize the audit data directory structure for a site
     */
    static async initializeSiteDirectory(siteId: string): Promise<void> {
        const siteDir = path.join(AUDIT_DATA_DIR, siteId);
        const crawlsDir = path.join(siteDir, 'crawls');

        await fs.mkdir(crawlsDir, { recursive: true });
        logger.success(`Initialized directory structure for site ${siteId}`);
    }

    /**
     * Create a crawl directory for a specific date
     */
    static async createCrawlDirectory(siteId: string, crawlDate: string): Promise<string> {
        const crawlDir = path.join(AUDIT_DATA_DIR, siteId, 'crawls', crawlDate);
        const screenshotsDir = path.join(crawlDir, 'screenshots');
        const desktopDir = path.join(screenshotsDir, 'desktop');
        const mobileDir = path.join(screenshotsDir, 'mobile');
        const reportsDir = path.join(crawlDir, 'reports');

        await fs.mkdir(desktopDir, { recursive: true });
        await fs.mkdir(mobileDir, { recursive: true });
        await fs.mkdir(reportsDir, { recursive: true });

        logger.success(`Created crawl directory for ${siteId} on ${crawlDate}`);
        return crawlDir;
    }

    /**
     * Save a crawl report
     */
    static async saveCrawlReport(siteId: string, crawlDate: string, report: CrawlReport): Promise<void> {
        const reportPath = path.join(
            AUDIT_DATA_DIR,
            siteId,
            'crawls',
            crawlDate,
            'reports',
            'audit-report.json'
        );

        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
        logger.success(`Saved crawl report for ${siteId} on ${crawlDate}`);
    }

    /**
     * Load a crawl report
     */
    static async loadCrawlReport(siteId: string, crawlDate: string): Promise<CrawlReport | null> {
        const reportPath = path.join(
            AUDIT_DATA_DIR,
            siteId,
            'crawls',
            crawlDate,
            'reports',
            'audit-report.json'
        );

        try {
            const data = await fs.readFile(reportPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return null;
            }
            throw error;
        }
    }

    /**
     * Get all crawl dates for a site
     */
    static async getCrawlDates(siteId: string): Promise<string[]> {
        const crawlsDir = path.join(AUDIT_DATA_DIR, siteId, 'crawls');

        try {
            const entries = await fs.readdir(crawlsDir, { withFileTypes: true });
            const dates = entries
                .filter((entry) => entry.isDirectory())
                .map((entry) => entry.name)
                .sort()
                .reverse(); // Most recent first

            return dates;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    /**
     * Get the path for a screenshot
     */
    static getScreenshotPath(
        siteId: string,
        crawlDate: string,
        device: 'desktop' | 'mobile',
        filename: string
    ): string {
        return path.join(AUDIT_DATA_DIR, siteId, 'crawls', crawlDate, 'screenshots', device, filename);
    }

    /**
     * Save a screenshot
     */
    static async saveScreenshot(
        siteId: string,
        crawlDate: string,
        device: 'desktop' | 'mobile',
        filename: string,
        buffer: Buffer
    ): Promise<string> {
        const screenshotPath = this.getScreenshotPath(siteId, crawlDate, device, filename);
        await fs.writeFile(screenshotPath, buffer);
        return screenshotPath;
    }

    /**
     * Get the latest crawl date for a site
     */
    static async getLatestCrawlDate(siteId: string): Promise<string | null> {
        const dates = await this.getCrawlDates(siteId);
        return dates.length > 0 ? dates[0] : null;
    }

    /**
     * Format today's date for crawl directory naming
     */
    static getTodaysCrawlDate(): string {
        return format(new Date(), 'yyyy-MM-dd');
    }

    /**
     * Check if the audit data directory exists
     */
    static async ensureAuditDataDirectory(): Promise<void> {
        await fs.mkdir(AUDIT_DATA_DIR, { recursive: true });
    }
}
