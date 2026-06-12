
import 'dotenv/config';
import { ConfigManager } from '../config';
import { StorageManager } from '../storage';
import { logger } from '../logger';
import { captureScreenshots, extractPageTitle } from './screenshot-capture';
import { extractSEOData, extractAEOData, auditSEO, auditAEO } from '../audit/seo-analyzer';
import { extractGEOData, auditGEO } from '../audit/geo-analyzer';
import { extractUXData, auditAccessibility, auditMobileUsability, calculateUXScore } from '../audit/ux-analyzer';
import { auditVisualDesign } from '../audit/visual-analyzer';
import { saveReport } from '../audit/report-store';
import { TEST_SITE_CONFIG } from '../client-config';

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

    const weights = { mandatory: 3, advisory: 2, acceptable: 1 };

    let totalWeight = 0;
    let earnedWeight = 0;

    findings.forEach((finding: any) => {
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
 * Resolve a site's name + rootUrl. Reads the filesystem config when available
 * (local dev); falls back to the committed TEST_SITE_CONFIG so the crawl still
 * runs on Vercel, where audit-config.json is absent. (DR-0007)
 */
async function resolveSite(siteId: string): Promise<{ name: string; rootUrl: string }> {
    try {
        const site = await ConfigManager.getSite(siteId);
        if (site) return { name: site.name, rootUrl: site.rootUrl };
    } catch {
        // read-only FS / missing config — fall through to the committed default
    }
    if (siteId === TEST_SITE_CONFIG.id) {
        return { name: TEST_SITE_CONFIG.name, rootUrl: TEST_SITE_CONFIG.rootUrl };
    }
    throw new Error(`Site ${siteId} not found in config and is not the committed default`);
}

/**
 * Run a production crawl for a single site: DOM analysis + gpt-4o visual
 * analysis, persisted to Supabase (Postgres report row + Storage screenshots).
 * No filesystem writes — works on Vercel's read-only FS.
 */
export async function crawlSite(siteId: string) {
    const site = await resolveSite(siteId);

    logger.info(`Starting production crawl for ${site.name}...`);
    logger.info(`URL: ${site.rootUrl}`);

    const crawlDate = StorageManager.getTodaysCrawlDate();

    // Step 1: Fetch HTML
    const html = await fetchHTML(site.rootUrl);
    logger.success('✓ HTML fetched');

    // Step 2: Page title
    const title = await extractPageTitle(site.rootUrl);
    logger.info(`Page title: ${title || 'N/A'}`);

    // Step 3: Screenshots (JPEG buffers — held in memory, uploaded to Storage)
    logger.info('Capturing screenshots via ScreenshotOne API...');
    const screenshots = await captureScreenshots({ url: site.rootUrl, siteId, crawlDate, title });
    if (!screenshots) {
        throw new Error('Failed to capture screenshots');
    }
    logger.success('✓ Screenshots captured');

    // Step 4: DOM analyzers
    logger.info('Analyzing SEO...');
    const seoData = extractSEOData(html, site.rootUrl);
    const seoFindings = auditSEO(seoData);

    logger.info('Analyzing AEO...');
    const aeoFindings = auditAEO(extractAEOData(html));

    logger.info('Analyzing GEO...');
    const geoFindings = auditGEO(extractGEOData(html));

    logger.info('Analyzing UX...');
    const uxData = extractUXData(html);
    const accessibilityFindings = auditAccessibility(uxData, seoData);
    const mobileFindings = auditMobileUsability(uxData);

    // Step 5: gpt-4o visual analysis (visual / experience / personas / cialdini)
    let visualFindings: any[] = [];
    let experienceFindings: any[] = [];
    let personaFindings: any[] = [];
    let cialdiniFindings: any[] = [];

    if (process.env.OPENAI_API_KEY) {
        try {
            logger.info('Running AI Visual Analysis on desktop screenshot...');
            const aiResult = await auditVisualDesign(screenshots.desktop);
            const aiFindings = aiResult.findings;
            visualFindings = aiFindings.filter(f => f.ruleId.startsWith('UX-VIS'));
            experienceFindings = aiFindings.filter(f => f.ruleId.startsWith('UX-EXP') || f.ruleId === 'UX-AI-ERROR');
            personaFindings = aiFindings.filter(f => f.ruleId.startsWith('UX-PERSONA'));
            cialdiniFindings = aiFindings.filter(f => f.ruleId.startsWith('UX-CIALDINI'));
        } catch (error) {
            logger.error(`AI Visual Analysis failed: ${(error as Error).message}`);
        }
    } else {
        logger.warn('OPENAI_API_KEY not set — skipping AI visual analysis');
    }

    // Step 6: Scores
    const allUXFindings = [
        ...accessibilityFindings, ...mobileFindings,
        ...visualFindings, ...experienceFindings, ...personaFindings, ...cialdiniFindings,
    ];
    const seoScore = calculateScore(seoFindings);
    const aeoScore = calculateScore(aeoFindings);
    const geoScore = calculateScore(geoFindings);
    const uxScore = calculateUXScore(allUXFindings);
    const overallScore = Math.round((seoScore + aeoScore + geoScore + uxScore) / 4);

    logger.success('✓ Analysis complete');

    // Step 7: Report (shape unchanged — screenshots URLs are filled in by saveReport)
    const report = {
        siteId,
        crawlDate,
        url: site.rootUrl,
        timestamp: new Date().toISOString(),
        scores: { overall: overallScore, seo: seoScore, aeo: aeoScore, geo: geoScore, ux: uxScore },
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
        screenshots: { desktop: '', mobile: '' },
    };

    // Step 8: Persist to Supabase (Postgres row + Storage screenshots)
    logger.info('Persisting report + screenshots to Supabase...');
    const persisted = await saveReport({
        siteId,
        crawlDate,
        report,
        desktop: screenshots.desktop,
        mobile: screenshots.mobile,
        contentType: 'image/jpeg',
    });
    logger.success('✓ Report persisted to Supabase');

    // Best-effort timestamp update (filesystem; no-op/throws on Vercel — ignored)
    try {
        await ConfigManager.updateSite(siteId, { lastCrawlTimestamp: new Date().toISOString() });
    } catch {
        // read-only FS — the Supabase row is the source of truth for "latest"
    }

    console.log('\n' + '='.repeat(60));
    console.log('✓ CRAWL COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`\n📊 Overall Score: ${overallScore}/100\n`);
    console.log(`   SEO:  ${seoScore}/100`);
    console.log(`   AEO:  ${aeoScore}/100`);
    console.log(`   GEO:  ${geoScore}/100`);
    console.log(`   UX:   ${uxScore}/100`);
    console.log(`\n📸 Screenshots: ${persisted.screenshots.desktop}\n`);
    console.log('='.repeat(60) + '\n');

    return persisted;
}
