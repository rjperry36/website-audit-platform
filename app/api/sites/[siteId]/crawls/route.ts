import { NextResponse } from 'next/server';
import { StorageManager } from '@/lib/storage';
import { ClientConfigManager } from '@/lib/client-config';
import { Crawler } from '@/lib/crawl/crawler';

/**
 * GET /api/sites/[siteId]/crawls
 * Get all crawl dates for a site
 */
export async function GET(
    request: Request,
    { params }: { params: { siteId: string } }
) {
    try {
        const crawlDates = await StorageManager.getCrawlDates(params.siteId);

        // Get reports for each crawl date
        const crawls = await Promise.all(
            crawlDates.map(async (date) => {
                const report = await StorageManager.loadCrawlReport(params.siteId, date);
                return {
                    date,
                    summary: report?.summary || null,
                    totalPages: report?.totalPages || 0,
                };
            })
        );

        return NextResponse.json({ crawls });
    } catch (error) {
        console.error('Error fetching crawls:', error);
        return NextResponse.json(
            { error: 'Failed to fetch crawls' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/sites/[siteId]/crawls
 * Trigger a new crawl for a site
 */
export async function POST(
    request: Request,
    { params }: { params: { siteId: string } }
) {
    try {
        // This needs to run on the client side since Vercel serverless can't write files
        // For now, return a message that crawling should be done locally

        return NextResponse.json(
            {
                message: 'Crawling must be run locally due to Vercel filesystem limitations',
                instructions: 'Run `npm run crawl` locally to execute crawls',
                siteId: params.siteId
            },
            { status: 200 }
        );

        /* 
        // This code would work locally:
        const site = ClientConfigManager.getSite(params.siteId);
        
        if (!site) {
          return NextResponse.json(
            { error: 'Site not found' },
            { status: 404 }
          );
        }
    
        // Initialize crawler
        const crawler = new Crawler(site);
        
        // Run crawl (this would be async in production)
        const report = await crawler.crawl();
        
        // Update last crawl timestamp
        ClientConfigManager.updateSite(params.siteId, {
          lastCrawlTimestamp: new Date().toISOString(),
        });
    
        return NextResponse.json(
          { message: 'Crawl complete', report },
          { status: 200 }
        );
        */
    } catch (error) {
        console.error('Error triggering crawl:', error);
        return NextResponse.json(
            { error: 'Failed to trigger crawl' },
            { status: 500 }
        );
    }
}
