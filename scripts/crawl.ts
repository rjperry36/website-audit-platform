#!/usr/bin/env node

/**
 * CLI tool to run crawls locally
 * Usage: npm run crawl [siteId]
 */

import { ClientConfigManager } from '../lib/client-config';
import { Crawler } from '../lib/crawl/crawler';
import { StorageManager } from '../lib/storage';
import { logger } from '../lib/logger';

async function main() {
    const siteId = process.argv[2];

    if (!siteId) {
        console.error('Usage: npm run crawl <siteId>');
        console.error('\nAvailable sites:');
        const sites = ClientConfigManager.getSites();
        sites.forEach(site => {
            console.log(`  ${site.id} - ${site.name} (${site.rootUrl})`);
        });
        process.exit(1);
    }

    const site = ClientConfigManager.getSite(siteId);

    if (!site) {
        console.error(`Site not found: ${siteId}`);
        process.exit(1);
    }

    logger.info(`Starting crawl for ${site.name}`);

    try {
        // Ensure audit data directory exists
        await StorageManager.ensureAuditDataDirectory();
        await StorageManager.initializeSiteDirectory(site.id);

        // Run crawler
        const crawler = new Crawler(site);
        const report = await crawler.crawl();

        // Update last crawl timestamp
        ClientConfigManager.updateSite(siteId, {
            lastCrawlTimestamp: new Date().toISOString(),
        });

        logger.success(`Crawl complete! ${report.totalPages} pages crawled`);
        logger.info(`Report saved to: audit-data/${site.id}/crawls/${report.crawlDate}/`);

    } catch (error) {
        logger.error('Crawl failed', error as Error);
        process.exit(1);
    }
}

main();
