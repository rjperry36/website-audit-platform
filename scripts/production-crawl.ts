#!/usr/bin/env node

/**
 * Production crawl script using ScreenshotOne API
 * Works on Vercel serverless - no browser needed!
 */

import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import { ConfigManager } from '../lib/config';
import { StorageManager } from '../lib/storage';
import { logger } from '../lib/logger';
import { captureScreenshots, extractPageTitle } from '../lib/crawl/screenshot-capture';
import { extractSEOData, extractAEOData, auditSEO, auditAEO } from '../lib/audit/seo-analyzer';
import { extractGEOData, auditGEO } from '../lib/audit/geo-analyzer';
import { extractUXData, auditAccessibility, auditMobileUsability, calculateUXScore } from '../lib/audit/ux-analyzer';
import { TEST_SITE_CONFIG } from '../lib/client-config';

/**
 * Fetch HTML from URL
 */
async function fetchHTML(url: string): Promise<string> {
    logger.info(`Fetching HTML from ${url}...`);

    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    return await response.text();
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
    });

    return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;
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

        logger.info(`Starting production crawl for ${site.name}...`);
        logger.info(`URL: ${site.rootUrl}`);

        // Create crawl directory
        const crawlDate = StorageManager.getTodaysCrawlDate();
        const crawlDir = await StorageManager.createCrawlDirectory(siteId, crawlDate);

        logger.info(`Crawl directory: ${crawlDir}`);

        // Step 1: Fetch HTML
        const html = await fetchHTML(site.rootUrl);
        logger.success('✓ HTML fetched');

        // Step 2: Extract page title
        const title = await extractPageTitle(site.rootUrl);
        logger.info(`Page title: ${title || 'N/A'}`);

        // Step 3: Capture screenshots using ScreenshotOne
        logger.info('Capturing screenshots via ScreenshotOne API...');
        const screenshots = await captureScreenshots({
            url: site.rootUrl,
            siteId,
            crawlDate,
            title,
        });

        if (!screenshots) {
            throw new Error('Failed to capture screenshots');
        }

        // Save screenshots
        const screenshotsDir = path.join(crawlDir, 'screenshots');
        const desktopDir = path.join(screenshotsDir, 'desktop');
        const mobileDir = path.join(screenshotsDir, 'mobile');

        await fs.mkdir(desktopDir, { recursive: true });
        await fs.mkdir(mobileDir, { recursive: true });

        const desktopPath = path.join(desktopDir, 'homepage.png');
        const mobilePath = path.join(mobileDir, 'homepage.png');

        await fs.writeFile(desktopPath, screenshots.desktop);
        await fs.writeFile(mobilePath, screenshots.mobile);

        logger.success('✓ Screenshots saved');

        // Step 4: Run all analyzers
        logger.info('Analyzing SEO...');
        const seoData = extractSEOData(html, site.rootUrl);
        const seoFindings = auditSEO(seoData);

        logger.info('Analyzing AEO...');
        const aeoData = extractAEOData(html);
        const aeoFindings = auditAEO(aeoData);

        logger.info('Analyzing GEO...');
        const geoData = extractGEOData(html);
        const geoFindings = auditGEO(geoData);

        logger.info('Analyzing UX...');
        const uxData = extractUXData(html);
        const accessibilityFindings = auditAccessibility(uxData, seoData);
        const mobileFindings = auditMobileUsability(uxData);
        const allUXFindings = [...accessibilityFindings, ...mobileFindings];

        // Step 5: Calculate scores
        const seoScore = calculateScore(seoFindings);
        const aeoScore = calculateScore(aeoFindings);
        const geoScore = calculateScore(geoFindings);
        const uxScore = calculateUXScore(allUXFindings);
        const overallScore = Math.round((seoScore + aeoScore + geoScore + uxScore) / 4);

        logger.success('✓ Analysis complete');

        // Step 6: Create audit report
        const report = {
            siteId,
            crawlDate,
            url: site.rootUrl,
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
            screenshots: {
                desktop: desktopPath,
                mobile: mobilePath,
            },
        };

        // Save report
        const reportsDir = path.join(crawlDir, 'reports');
        await fs.mkdir(reportsDir, { recursive: true });

        const reportPath = path.join(reportsDir, 'audit-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        logger.success('✓ Audit report saved');

        // Update last crawl timestamp
        await ConfigManager.updateSite(siteId, {
            lastCrawlTimestamp: new Date().toISOString(),
        });

        // Final summary
        console.log('\n' + '='.repeat(60));
        console.log('✓ CRAWL COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log(`\n📊 Overall Score: ${overallScore}/100\n`);
        console.log(`   SEO:  ${seoScore}/100`);
        console.log(`   AEO:  ${aeoScore}/100`);
        console.log(`   GEO:  ${geoScore}/100`);
        console.log(`   UX:   ${uxScore}/100`);
        console.log(`\n📁 Report: ${reportPath}`);
        console.log(`📸 Screenshots: ${screenshotsDir}\n`);
        console.log('='.repeat(60) + '\n');

        return report;

    } catch (error) {
        logger.error('Crawl failed', error as Error);
        process.exit(1);
    }
}

// Run crawl
crawlSite();
