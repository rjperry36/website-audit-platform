import { NextResponse } from 'next/server';
import { ConfigManager } from '@/lib/config';

/**
 * GET /api/sites/[siteId]
 * Get a specific site configuration
 */
export async function GET(
    request: Request,
    { params }: { params: { siteId: string } }
) {
    try {
        const site = await ConfigManager.getSite(params.siteId);

        if (!site) {
            return NextResponse.json(
                { error: 'Site not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ site });
    } catch (error) {
        console.error('Error fetching site:', error);
        return NextResponse.json(
            { error: 'Failed to fetch site' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/sites/[siteId]
 * Update a site configuration
 */
export async function PUT(
    request: Request,
    { params }: { params: { siteId: string } }
) {
    try {
        const body = await request.json();

        await ConfigManager.updateSite(params.siteId, body);
        const updatedSite = await ConfigManager.getSite(params.siteId);

        return NextResponse.json({ site: updatedSite });
    } catch (error) {
        console.error('Error updating site:', error);
        return NextResponse.json(
            { error: 'Failed to update site' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/sites/[siteId]
 * Delete a site configuration
 */
export async function DELETE(
    request: Request,
    { params }: { params: { siteId: string } }
) {
    try {
        await ConfigManager.deleteSite(params.siteId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting site:', error);
        return NextResponse.json(
            { error: 'Failed to delete site' },
            { status: 500 }
        );
    }
}
