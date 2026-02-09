// Core type definitions for the Website Audit Platform

export interface SiteConfig {
    id: string;
    name: string;
    rootUrl: string;
    crawlIntervalDays: number;
    lastCrawlTimestamp: string | null;
    maxPages: number;
    excludePatterns: string[];
    guidelines: BrandGuidelines;
}

export interface BrandGuidelines {
    global: GuidelineSet;
    pageTypes: Record<string, GuidelineSet>;
}

export interface GuidelineSet {
    referenceImages: string[];
    specs: BrandSpecs;
    rules: GuidelineRule[];
}

export interface BrandSpecs {
    primaryColour?: string;
    secondaryColour?: string;
    fontPrimary?: string;
    fontSecondary?: string;
    logoPosition?: string;
    maxLogoHeight?: string;
    ctaColour?: string;
    ctaBorderRadius?: string;
    [key: string]: string | undefined;
}

export interface GuidelineRule {
    id: string;
    description: string;
    level: 'mandatory' | 'advisory' | 'acceptable';
    category: 'brand-visual' | 'seo' | 'accessibility' | 'performance';
}

export interface AuditConfig {
    sites: SiteConfig[];
}

export interface CrawlReport {
    siteId: string;
    crawlDate: string;
    crawlDuration: string;
    totalPages: number;
    summary: AuditSummary;
    pages: PageAudit[];
}

export interface AuditSummary {
    overallScore: number;
    mandatory: ScoreBreakdown;
    advisory: ScoreBreakdown;
    acceptable: ScoreBreakdown;
}

export interface ScoreBreakdown {
    pass: number;
    fail: number;
    total: number;
}

export interface PageAudit {
    url: string;
    title: string;
    pageType: string;
    screenshots: {
        desktop: string;
        mobile: string;
    };
    audits: {
        seo: CategoryAudit;
        accessibility: CategoryAudit;
        performance: PerformanceAudit;
        brandCompliance: CategoryAudit;
    };
}

export interface CategoryAudit {
    score: number;
    findings: Finding[];
}

export interface PerformanceAudit extends CategoryAudit {
    coreWebVitals?: CoreWebVitals;
}

export interface CoreWebVitals {
    lcp: Metric;
    cls: Metric;
    inp: Metric;
    fcp?: Metric;
    tti?: Metric;
    tbt?: Metric;
}

export interface Metric {
    value: number;
    unit: string;
    rating: 'good' | 'needs-improvement' | 'poor';
}

export interface Finding {
    ruleId: string;
    description: string;
    level: 'mandatory' | 'advisory' | 'acceptable';
    status: 'pass' | 'fail' | 'warning';
    value?: string;
    recommendation?: string | null;
    evidence?: string;
}

export interface CrawlResult {
    url: string;
    title: string;
    statusCode: number;
    html: string;
    screenshots: {
        desktop: string;
        mobile: string;
    };
    timestamp: string;
}

export interface CrawlProgress {
    total: number;
    completed: number;
    current: string;
    errors: string[];
}
