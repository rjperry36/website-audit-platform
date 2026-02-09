import { logger } from '../logger';
import { normalizeUrl, extractUrlsFromHtml, isInternalUrl } from './url-utils';

interface CrawlOptions {
    maxPages: number;
    maxDepth?: number;
}

/**
 * Crawl a website by following internal links recursively
 */
export async function crawlLinks(
    startUrl: string,
    options: CrawlOptions
): Promise<string[]> {
    const { maxPages, maxDepth = 3 } = options;
    const visited = new Set<string>();
    const discovered = new Set<string>();
    const queue: Array<{ url: string; depth: number }> = [];

    // Start with the homepage
    const normalizedStart = normalizeUrl(startUrl);
    queue.push({ url: normalizedStart, depth: 0 });
    discovered.add(normalizedStart);

    logger.info(`Starting link crawl from ${startUrl}`);

    while (queue.length > 0 && visited.size < maxPages) {
        const { url, depth } = queue.shift()!;

        // Skip if already visited
        if (visited.has(url)) continue;

        // Skip if max depth reached
        if (depth > maxDepth) continue;

        visited.add(url);
        logger.info(`Crawling [${visited.size}/${maxPages}]: ${url}`);

        try {
            // Fetch the page
            const response = await fetch(url);

            if (!response.ok) {
                logger.warn(`Failed to fetch ${url}: ${response.status}`);
                continue;
            }

            const html = await response.text();

            // Extract links from HTML
            const links = extractUrlsFromHtml(html, url);

            // Add new links to queue
            for (const link of links) {
                if (!discovered.has(link) && isInternalUrl(link, startUrl)) {
                    discovered.add(link);
                    queue.push({ url: link, depth: depth + 1 });
                }
            }

            // Add delay to be respectful
            await delay(1500);

        } catch (error) {
            logger.error(`Error crawling ${url}`, error as Error);
        }
    }

    logger.success(`Link crawl complete: discovered ${visited.size} pages`);
    return Array.from(visited);
}

/**
 * Delay helper function
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
