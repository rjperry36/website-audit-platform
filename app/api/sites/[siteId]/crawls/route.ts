import { NextResponse } from 'next/server';
import { StorageManager } from '@/lib/storage';

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
        // TODO: Implement crawl trigger logic
        // This will be implemented in Phase 3 when we build the crawl engine

        return NextResponse.json(
            { message: 'Crawl triggered', siteId: params.siteId },
            { status: 202 }
        );
    } catch (error) {
        console.error('Error triggering crawl:', error);
        return NextResponse.json(
            { error: 'Failed to trigger crawl' },
            { status: 500 }
        );
    }
}
