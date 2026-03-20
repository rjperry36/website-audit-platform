
import { NextResponse } from 'next/server';
import { ConfigManager } from '@/lib/config';
import { crawlSite } from '@/lib/crawl/production-crawler';
import { logger } from '@/lib/logger';
import { addDays, isBefore, parseISO } from 'date-fns';

export async function GET(request: Request) {
    // 1. Verify Authentication
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const sites = await ConfigManager.getSites();
        const results = [];
        let crawledCount = 0;

        for (const site of sites) {
            // 2. Check if due for crawl
            let shouldCrawl = false;

            if (!site.lastCrawlTimestamp) {
                // Never crawled, so do it now
                shouldCrawl = true;
            } else {
                const nextCrawlDate = addDays(parseISO(site.lastCrawlTimestamp), site.crawlIntervalDays);
                if (isBefore(nextCrawlDate, new Date())) {
                    shouldCrawl = true;
                }
            }

            if (shouldCrawl) {
                logger.info(`Cron: Starting crawl for ${site.name} (${site.id})`);
                await crawlSite(site.id);
                results.push({ id: site.id, name: site.name, status: 'crawled' });
                crawledCount++;
            } else {
                results.push({ id: site.id, name: site.name, status: 'skipped', nextCrawl: addDays(parseISO(site.lastCrawlTimestamp!), site.crawlIntervalDays) });
            }
        }

        return NextResponse.json({
            success: true,
            crawled: crawledCount,
            total: sites.length,
            details: results
        });

    } catch (error) {
        logger.error('Cron job failed', error as Error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
