import { NextResponse } from 'next/server';
import { StorageManager } from '@/lib/storage';

/**
 * GET /api/sites/[siteId]/crawls/[crawlDate]
 * Get a specific crawl report
 */
export async function GET(
    request: Request,
    { params }: { params: { siteId: string; crawlDate: string } }
) {
    try {
        const report = await StorageManager.loadCrawlReport(params.siteId, params.crawlDate);

        if (!report) {
            return NextResponse.json(
                { error: 'Crawl report not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ report });
    } catch (error) {
        console.error('Error fetching crawl report:', error);
        return NextResponse.json(
            { error: 'Failed to fetch crawl report' },
            { status: 500 }
        );
    }
}
