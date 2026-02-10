#!/usr/bin/env node

/**
 * Browser-based crawl script
 * Uses browser subagent to navigate, capture screenshots, and extract HTML
 */

import { promises as fs } from 'fs';
import path from 'path';
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

        logger.info(`Starting browser crawl for ${site.name}...`);
        logger.info(`URL: ${site.rootUrl}`);

        // Create crawl directory
        const crawlDate = StorageManager.getTodaysCrawlDate();
        const crawlDir = await StorageManager.createCrawlDirectory(siteId, crawlDate);

        logger.info(`Crawl directory: ${crawlDir}`);

        // NOTE: This script is designed to be run manually with browser subagent
        // The browser subagent will:
        // 1. Navigate to the URL
        // 2. Capture desktop screenshot (1920x1080)
        // 3. Get page HTML
        // 4. Resize to mobile (375x667)
        // 5. Capture mobile screenshot
        // 6. Return all data

        logger.info('\n=== MANUAL CRAWL INSTRUCTIONS ===');
        logger.info('This script needs to be run with browser automation.');
        logger.info('The browser will:');
        logger.info(`1. Navigate to: ${site.rootUrl}`);
        logger.info('2. Capture desktop screenshot (1920x1080)');
        logger.info('3. Extract page HTML');
        logger.info('4. Resize to mobile (375x667)');
        logger.info('5. Capture mobile screenshot');
        logger.info('\nPlease run the browser crawl manually or wait for automation.');
        logger.info('===================================\n');

        // For now, create placeholder structure
        const screenshotsDir = path.join(crawlDir, 'screenshots');
        const desktopDir = path.join(screenshotsDir, 'desktop');
        const mobileDir = path.join(screenshotsDir, 'mobile');
        const reportsDir = path.join(crawlDir, 'reports');

        await fs.mkdir(desktopDir, { recursive: true });
        await fs.mkdir(mobileDir, { recursive: true });
        await fs.mkdir(reportsDir, { recursive: true });

        logger.success('Crawl directory structure created');
        logger.info('Ready for browser automation');

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
        const allUXFindings = [...accessibilityFindings, ...mobileFindings];

        // Calculate scores
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
                },
            },
            metadata: {
                title: seoData.title,
                description: seoData.metaDescription,
                h1: seoData.h1Tags[0] || null,
            },
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

// Run crawl
crawlSite();
