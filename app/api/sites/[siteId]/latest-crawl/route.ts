
import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import { getLatestReport } from '@/lib/audit/report-store'

/**
 * Latest audit report for a site.
 *
 * Source of truth is Supabase (DR-0007): the newest `audit_reports` row. Falls
 * back to the committed demo snapshot under `data/audit/<siteId>.json` (Phase 1)
 * for local dev / cold start / before the first persisted crawl.
 */
async function loadSnapshot(siteId: string) {
    try {
        const snapshotPath = path.join(process.cwd(), 'data', 'audit', `${siteId}.json`)
        return JSON.parse(await fs.readFile(snapshotPath, 'utf-8'))
    } catch {
        return null
    }
}

export async function GET(
    request: Request,
    { params }: { params: { siteId: string } }
) {
    const { siteId } = params

    // 1. Supabase — the latest persisted crawl.
    const latest = await getLatestReport(siteId)
    if (latest) {
        return NextResponse.json({ ...latest, previousScores: null })
    }

    // 2. Committed snapshot fallback.
    const snapshot = await loadSnapshot(siteId)
    if (snapshot) {
        return NextResponse.json({ ...snapshot, previousScores: null })
    }

    return NextResponse.json({ error: 'No crawls found' }, { status: 404 })
}
