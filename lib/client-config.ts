// Client-side configuration storage using localStorage
// This is a temporary solution for Vercel deployment where filesystem is read-only

import { AuditConfig, SiteConfig } from './types';

/**
 * Static test site configuration
 */
export const TEST_SITE_CONFIG = {
    id: 'site-adm-indicia',
    name: 'ADM Indicia',
    rootUrl: 'https://adm-indicia.com/our-work/',
    crawlIntervalDays: 3,
    maxPages: 1,
} as const;

/**
 * Get the test site ID
 */
export function getTestSiteId(): string {
    return TEST_SITE_CONFIG.id;
}

/**
 * Get the test site name
 */
export function getTestSiteName(): string {
    return TEST_SITE_CONFIG.name;
}

/**
 * Get the test site URL
 */
export function getTestSiteUrl(): string {
    return TEST_SITE_CONFIG.rootUrl;
}

const STORAGE_KEY = 'audit-config';

const DEFAULT_CONFIG: AuditConfig = {
    sites: [],
};

export class ClientConfigManager {
    /**
     * Load configuration from localStorage
     */
    static load(): AuditConfig {
        if (typeof window === 'undefined') {
            return DEFAULT_CONFIG;
        }

        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                return DEFAULT_CONFIG;
            }
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading config:', error);
            return DEFAULT_CONFIG;
        }
    }

    /**
     * Save configuration to localStorage
     */
    static save(config: AuditConfig): void {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch (error) {
            console.error('Error saving config:', error);
        }
    }

    /**
     * Get all sites
     */
    static getSites(): SiteConfig[] {
        const config = this.load();
        return config.sites;
    }

    /**
     * Get a specific site by ID
     */
    static getSite(siteId: string): SiteConfig | null {
        const config = this.load();
        return config.sites.find((site) => site.id === siteId) || null;
    }

    /**
     * Add a new site
     */
    static addSite(site: SiteConfig): void {
        const config = this.load();

        // Check if site ID already exists
        if (config.sites.some((s) => s.id === site.id)) {
            throw new Error(`Site with ID ${site.id} already exists`);
        }

        config.sites.push(site);
        this.save(config);
    }

    /**
     * Update an existing site
     */
    static updateSite(siteId: string, updates: Partial<SiteConfig>): void {
        const config = this.load();
        const index = config.sites.findIndex((site) => site.id === siteId);

        if (index === -1) {
            throw new Error(`Site with ID ${siteId} not found`);
        }

        config.sites[index] = { ...config.sites[index], ...updates };
        this.save(config);
    }

    /**
     * Delete a site
     */
    static deleteSite(siteId: string): void {
        const config = this.load();
        const index = config.sites.findIndex((site) => site.id === siteId);

        if (index === -1) {
            throw new Error(`Site with ID ${siteId} not found`);
        }

        config.sites.splice(index, 1);
        this.save(config);
    }

    /**
     * Generate a unique site ID
     */
    static generateSiteId(): string {
        return `site-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
}
