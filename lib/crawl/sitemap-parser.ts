import { parseStringPromise } from 'xml2js';
import { logger } from '../logger';
import { normalizeUrl } from './url-utils';

interface SitemapUrl {
    loc: string[];
    lastmod?: string[];
    changefreq?: string[];
    priority?: string[];
}

interface Sitemap {
    urlset?: {
        url?: SitemapUrl[];
    };
    sitemapindex?: {
        sitemap?: Array<{ loc: string[] }>;
    };
}

/**
 * Parse sitemap.xml and extract all URLs
 */
export async function parseSitemap(siteUrl: string): Promise<string[]> {
    const sitemapUrl = new URL('/sitemap.xml', siteUrl).toString();

    try {
        logger.info(`Fetching sitemap from ${sitemapUrl}`);

        const response = await fetch(sitemapUrl);

        if (!response.ok) {
            logger.warn(`Sitemap not found at ${sitemapUrl} (${response.status})`);
            return [];
        }

        const xml = await response.text();
        const parsed = await parseStringPromise(xml) as Sitemap;

        // Check if it's a sitemap index (contains multiple sitemaps)
        if (parsed.sitemapindex?.sitemap) {
            logger.info('Found sitemap index, fetching nested sitemaps');
            const nestedUrls: string[] = [];

            for (const sitemap of parsed.sitemapindex.sitemap) {
                if (sitemap.loc?.[0]) {
                    const urls = await parseSingleSitemap(sitemap.loc[0]);
                    nestedUrls.push(...urls);
                }
            }

            logger.success(`Discovered ${nestedUrls.length} URLs from sitemap index`);
            return nestedUrls;
        }

        // Regular sitemap
        if (parsed.urlset?.url) {
            const urls = parsed.urlset.url
                .map(entry => entry.loc?.[0])
                .filter((url): url is string => !!url)
                .map(url => normalizeUrl(url));

            logger.success(`Discovered ${urls.length} URLs from sitemap`);
            return urls;
        }

        logger.warn('Sitemap found but contains no URLs');
        return [];

    } catch (error) {
        logger.error('Error parsing sitemap', error as Error);
        return [];
    }
}

/**
 * Parse a single sitemap URL
 */
async function parseSingleSitemap(sitemapUrl: string): Promise<string[]> {
    try {
        logger.info(`Fetching nested sitemap: ${sitemapUrl}`);

        const response = await fetch(sitemapUrl);
        if (!response.ok) {
            logger.warn(`Failed to fetch sitemap: ${sitemapUrl}`);
            return [];
        }

        const xml = await response.text();
        const parsed = await parseStringPromise(xml) as Sitemap;

        if (parsed.urlset?.url) {
            const urls = parsed.urlset.url
                .map(entry => entry.loc?.[0])
                .filter((url): url is string => !!url)
                .map(url => normalizeUrl(url));

            return urls;
        }

        return [];
    } catch (error) {
        logger.error(`Error parsing nested sitemap: ${sitemapUrl}`, error as Error);
        return [];
    }
}
