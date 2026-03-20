
'use server';

import { StorageManager } from '@/lib/storage';
import { CrawlReport, ProductionCrawlReport } from '@/lib/types';
import { logger } from '@/lib/logger';

/**
 * Get the list of crawl dates for a site
 */
export async function getCrawlHistory(siteId: string): Promise<string[]> {
    try {
        const dates = await StorageManager.getCrawlDates(siteId);
        return dates;
    } catch (error) {
        logger.error(`Failed to get crawl history for ${siteId}`, error as Error);
        return [];
    }
}

/**
 * Get a specific crawl report
 */
export async function getCrawlReport(siteId: string, date: string): Promise<ProductionCrawlReport | null> {
    try {
        // We cast here because we know the storage returns this structure for production crawls
        const report = await StorageManager.loadCrawlReport(siteId, date) as unknown as ProductionCrawlReport;
        return report;
    } catch (error) {
        logger.error(`Failed to load crawl report for ${siteId} on ${date}`, error as Error);
        return null;
    }
}
