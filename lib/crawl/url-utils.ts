// URL utility functions for crawling

/**
 * Normalize a URL by removing trailing slashes and sorting query params
 */
export function normalizeUrl(url: string): string {
    try {
        const urlObj = new URL(url);

        // Remove trailing slash from pathname
        urlObj.pathname = urlObj.pathname.replace(/\/$/, '') || '/';

        // Sort query parameters
        const params = Array.from(urlObj.searchParams.entries()).sort();
        urlObj.search = '';
        params.forEach(([key, value]) => urlObj.searchParams.append(key, value));

        // Remove fragment
        urlObj.hash = '';

        return urlObj.toString();
    } catch (error) {
        return url;
    }
}

/**
 * Extract domain from URL and convert to slug format (dots to hyphens)
 */
export function getDomainSlug(url: string): string {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace(/\./g, '-');
    } catch (error) {
        return 'unknown';
    }
}

/**
 * Generate a slug from page title or URL path
 */
export function generatePageSlug(title: string | null, url: string): string {
    if (title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
            .substring(0, 50) || 'page'; // Limit length
    }

    // Fallback to URL path
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname.replace(/^\/|\/$/g, '');
        return path.replace(/\//g, '-') || 'homepage';
    } catch (error) {
        return 'page';
    }
}

/**
 * Check if a URL is internal to the given site
 */
export function isInternalUrl(url: string, siteUrl: string): boolean {
    try {
        const urlObj = new URL(url);
        const siteObj = new URL(siteUrl);
        return urlObj.hostname === siteObj.hostname;
    } catch (error) {
        return false;
    }
}

/**
 * Check if URL matches any exclude pattern (glob-style)
 */
export function matchesExcludePattern(url: string, patterns: string[]): boolean {
    if (patterns.length === 0) return false;

    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;

        return patterns.some(pattern => {
            // Convert glob pattern to regex
            const regexPattern = pattern
                .replace(/\./g, '\\.') // Escape dots
                .replace(/\*/g, '.*') // Convert * to .*
                .replace(/\?/g, '.'); // Convert ? to .

            const regex = new RegExp(`^${regexPattern}$`);

            // Check if path matches pattern
            if (regex.test(path)) return true;

            // Also check full URL for patterns like *.pdf
            if (regex.test(url)) return true;

            return false;
        });
    } catch (error) {
        return false;
    }
}

/**
 * Convert relative URL to absolute URL
 */
export function resolveUrl(baseUrl: string, relativeUrl: string): string {
    try {
        return new URL(relativeUrl, baseUrl).toString();
    } catch (error) {
        return relativeUrl;
    }
}

/**
 * Extract all URLs from HTML content
 */
export function extractUrlsFromHtml(html: string, baseUrl: string): string[] {
    const urls: Set<string> = new Set();

    // Match href attributes in anchor tags
    const hrefRegex = /<a[^>]+href=["']([^"']+)["']/gi;
    let match;

    while ((match = hrefRegex.exec(html)) !== null) {
        const url = match[1];

        // Skip anchors, mailto, tel, javascript
        if (url.startsWith('#') ||
            url.startsWith('mailto:') ||
            url.startsWith('tel:') ||
            url.startsWith('javascript:')) {
            continue;
        }

        // Resolve relative URLs
        const absoluteUrl = resolveUrl(baseUrl, url);

        // Only add internal URLs
        if (isInternalUrl(absoluteUrl, baseUrl)) {
            urls.add(normalizeUrl(absoluteUrl));
        }
    }

    return Array.from(urls);
}
