import { NextResponse } from 'next/server';
import { ConfigManager } from '@/lib/config';
import { StorageManager } from '@/lib/storage';
import { SiteConfig } from '@/lib/types';

/**
 * GET /api/sites
 * Get all configured sites
 */
export async function GET() {
    try {
        const sites = await ConfigManager.getSites();
        return NextResponse.json({ sites });
    } catch (error) {
        console.error('Error fetching sites:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sites' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/sites
 * Create a new site configuration
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.rootUrl) {
            return NextResponse.json(
                { error: 'Missing required fields: name, rootUrl' },
                { status: 400 }
            );
        }

        // Create new site config
        const newSite: SiteConfig = {
            id: ConfigManager.generateSiteId(),
            name: body.name,
            rootUrl: body.rootUrl,
            crawlIntervalDays: body.crawlIntervalDays || 7,
            lastCrawlTimestamp: null,
            maxPages: body.maxPages || 100,
            excludePatterns: body.excludePatterns || [],
            guidelines: body.guidelines || {
                global: {
                    referenceImages: [],
                    specs: {},
                    rules: [],
                },
                pageTypes: {},
            },
        };

        // Add site to config
        await ConfigManager.addSite(newSite);

        // Initialize storage directory
        await StorageManager.initializeSiteDirectory(newSite.id);

        return NextResponse.json({ site: newSite }, { status: 201 });
    } catch (error) {
        console.error('Error creating site:', error);
        return NextResponse.json(
            { error: 'Failed to create site' },
            { status: 500 }
        );
    }
}
