
import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import { ConfigManager } from '@/lib/config'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
        return new NextResponse('Path is required', { status: 400 })
    }

    // Security check: Ensure path is within audit-data directory
    const normalizedPath = path.normalize(filePath)
    const auditDataDir = path.join(process.cwd(), 'audit-data')

    // Check if the requested file is actually inside the audit-data directory
    // We construct the full path and check if it starts with the audit-data directory
    // But the filePath coming from the report might be absolute or relative
    // In our case, the report has absolute paths: /Users/.../audit-data/...

    // Let's handle both cases safely
    let fullPath = filePath
    if (!path.isAbsolute(filePath)) {
        fullPath = path.join(process.cwd(), filePath)
    }

    if (!fullPath.startsWith(auditDataDir)) {
        console.error('Access denied:', fullPath)
        return new NextResponse('Access denied', { status: 403 })
    }

    try {
        const fileBuffer = await fs.readFile(fullPath)
        const ext = path.extname(fullPath).toLowerCase()
        let contentType = 'image/png'

        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
        if (ext === '.webp') contentType = 'image/webp'

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
            }
        })
    } catch (error) {
        console.error('Error serving screenshot:', error)
        return new NextResponse('File not found', { status: 404 })
    }
}
