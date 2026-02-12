/**
 * Security Analyzer - Extracts security data from HTML and Headers
 */

import * as cheerio from 'cheerio';

export interface SecurityData {
    // Headers
    https: boolean;
    hsts: string | null;
    csp: string | null;
    xFrameOptions: string | null;
    xContentTypeOptions: string | null;
    referrerPolicy: string | null;
    permissionsPolicy: string | null;
    server: string | null;
    xPoweredBy: string | null;

    // HTML Inputs
    externalLinks: Array<{ href: string; rel: string; target: string }>;
    resources: Array<{ src: string; type: 'script' | 'style' | 'image' }>;
}

/**
 * Extract Security data from HTML and Headers
 */
export function extractSecurityData(html: string, headers: Headers, url: string): SecurityData {
    const $ = cheerio.load(html);

    // Headers extraction
    // Note: Headers keys are case-insensitive, but we'll try standard casing and lowercase
    const getHeader = (name: string) => headers.get(name) || headers.get(name.toLowerCase()) || null;

    const hsts = getHeader('Strict-Transport-Security');
    const csp = getHeader('Content-Security-Policy');
    const xFrameOptions = getHeader('X-Frame-Options');
    const xContentTypeOptions = getHeader('X-Content-Type-Options');
    const referrerPolicy = getHeader('Referrer-Policy');
    const permissionsPolicy = getHeader('Permissions-Policy');
    const server = getHeader('Server');
    const xPoweredBy = getHeader('X-Powered-By');

    // HTTPS check
    const https = url.startsWith('https://');

    // External links analysis
    const externalLinks: Array<{ href: string; rel: string; target: string }> = [];
    $('a[href^="http"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        const rel = $(el).attr('rel') || '';
        const target = $(el).attr('target') || '';

        // Simple distinct domain check
        try {
            const linkUrl = new URL(href);
            const siteUrl = new URL(url);
            if (linkUrl.hostname !== siteUrl.hostname) {
                externalLinks.push({ href, rel, target });
            }
        } catch (e) {
            // Invalid URL, ignore
        }
    });

    // Mixed content / Resource analysis
    const resources: Array<{ src: string; type: 'script' | 'style' | 'image' }> = [];

    // Scripts
    $('script[src]').each((_, el) => {
        resources.push({ src: $(el).attr('src') || '', type: 'script' });
    });

    // Styles
    $('link[rel="stylesheet"]').each((_, el) => {
        resources.push({ src: $(el).attr('href') || '', type: 'style' });
    });

    // Images
    $('img[src]').each((_, el) => {
        resources.push({ src: $(el).attr('src') || '', type: 'image' });
    });

    return {
        https,
        hsts,
        csp,
        xFrameOptions,
        xContentTypeOptions,
        referrerPolicy,
        permissionsPolicy,
        server,
        xPoweredBy,
        externalLinks,
        resources
    };
}
