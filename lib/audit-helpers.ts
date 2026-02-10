import { Finding } from '@/lib/types'

export interface SEOAuditResult {
    overall: {
        score: number
        findings: Finding[]
    }
    traditional: {
        score: number
        findings: Finding[]
    }
    aeo: {
        score: number
        findings: Finding[]
    }
    geo: {
        score: number
        findings: Finding[]
    }
}

/**
 * Helper to load audit data from storage
 */
export async function loadAuditData(siteId: string): Promise<SEOAuditResult | null> {
    try {
        // This will be implemented to read from audit-data directory
        // For now, return mock data
        return null
    } catch (error) {
        console.error('Error loading audit data:', error)
        return null
    }
}

/**
 * Get the latest audit for a site
 */
export async function getLatestAudit(siteId: string): Promise<SEOAuditResult | null> {
    return loadAuditData(siteId)
}

/**
 * Get all available sites
 */
export async function getAvailableSites(): Promise<string[]> {
    // This will scan the audit-data directory
    // For now, return empty array
    return []
}
