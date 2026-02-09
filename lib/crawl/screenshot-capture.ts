import { chromium, Browser, Page } from 'playwright';
import { logger } from '../logger';
import { getDomainSlug, generatePageSlug } from './url-utils';
import { format } from 'date-fns';

interface ScreenshotOptions {
    url: string;
    siteId: string;
    crawlDate: string;
    title: string | null;
}

interface ScreenshotResult {
    desktop: Buffer;
    mobile: Buffer;
    desktopFilename: string;
    mobileFilename: string;
}

/**
 * Capture desktop and mobile screenshots of a page
 */
export async function captureScreenshots(
    browser: Browser,
    options: ScreenshotOptions
): Promise<ScreenshotResult | null> {
    const { url, crawlDate, title } = options;

    try {
        // Generate filenames
        const domainSlug = getDomainSlug(url);
        const pageSlug = generatePageSlug(title, url);
        const desktopFilename = `${domainSlug}-${crawlDate}-desktop-${pageSlug}.png`;
        const mobileFilename = `${domainSlug}-${crawlDate}-mobile-${pageSlug}.png`;

        // Capture desktop screenshot
        logger.info(`Capturing desktop screenshot: ${url}`);
        const desktopBuffer = await captureScreenshot(browser, url, {
            width: 1920,
            height: 1080,
        });

        // Capture mobile screenshot
        logger.info(`Capturing mobile screenshot: ${url}`);
        const mobileBuffer = await captureScreenshot(browser, url, {
            width: 390,
            height: 844,
        });

        return {
            desktop: desktopBuffer,
            mobile: mobileBuffer,
            desktopFilename,
            mobileFilename,
        };

    } catch (error) {
        logger.error(`Failed to capture screenshots for ${url}`, error as Error);
        return null;
    }
}

/**
 * Capture a single screenshot with specified viewport
 */
async function captureScreenshot(
    browser: Browser,
    url: string,
    viewport: { width: number; height: number }
): Promise<Buffer> {
    const page = await browser.newPage({
        viewport,
    });

    try {
        // Navigate to page with timeout
        await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: 30000,
        });

        // Wait a bit for any animations to settle
        await page.waitForTimeout(1000);

        // Capture full page screenshot
        const screenshot = await page.screenshot({
            fullPage: true,
            type: 'png',
        });

        return screenshot;

    } finally {
        await page.close();
    }
}

/**
 * Initialize a Playwright browser instance
 */
export async function initBrowser(): Promise<Browser> {
    logger.info('Initializing Playwright browser');

    const browser = await chromium.launch({
        headless: true,
    });

    return browser;
}

/**
 * Close the browser instance
 */
export async function closeBrowser(browser: Browser): Promise<void> {
    logger.info('Closing browser');
    await browser.close();
}

/**
 * Extract page title from HTML
 */
export async function extractPageTitle(browser: Browser, url: string): Promise<string | null> {
    const page = await browser.newPage();

    try {
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        });

        const title = await page.title();
        return title || null;

    } catch (error) {
        logger.error(`Failed to extract title from ${url}`, error as Error);
        return null;
    } finally {
        await page.close();
    }
}
