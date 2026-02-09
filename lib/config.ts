import fs from 'fs/promises';
import path from 'path';
import { AuditConfig, SiteConfig } from './types';
import { logger } from './logger';

const CONFIG_FILE = path.join(process.cwd(), 'audit-config.json');

const DEFAULT_CONFIG: AuditConfig = {
    sites: [],
};

export class ConfigManager {
    /**
     * Load the audit configuration from disk
     */
    static async load(): Promise<AuditConfig> {
        try {
            const data = await fs.readFile(CONFIG_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                logger.info('Config file not found, creating default configuration');
                await this.save(DEFAULT_CONFIG);
                return DEFAULT_CONFIG;
            }
            throw error;
        }
    }

    /**
     * Save the audit configuration to disk
     */
    static async save(config: AuditConfig): Promise<void> {
        await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
        logger.success('Configuration saved');
    }

    /**
     * Get all sites
     */
    static async getSites(): Promise<SiteConfig[]> {
        const config = await this.load();
        return config.sites;
    }

    /**
     * Get a specific site by ID
     */
    static async getSite(siteId: string): Promise<SiteConfig | null> {
        const config = await this.load();
        return config.sites.find((site) => site.id === siteId) || null;
    }

    /**
     * Add a new site
     */
    static async addSite(site: SiteConfig): Promise<void> {
        const config = await this.load();

        // Check if site ID already exists
        if (config.sites.some((s) => s.id === site.id)) {
            throw new Error(`Site with ID ${site.id} already exists`);
        }

        config.sites.push(site);
        await this.save(config);
        logger.success(`Site ${site.name} added`);
    }

    /**
     * Update an existing site
     */
    static async updateSite(siteId: string, updates: Partial<SiteConfig>): Promise<void> {
        const config = await this.load();
        const index = config.sites.findIndex((site) => site.id === siteId);

        if (index === -1) {
            throw new Error(`Site with ID ${siteId} not found`);
        }

        config.sites[index] = { ...config.sites[index], ...updates };
        await this.save(config);
        logger.success(`Site ${siteId} updated`);
    }

    /**
     * Delete a site
     */
    static async deleteSite(siteId: string): Promise<void> {
        const config = await this.load();
        const index = config.sites.findIndex((site) => site.id === siteId);

        if (index === -1) {
            throw new Error(`Site with ID ${siteId} not found`);
        }

        config.sites.splice(index, 1);
        await this.save(config);
        logger.success(`Site ${siteId} deleted`);
    }

    /**
     * Generate a unique site ID
     */
    static generateSiteId(): string {
        return `site-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
}
