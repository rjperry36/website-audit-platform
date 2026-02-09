import { SiteConfig, CrawlReport, PageAudit, CrawlResult } from '../types';
import { logger } from '../logger';
import { StorageManager } from '../storage';
import { parseSitemap } from './sitemap-parser';
import { crawlLinks } from './link-crawler';
import { captureScreenshots, extractPageTitle } from './screenshot-capture';
import { normalizeUrl, matchesExcludePattern } from './url-utils';
import { format } from 'date-fns';

interface CrawlerProgress {
    total: number;
    completed: number;
    current: string;
    errors: string[];
}

/**
 * Main crawler orchestrator
 */
export class Crawler {
    private site: SiteConfig;
    private progress: CrawlerProgress = {
        total: 0,
        completed: 0,
        current: '',
        errors: [],
    };

    constructor(site: SiteConfig) {
        this.site = site;
    }

    /**
     * Run the full crawl process
     */
    async crawl(): Promise<CrawlReport> {
        const startTime = Date.now();
        const crawlDate = StorageManager.getTodaysCrawlDate();

        logger.info(`Starting crawl for ${this.site.name} (${this.site.rootUrl})`);

        try {
            // Create crawl directory
            await StorageManager.createCrawlDirectory(this.site.id, crawlDate);

            // Discover pages
            const urls = await this.discoverPages();

            // Filter and limit URLs
            const filteredUrls = this.filterUrls(urls);

            logger.info(`Crawling ${filteredUrls.length} pages`);
            this.progress.total = filteredUrls.length;

            // Crawl each page
            const pages: PageAudit[] = [];
            for (const url of filteredUrls) {
                this.progress.current = url;
                this.progress.completed++;

                const pageAudit = await this.crawlPage(url, crawlDate);
                if (pageAudit) {
                    pages.push(pageAudit);
                }

                // Add delay between requests
                await this.delay(1500);
            }

            // Generate report
            const duration = Math.round((Date.now() - startTime) / 1000);
            const report = this.generateReport(crawlDate, duration, pages);

            // Save report
            await StorageManager.saveCrawlReport(this.site.id, crawlDate, report);

            logger.success(`Crawl complete: ${pages.length} pages crawled in ${duration}s`);

            return report;

        } catch (error) {
            logger.error('Crawl failed', error as Error);
            throw error;
        }
    }

    /**
     * Discover pages using sitemap or link crawling
     */
    private async discoverPages(): Promise<string[]> {
        // Try sitemap first
        const sitemapUrls = await parseSitemap(this.site.rootUrl);

        if (sitemapUrls.length > 0) {
            logger.success(`Using sitemap: found ${sitemapUrls.length} URLs`);
            return sitemapUrls;
        }

        // Fallback to link crawling
        logger.info('No sitemap found, falling back to link crawling');
        const crawledUrls = await crawlLinks(this.site.rootUrl, {
            maxPages: this.site.maxPages,
            maxDepth: 3,
        });

        return crawledUrls;
    }

    /**
     * Filter URLs based on exclude patterns and max pages
     */
    private filterUrls(urls: string[]): string[] {
        let filtered = urls;

        // Remove duplicates
        filtered = Array.from(new Set(filtered.map(url => normalizeUrl(url))));

        // Filter by exclude patterns
        if (this.site.excludePatterns.length > 0) {
            const beforeCount = filtered.length;
            filtered = filtered.filter(url => !matchesExcludePattern(url, this.site.excludePatterns));
            logger.info(`Excluded ${beforeCount - filtered.length} URLs by patterns`);
        }

        // Limit to maxPages
        if (filtered.length > this.site.maxPages) {
            logger.info(`Limiting to ${this.site.maxPages} pages (found ${filtered.length})`);
            filtered = filtered.slice(0, this.site.maxPages);
        }

        return filtered;
    }

    /**
     * Crawl a single page
     */
    private async crawlPage(url: string, crawlDate: string): Promise<PageAudit | null> {
        try {
            logger.progress(this.progress.completed, this.progress.total, url);

            // Extract page title
            const title = await extractPageTitle(url);

            // Capture screenshots
            const screenshots = await captureScreenshots({
                url,
                siteId: this.site.id,
                crawlDate,
                title,
            });

            if (!screenshots) {
                this.progress.errors.push(`Failed to capture screenshots: ${url}`);
                return null;
            }

            // Save screenshots
            await StorageManager.saveScreenshot(
                this.site.id,
                crawlDate,
                'desktop',
                screenshots.desktopFilename,
                screenshots.desktop
            );

            await StorageManager.saveScreenshot(
                this.site.id,
                crawlDate,
                'mobile',
                screenshots.mobileFilename,
                screenshots.mobile
            );

            // Create page audit (audits will be added in Phase 3)
            const pageAudit: PageAudit = {
                url,
                title: title || 'Untitled',
                pageType: 'unknown', // Will be determined by audit engine
                screenshots: {
                    desktop: screenshots.desktopFilename,
                    mobile: screenshots.mobileFilename,
                },
                audits: {
                    seo: { score: 0, findings: [] },
                    accessibility: { score: 0, findings: [] },
                    performance: { score: 0, findings: [] },
                    brandCompliance: { score: 0, findings: [] },
                },
            };

            return pageAudit;

        } catch (error) {
            logger.error(`Error crawling ${url}`, error as Error);
            this.progress.errors.push(`Error: ${url} - ${(error as Error).message}`);
            return null;
        }
    }

    /**
     * Generate crawl report
     */
    private generateReport(crawlDate: string, duration: number, pages: PageAudit[]): CrawlReport {
        return {
            siteId: this.site.id,
            crawlDate,
            crawlDuration: `${Math.floor(duration / 60)}m ${duration % 60}s`,
            totalPages: pages.length,
            summary: {
                overallScore: 0, // Will be calculated by audit engine
                mandatory: { pass: 0, fail: 0, total: 0 },
                advisory: { pass: 0, fail: 0, total: 0 },
                acceptable: { pass: 0, fail: 0, total: 0 },
            },
            pages,
        };
    }

    /**
     * Delay helper
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current progress
     */
    getProgress(): CrawlerProgress {
        return { ...this.progress };
    }
}
