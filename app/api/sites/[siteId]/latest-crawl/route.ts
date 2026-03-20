
import { NextResponse } from 'next/server'
import { ConfigManager } from '@/lib/config'
import { StorageManager } from '@/lib/storage'
import path from 'path'
import { promises as fs } from 'fs'

export async function GET(
    request: Request,
    { params }: { params: { siteId: string } }
) {
    try {
        const { siteId } = params

        // 1. Get site config to verify it exists
        const site = await ConfigManager.getSite(siteId)
        if (!site) {
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
            // Directory doesn't exist or other FS error
            return NextResponse.json(
                { error: 'No crawls found' },
                { status: 404 }
            )
        }

    } catch (error) {
        console.error('Error fetching latest crawl:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
