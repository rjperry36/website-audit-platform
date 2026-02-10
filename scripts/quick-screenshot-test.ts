#!/usr/bin/env node

/**
 * Quick screenshot test - just capture one page
 */

import { initBrowser, closeBrowser, captureScreenshots } from '../lib/crawl/screenshot-capture';
import { logger } from '../lib/logger';
import { StorageManager } from '../lib/storage';
import * as fs from 'fs/promises';
import * as path from 'path';

async function main() {
    const testUrl = 'https://redstock.live/';
    const crawlDate = StorageManager.getTodaysCrawlDate();
    const siteId = 'site-redstock-test';

    logger.info(`Testing screenshot capture for: ${testUrl}`);

    try {
        // Initialize browser
        logger.info('Initializing browser...');
        const browser = await initBrowser();

        // Capture screenshots
        logger.info('Capturing screenshots...');
        const screenshots = await captureScreenshots(browser, {
            url: testUrl,
            siteId,
            crawlDate,
            title: 'Test Page',
        });

        if (screenshots) {
            // Save to temp directory for review
            const tempDir = path.join(process.cwd(), 'temp-screenshots');
            await fs.mkdir(tempDir, { recursive: true });

            await fs.writeFile(
                path.join(tempDir, 'desktop.png'),
                screenshots.desktop
            );
            await fs.writeFile(
                path.join(tempDir, 'mobile.png'),
                screenshots.mobile
            );

            logger.success('Screenshots captured successfully!');
            logger.info(`Saved to: ${tempDir}/`);
            logger.info(`- Desktop: desktop.png`);
            logger.info(`- Mobile: mobile.png`);
        } else {
            logger.error('Failed to capture screenshots');
        }

        // Clean up
        await closeBrowser(browser);

    } catch (error) {
        logger.error('Test failed', error as Error);
        process.exit(1);
    }
}

main();
