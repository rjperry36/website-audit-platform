/**
 * Audit report persistence — Supabase (Postgres + Storage).
 *
 * Reports are rows in `audit_reports` (one per site+crawl_date); screenshots are
 * objects in the public `audit-screenshots` bucket. Writes use the service-role
 * key (server-only); reads use the anon key (RLS allows public SELECT).
 *
 * See DR-0007 and scopes/cro-audit-live-persistence.v0.md. Apply
 * scripts/audit_reports_migration.sql before using this module.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'audit-screenshots';

// Service-role client — server-only, bypasses RLS for inserts + uploads.
let serviceClient: SupabaseClient | null = null;
function getServiceClient(): SupabaseClient {
    if (!serviceClient) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) {
            throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
        }
        serviceClient = createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
    }
    return serviceClient;
}

/** Anon client for reads (public SELECT via RLS). */
let readClient: SupabaseClient | null = null;
function getReadClient(): SupabaseClient {
    if (!readClient) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) {
            throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
        }
        readClient = createClient(url, key, { auth: { persistSession: false } });
    }
    return readClient;
}

async function uploadScreenshot(
    siteId: string,
    crawlDate: string,
    variant: 'desktop' | 'mobile',
    buffer: Buffer,
    contentType: string,
): Promise<string> {
    const ext = contentType === 'image/png' ? 'png' : 'jpg';
    const objectPath = `${siteId}/${crawlDate}/${variant}.${ext}`;
    const { error } = await getServiceClient()
        .storage
        .from(BUCKET)
        .upload(objectPath, buffer, { contentType, upsert: true });
    if (error) throw new Error(`Screenshot upload failed (${variant}): ${error.message}`);

    const { data } = getServiceClient().storage.from(BUCKET).getPublicUrl(objectPath);
    return data.publicUrl;
}

export interface SaveReportInput {
    siteId: string;
    crawlDate: string;
    report: Record<string, any>; // the full audit-report (shape unchanged)
    desktop: Buffer;
    mobile: Buffer;
    contentType?: string; // defaults to image/jpeg
}

/**
 * Upload screenshots, rewrite the report's `screenshots` field to the public
 * Storage URLs, and upsert the report row. Returns the persisted report.
 */
export async function saveReport(input: SaveReportInput): Promise<Record<string, any>> {
    const { siteId, crawlDate, report } = input;
    const contentType = input.contentType ?? 'image/jpeg';

    const [desktopUrl, mobileUrl] = await Promise.all([
        uploadScreenshot(siteId, crawlDate, 'desktop', input.desktop, contentType),
        uploadScreenshot(siteId, crawlDate, 'mobile', input.mobile, contentType),
    ]);

    const persisted: Record<string, any> = { ...report, screenshots: { desktop: desktopUrl, mobile: mobileUrl } };

    const { error } = await getServiceClient()
        .from('audit_reports')
        .upsert(
            {
                site_id: siteId,
                crawl_date: crawlDate,
                scores: persisted.scores ?? {},
                report: persisted,
            },
            { onConflict: 'site_id,crawl_date' },
        );
    if (error) throw new Error(`Report upsert failed: ${error.message}`);

    return persisted;
}

/** Latest persisted report for a site, or null if none / Supabase unavailable. */
export async function getLatestReport(siteId: string): Promise<Record<string, any> | null> {
    try {
        const { data, error } = await getReadClient()
            .from('audit_reports')
            .select('report')
            .eq('site_id', siteId)
            .order('crawl_date', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) {
            console.warn('getLatestReport query failed:', error.message);
            return null;
        }
        return (data?.report as Record<string, any>) ?? null;
    } catch (e) {
        console.warn('getLatestReport unavailable:', e);
        return null;
    }
}
