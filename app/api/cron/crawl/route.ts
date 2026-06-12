
import { NextResponse } from 'next/server';
import { crawlSite } from '@/lib/crawl/production-crawler';
import { logger } from '@/lib/logger';
import { TEST_SITE_CONFIG } from '@/lib/client-config';

// The crawl (ScreenshotOne desktop+mobile + gpt-4o vision) takes ~60-90s, so the
// function timeout must be raised. Requires a Vercel plan that allows this
// (DR-0007 — Vercel Cron option). Schedule is weekly (see vercel.json).
export const maxDuration = 300;

export async function GET(request: Request) {
    // 1. Verify the cron secret before any external-facing work.
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 2. Crawl the committed sample site. (audit-config.json is absent on
        //    Vercel's read-only FS; the crawler resolves the site from the
        //    committed TEST_SITE_CONFIG and persists results to Supabase.)
        logger.info(`Cron: starting crawl for ${TEST_SITE_CONFIG.name} (${TEST_SITE_CONFIG.id})`);
        const report = await crawlSite(TEST_SITE_CONFIG.id);

        return NextResponse.json({
            success: true,
            site: TEST_SITE_CONFIG.id,
            scores: report.scores,
        });
    } catch (error) {
        logger.error('Cron job failed', error as Error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 },
        );
    }
}
