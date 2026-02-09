#!/usr/bin/env node

/**
 * Test crawl script for redstock.live
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { Crawler } from '../lib/crawl/crawler';
import { StorageManager } from '../lib/storage';
import { logger } from '../lib/logger';
import { SiteConfig } from '../lib/types';

async function main() {
    // Create a test site configuration for redstock.live
    const testSite: SiteConfig = {
        id: 'site-redstock-test',
        name: 'Redstock Live',
        rootUrl: 'https://redstock.live/',
        crawlIntervalDays: 7,
        lastCrawlTimestamp: null,
        maxPages: 1, // Limit to 1 page for quick testing
        excludePatterns: [],
        guidelines: {
            global: {
                referenceImages: [],
                specs: {},
                rules: [],
            },
            pageTypes: {},
        },
    };

    logger.info(`Starting test crawl for ${testSite.name}`);

    try {
        // Ensure audit data directory exists
        await StorageManager.ensureAuditDataDirectory();
        await StorageManager.initializeSiteDirectory(testSite.id);

        // Run crawler
        const crawler = new Crawler(testSite);
        const report = await crawler.crawl();

        logger.success(`Crawl complete! ${report.totalPages} pages crawled`);
        logger.info(`Report saved to: audit-data/${testSite.id}/crawls/${report.crawlDate}/`);
        logger.info(`\nCrawl Summary:`);
        logger.info(`- Total pages: ${report.totalPages}`);
        logger.info(`- Duration: ${report.crawlDuration}`);
        logger.info(`\nScreenshots saved to:`);
        logger.info(`- Desktop: audit-data/${testSite.id}/crawls/${report.crawlDate}/screenshots/desktop/`);
        logger.info(`- Mobile: audit-data/${testSite.id}/crawls/${report.crawlDate}/screenshots/mobile/`);

    } catch (error) {
        logger.error('Crawl failed', error as Error);
        process.exit(1);
    }
}

main();
