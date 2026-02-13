
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

            // 3. Read the report file
            const reportContent = await fs.readFile(reportPath, 'utf-8')
            const report = JSON.parse(reportContent)

            // 4. Transform image paths to be accessible via API/static serving if needed
            // For now, we'll assume the frontend handles the path mapping or we serve them statically
            // Actually, Next.js needs these to be in public/ or served via an endpoint.
            // Since they are in audit-data (outside public), we might need a separate image serving route
            // or we can copy them to public. 
            // For MVP, let's return the report and let the frontend try to load them.
            // We might need to map absolute paths to relative URLs if we set up a static file route.

            // Let's create a mapped version of screenshots for the frontend
            // We'll create a route /api/sites/[siteId]/crawls/[date]/screenshot/[type] later
            // For now, let's just return the raw paths as they are in the JSON

            return NextResponse.json(report)

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
