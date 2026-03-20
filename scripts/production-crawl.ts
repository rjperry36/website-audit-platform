import 'dotenv/config';
import { crawlSite } from '../lib/crawl/production-crawler';
import { TEST_SITE_CONFIG } from '../lib/client-config';
import { logger } from '../lib/logger';

/**
 * Main crawl function
 */
async function main() {
    try {
        await crawlSite(TEST_SITE_CONFIG.id);
    } catch (error) {
        logger.error('Crawl failed', error as Error);
        process.exit(1);
    }
}

// Run crawl
main();

