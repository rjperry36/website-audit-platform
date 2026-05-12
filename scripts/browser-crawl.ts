#!/usr/bin/env node

/**
 * Browser-based crawl script
 * Uses browser subagent to navigate, capture screenshots, and extract HTML
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import { ConfigManager } from '../lib/config';
import { StorageManager } from '../lib/storage';
import { logger } from '../lib/logger';
import { extractSEOData, extractAEOData, auditSEO, auditAEO } from '../lib/audit/seo-analyzer';
import { extractGEOData, auditGEO } from '../lib/audit/geo-analyzer';
import { extractUXData, auditAccessibility, auditMobileUsability, calculateUXScore } from '../lib/audit/ux-analyzer';
import { TEST_SITE_CONFIG } from '../lib/client-config';

interface CrawlResult {
    desktopScreenshot: string; // base64
    mobileScreenshot: string; // base64
    html: string;
    url: string;
    screenshotPath?: string; // Path to desktop screenshot for AI analysis
}

/**
 * Main crawl function
 */
async function crawlSite() {
    try {
        const siteId = TEST_SITE_CONFIG.id;
        const site = await ConfigManager.getSite(siteId);

        if (!site) {
            throw new Error(`Site ${siteId} not found`);
        }

        logger.info(`Starting local crawl for ${site.name}...`);
        logger.info(`URL: ${site.rootUrl}`);

        // Create crawl directory
        const crawlDate = StorageManager.getTodaysCrawlDate();
        await StorageManager.createCrawlDirectory(siteId, crawlDate);

        // 1. Capture Screenshots
        const { captureScreenshots, extractPageTitle } = await import('../lib/crawl/screenshot-capture');

        logger.info('Capturing screenshots...');
        const title = await extractPageTitle(site.rootUrl);

        const screenshots = await captureScreenshots({
            url: site.rootUrl,
            siteId,
            crawlDate,
            title
        });

        if (!screenshots) {
            throw new Error('Failed to capture screenshots');
        }

        // 2. Get HTML
        logger.info('Fetching page HTML...');
        const response = await fetch(site.rootUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = await response.text();

        // 3. Process Results
        // Construct the expected path so we can pass it
        const crawlDir = path.join(process.cwd(), 'audit-data', siteId, 'crawls', crawlDate);
        const desktopPath = path.join(crawlDir, 'screenshots', 'desktop', 'homepage.png');

        const result: CrawlResult = {
            desktopScreenshot: screenshots.desktop.toString('base64'),
            mobileScreenshot: screenshots.mobile.toString('base64'),
            html,
            url: site.rootUrl,
            screenshotPath: desktopPath
        };

        await processCrawlResults(siteId, crawlDate, result);

    } catch (error) {
        logger.error('Crawl failed', error as Error);
        process.exit(1);
    }
}

/**
 * Process crawl results (to be called after browser automation)
 */
export async function processCrawlResults(siteId: string, crawlDate: string, result: CrawlResult) {
    try {
        logger.info('Processing crawl results...');

        const crawlDir = path.join(process.cwd(), 'audit-data', siteId, 'crawls', crawlDate);

        // Save screenshots
        const desktopPath = path.join(crawlDir, 'screenshots', 'desktop', 'homepage.png');
        const mobilePath = path.join(crawlDir, 'screenshots', 'mobile', 'homepage.png');

        // Ensure directories exist (processCrawlResults might be called independently)
        await fs.mkdir(path.dirname(desktopPath), { recursive: true });
        await fs.mkdir(path.dirname(mobilePath), { recursive: true });
        await fs.mkdir(path.join(crawlDir, 'reports'), { recursive: true });

        await fs.writeFile(desktopPath, Buffer.from(result.desktopScreenshot, 'base64'));
        await fs.writeFile(mobilePath, Buffer.from(result.mobileScreenshot, 'base64'));

        logger.success('Screenshots saved');

        // Extract SEO data
        logger.info('Analyzing SEO...');
        const seoData = extractSEOData(result.html, result.url);
        const seoFindings = auditSEO(seoData);

        // Extract AEO data
        logger.info('Analyzing AEO...');
        const aeoData = extractAEOData(result.html);
        const aeoFindings = auditAEO(aeoData);

        // Extract GEO data
        logger.info('Analyzing GEO...');
        const geoData = extractGEOData(result.html);
        const geoFindings = auditGEO(geoData);

        // Extract UX data
        logger.info('Analyzing UX...');
        const uxData = extractUXData(result.html);
        const accessibilityFindings = auditAccessibility(uxData, seoData);
        const mobileFindings = auditMobileUsability(uxData);


        // AI Visual Analysis
        let visualFindings: any[] = [];
        let experienceFindings: any[] = [];
        let personaFindings: any[] = [];
        let cialdiniFindings: any[] = [];

        if (process.env.OPENAI_API_KEY) {
            try {
                logger.info('Running AI Visual Analysis on desktop screenshot...');

                // Dynamic import to avoid issues if module missing
                const { auditVisualDesign } = await import('../lib/audit/visual-analyzer');

                // Use the desktopPath we just saved to
                const aiResult = await auditVisualDesign(desktopPath);
                const aiFindings = aiResult.findings;

                // Split findings into categories based on rule ID
                visualFindings = aiFindings.filter(f => f.ruleId.startsWith('UX-VIS'));
                experienceFindings = aiFindings.filter(f => f.ruleId.startsWith('UX-EXP') || f.ruleId === 'UX-AI-ERROR');
                personaFindings = aiFindings.filter(f => f.ruleId.startsWith('UX-PERSONA'));
                cialdiniFindings = aiFindings.filter(f => f.ruleId.startsWith('UX-CIALDINI'));

            } catch (error) {
                logger.error(`AI Visual Analysis failed: ${(error as Error).message}`);
            }
        }

        const allUXFindings = [
            ...accessibilityFindings,
            ...mobileFindings,
            ...visualFindings,
            ...experienceFindings,
            ...personaFindings,
            ...cialdiniFindings
        ];
        const seoScore = calculateScore(seoFindings);
        const aeoScore = calculateScore(aeoFindings);
        const geoScore = calculateScore(geoFindings);
        const uxScore = calculateUXScore(allUXFindings);
        const overallScore = Math.round((seoScore + aeoScore + geoScore + uxScore) / 4);

        // Create audit report
        const report = {
            siteId,
            crawlDate,
            url: result.url,
            timestamp: new Date().toISOString(),
            scores: {
                overall: overallScore,
                seo: seoScore,
                aeo: aeoScore,
                geo: geoScore,
                ux: uxScore,
            },
            findings: {
                seo: seoFindings,
                aeo: aeoFindings,
                geo: geoFindings,
                ux: {
                    accessibility: accessibilityFindings,
                    mobile: mobileFindings,
                    visualDesign: visualFindings,
                    userExperience: experienceFindings,
                    personas: personaFindings,
                    cialdini: cialdiniFindings,
                },
            },
            metadata: {
                title: seoData.title,
                description: seoData.metaDescription,
                h1: seoData.h1Tags[0] || null,
            },
            screenshots: {
                desktop: desktopPath,
                mobile: mobilePath
            }
        };

        // Save report
        const reportPath = path.join(crawlDir, 'reports', 'audit-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        logger.success('Audit report saved');

        // Update last crawl timestamp
        await ConfigManager.updateSite(siteId, {
            lastCrawlTimestamp: new Date().toISOString(),
        });

        logger.success('✓ Crawl completed successfully!');
        logger.info(`Overall Score: ${overallScore}/100`);
        logger.info(`SEO: ${seoScore}/100 | AEO: ${aeoScore}/100 | GEO: ${geoScore}/100 | UX: ${uxScore}/100`);
        logger.info(`Report: ${reportPath}`);

        return report;

    } catch (error) {
        logger.error('Failed to process crawl results', error as Error);
        throw error;
    }
}

/**
 * Calculate score from findings
 */
function calculateScore(findings: any[]): number {
    if (findings.length === 0) return 100;

    const weights = {
        mandatory: 3,
        advisory: 2,
        acceptable: 1,
    };

    let totalWeight = 0;
    let earnedWeight = 0;

    findings.forEach((finding) => {
        const weight = weights[finding.level as keyof typeof weights] || 1;
        totalWeight += weight;

        if (finding.status === 'pass') {
            earnedWeight += weight;
        } else if (finding.status === 'warning') {
            earnedWeight += weight * 0.5;
        }
        // fail = 0 points
    });

    return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;
}

// Run crawl if main module
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    crawlSite();
}
