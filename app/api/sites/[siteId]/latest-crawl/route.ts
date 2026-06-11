
import { NextResponse } from 'next/server'
import { ConfigManager } from '@/lib/config'
import { StorageManager } from '@/lib/storage'
import path from 'path'
import { promises as fs } from 'fs'

/**
 * Committed-snapshot fallback.
 *
 * The live filesystem crawl data (`audit-data/`) and the site list
 * (`audit-config.json`) are gitignored and therefore absent on Vercel's
 * read-only filesystem. When the live data cannot be found, fall back to a
 * committed demo snapshot under `data/audit/<siteId>.json` so the CRO/UX audit
 * surface still renders in production. Local dev keeps using fresh FS crawls.
 *
 * See scopes/restore-cro-audit-on-vercel.v0.md. The durable fix (Supabase
 * persistence) is Phase 2.
 */
async function loadSnapshot(siteId: string) {
    try {
        const snapshotPath = path.join(process.cwd(), 'data', 'audit', `${siteId}.json`)
        const content = await fs.readFile(snapshotPath, 'utf-8')
        return JSON.parse(content)
    } catch {
        return null
    }
}

export async function GET(
    request: Request,
    { params }: { params: { siteId: string } }
) {
    try {
        const { siteId } = params

        // 1. Get site config to verify it exists. On Vercel the config file is
        //    absent AND the filesystem is read-only, so ConfigManager.load()
        //    throws when it tries to write a default config. Treat any failure
        //    (throw or null) as "no live config" and fall back to the snapshot.
        let site = null
        try {
            site = await ConfigManager.getSite(siteId)
        } catch (configErr) {
            console.warn('Config unavailable (read-only FS?), will try snapshot:', configErr)
        }
        if (!site) {
            const snapshot = await loadSnapshot(siteId)
            if (snapshot) {
                return NextResponse.json({ ...snapshot, previousScores: null })
            }
            return NextResponse.json(
                { error: 'Site not found' },
                { status: 404 }
            )
        }

        // 2. Find the latest crawl directory
        // We need to look in audit-data/site-[id]/crawls/
        // StorageManager.getCrawlDirectory returns the path for a specific date
        // But we want to find the *latest* date

        const siteDir = path.join(process.cwd(), 'audit-data', siteId, 'crawls')

        try {
            const crawls = await fs.readdir(siteDir)

            // Filter for valid date directories (YYYY-MM-DD) and sort descending
            const validCrawls = crawls
                .filter(dir => /^\d{4}-\d{2}-\d{2}$/.test(dir))
                .sort((a, b) => b.localeCompare(a)) // Latest date first

            if (validCrawls.length === 0) {
                const snapshot = await loadSnapshot(siteId)
                if (snapshot) {
                    return NextResponse.json({ ...snapshot, previousScores: null })
                }
                return NextResponse.json(
                    { error: 'No crawls found' },
                    { status: 404 }
                )
            }

            const latestCrawlDate = validCrawls[0]
            const reportPath = path.join(siteDir, latestCrawlDate, 'reports', 'audit-report.json')

            // 3. Read the latest report file
            const reportContent = await fs.readFile(reportPath, 'utf-8')
            const report = JSON.parse(reportContent)

            // 4. Try to get previous crawl data
            let previousScores = null
            if (validCrawls.length > 1) {
                try {
                    const previousCrawlDate = validCrawls[1]
                    const prevReportPath = path.join(siteDir, previousCrawlDate, 'reports', 'audit-report.json')
                    const prevReportContent = await fs.readFile(prevReportPath, 'utf-8')
                    const prevReport = JSON.parse(prevReportContent)
                    previousScores = prevReport.scores
                } catch (e) {
                    console.warn('Failed to load previous report:', e)
                }
            }

            // Return combined data
            return NextResponse.json({
                ...report,
                previousScores
            })

        } catch (err) {
            // Directory doesn't exist or other FS error (e.g. read-only Vercel).
            const snapshot = await loadSnapshot(siteId)
            if (snapshot) {
                return NextResponse.json({ ...snapshot, previousScores: null })
            }
            return NextResponse.json(
                { error: 'No crawls found' },
                { status: 404 }
            )
        }

    } catch (error) {
        console.error('Error fetching latest crawl:', error)
        // Last resort: serve the committed snapshot rather than a 500 so the
        // audit surface degrades gracefully.
        const snapshot = await loadSnapshot(params.siteId)
        if (snapshot) {
            return NextResponse.json({ ...snapshot, previousScores: null })
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
