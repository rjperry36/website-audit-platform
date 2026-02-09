import { Client, TakeOptions } from 'screenshotone-api-sdk';
import { logger } from '../logger';
import { getDomainSlug, generatePageSlug } from './url-utils';

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

// Lazy-initialize ScreenshotOne API client to ensure env vars are loaded
let clientInstance: Client | null = null;
function getClient(): Client {
    if (!clientInstance) {
        const accessKey = process.env.SCREENSHOTONE_ACCESS_KEY;
        const secretKey = process.env.SCREENSHOTONE_SECRET_KEY;

        if (!accessKey || !secretKey) {
            throw new Error('SCREENSHOTONE_ACCESS_KEY and SCREENSHOTONE_SECRET_KEY must be set in environment variables');
        }

        clientInstance = new Client(accessKey, secretKey);
    }
    return clientInstance;
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, attempt);
                logger.warn(`Attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError || new Error('All retry attempts failed');
}

/**
 * Capture desktop and mobile screenshots of a page
 */
export async function captureScreenshots(
    options: ScreenshotOptions
): Promise<ScreenshotResult | null> {
    const { url, crawlDate, title } = options;

    try {
        // Generate filenames
        const domainSlug = getDomainSlug(url);
        const pageSlug = generatePageSlug(title, url);
        const desktopFilename = `${domainSlug}-${crawlDate}-desktop-${pageSlug}.png`;
        const mobileFilename = `${domainSlug}-${crawlDate}-mobile-${pageSlug}.png`;

        // Capture desktop screenshot with retry logic
        logger.info(`Capturing desktop screenshot: ${url}`);
        const desktopBuffer = await retryWithBackoff(() =>
            captureDesktopScreenshot(url)
        );

        // Capture mobile screenshot with retry logic
        logger.info(`Capturing mobile screenshot: ${url}`);
        const mobileBuffer = await retryWithBackoff(() =>
            captureMobileScreenshot(url)
        );

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
 * Capture desktop screenshot with proper configuration
 */
async function captureDesktopScreenshot(url: string): Promise<Buffer> {
    const options = TakeOptions.url(url)
        .viewportWidth(1920)
        .viewportHeight(1080)
        .fullPage(true)
        .format('png')
        .blockAds(true)
        .blockCookieBanners(true)
        .blockTrackers(true)
        .delay(3); // Wait 3 seconds for dynamic content

    const imageBlob = await getClient().take(options);
    const arrayBuffer = await imageBlob.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Capture mobile screenshot with proper device emulation
 */
async function captureMobileScreenshot(url: string): Promise<Buffer> {
    // iPhone 13 dimensions
    const options = TakeOptions.url(url)
        .viewportWidth(390)
        .viewportHeight(844)
        .deviceScaleFactor(3) // iPhone 13 has 3x scale factor
        .fullPage(true)
        .format('png')
        .blockAds(true)
        .blockCookieBanners(true)
        .blockTrackers(true)
        .delay(3); // Wait 3 seconds for dynamic content

    const imageBlob = await getClient().take(options);
    const arrayBuffer = await imageBlob.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Extract page title from HTML
 */
export async function extractPageTitle(url: string): Promise<string | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            logger.warn(`Failed to fetch ${url} for title extraction: ${response.status}`);
            return null;
        }

        const html = await response.text();

        // Extract title using regex
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
            return titleMatch[1].trim();
        }

        return null;

    } catch (error) {
        logger.error(`Failed to extract title from ${url}`, error as Error);
        return null;
    }
}
