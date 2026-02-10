#!/usr/bin/env node

/**
 * Initialize the test site and run the first crawl
 * This script sets up thebrandingjournal.com as the static test website
 */

import { ConfigManager } from '../lib/config';
import { StorageManager } from '../lib/storage';
import { logger } from '../lib/logger';
import { SiteConfig } from '../lib/types';

const TEST_SITE: SiteConfig = {
    id: 'site-thebrandingjournal',
    name: 'The Branding Journal',
    rootUrl: 'https://www.thebrandingjournal.com/',
    crawlIntervalDays: 3,
    lastCrawlTimestamp: null,
    maxPages: 1,
    excludePatterns: ['*'],
    guidelines: {
        global: {
            referenceImages: [],
            specs: {},
            rules: [],
        },
        pageTypes: {},
    },
};

async function main() {
    try {
        logger.info('Initializing test site: The Branding Journal');

        // Check if site already exists
        const existing = await ConfigManager.getSite(TEST_SITE.id);

        if (existing) {
            logger.info('Test site already exists, updating configuration...');
            await ConfigManager.updateSite(TEST_SITE.id, TEST_SITE);
        } else {
            logger.info('Adding test site to configuration...');
            await ConfigManager.addSite(TEST_SITE);
        }

        // Initialize storage directory
        logger.info('Initializing storage directory...');
        await StorageManager.initializeSiteDirectory(TEST_SITE.id);

        logger.success('✓ Test site initialized successfully!');
        logger.info(`Site ID: ${TEST_SITE.id}`);
        logger.info(`URL: ${TEST_SITE.rootUrl}`);
        logger.info(`Crawl Interval: Every ${TEST_SITE.crawlIntervalDays} days`);
        logger.info(`Max Pages: ${TEST_SITE.maxPages} (homepage only)`);

        logger.info('\nNext steps:');
        logger.info('1. Run a crawl: npm run crawl');
        logger.info('2. View the dashboard to see results');

    } catch (error) {
        logger.error('Failed to initialize test site', error as Error);
        process.exit(1);
    }
}

main();
