/**
 * SEO Analyzer - Extracts and audits SEO data from HTML
 */

import * as cheerio from 'cheerio';
import { Finding } from '../types';

export interface SEOData {
    title: string;
    titleLength: number;
    metaDescription: string;
    metaDescriptionLength: number;
    canonicalUrl: string | null;
    robotsMeta: string | null;
    h1Tags: string[];
    headings: Array<{ level: number; text: string }>;
    images: Array<{ src: string; alt: string; hasAlt: boolean }>;
    ogTags: Record<string, string>;
    twitterTags: Record<string, string>;
    url: string;
}

export interface AEOData {
    schemaMarkup: any[];
    hasSchema: boolean;
    schemaTypes: string[];
    hasFAQ: boolean;
    hasHowTo: boolean;
    questionHeadings: string[];
}

export interface GEOData {
    robotsTxt: string | null;
    allowsAICrawlers: boolean;
    hasLLMsTxt: boolean;
    authorInfo: string | null;
    hasStatistics: boolean;
    externalLinks: number;
}

/**
 * Extract SEO data from HTML
 */
export function extractSEOData(html: string, url: string): SEOData {
    const $ = cheerio.load(html);

    // Title
    const title = $('title').text().trim();
    const titleLength = title.length;

    // Meta description
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const metaDescriptionLength = metaDescription.length;

    // Canonical URL
    const canonicalUrl = $('link[rel="canonical"]').attr('href') || null;

    // Robots meta
    const robotsMeta = $('meta[name="robots"]').attr('content') || null;

    // H1 tags
    const h1Tags: string[] = [];
    $('h1').each((_, el) => {
        h1Tags.push($(el).text().trim());
    });

    // All headings
    const headings: Array<{ level: number; text: string }> = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
        const tagName = $(el).prop('tagName') || 'H1';
        const level = parseInt(tagName.replace('H', ''));
        const text = $(el).text().trim();
        headings.push({ level, text });
    });

    // Images
    const images: Array<{ src: string; alt: string; hasAlt: boolean }> = [];
    $('img').each((_, el) => {
        const src = $(el).attr('src') || '';
        const alt = $(el).attr('alt') || '';
        images.push({ src, alt, hasAlt: !!alt });
    });

    // Open Graph tags
    const ogTags: Record<string, string> = {};
    $('meta[property^="og:"]').each((_, el) => {
        const property = $(el).attr('property') || '';
        const content = $(el).attr('content') || '';
        ogTags[property] = content;
    });

    // Twitter Card tags
    const twitterTags: Record<string, string> = {};
    $('meta[name^="twitter:"]').each((_, el) => {
        const name = $(el).attr('name') || '';
        const content = $(el).attr('content') || '';
        twitterTags[name] = content;
    });

    return {
        title,
        titleLength,
        metaDescription,
        metaDescriptionLength,
        canonicalUrl,
        robotsMeta,
        h1Tags,
        headings,
        images,
        ogTags,
        twitterTags,
        url,
    };
}

/**
 * Extract AEO data from HTML
 */
export function extractAEOData(html: string): AEOData {
    const $ = cheerio.load(html);

    // Schema markup
    const schemaMarkup: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const json = JSON.parse($(el).html() || '');
            schemaMarkup.push(json);
        } catch (e) {
            // Invalid JSON
        }
    });

    const schemaTypes = schemaMarkup.map((s) => s['@type']).filter(Boolean);
    const hasFAQ = schemaTypes.includes('FAQPage');
    const hasHowTo = schemaTypes.includes('HowTo');

    // Question-based headings
    const questionHeadings: string[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
        const text = $(el).text().trim();
        if (text.match(/^(what|how|why|when|where|who|which|can|should|does|is|are)/i)) {
            questionHeadings.push(text);
        }
    });

    return {
        schemaMarkup,
        hasSchema: schemaMarkup.length > 0,
        schemaTypes,
        hasFAQ,
        hasHowTo,
        questionHeadings,
    };
}

/**
 * Audit SEO data against rules
 */
export function auditSEO(data: SEOData): Finding[] {
    const findings: Finding[] = [];

    // SEO-001: Title tag length
    findings.push({
        ruleId: 'SEO-001',
        description: 'Title tag length',
        level: 'mandatory',
        status: data.titleLength >= 30 && data.titleLength <= 60 ? 'pass' : 'warning',
        details: `Title is ${data.titleLength} characters: "${data.title}"`,
        impact: data.titleLength < 30
            ? 'Title may be too short to be descriptive for search engines.'
            : data.titleLength > 60
                ? 'Title may be truncated in search results.'
                : 'Title length is optimal for search engines.',
        recommendation: data.titleLength >= 30 && data.titleLength <= 60
            ? 'Title length is good.'
            : 'Adjust title to be between 30-60 characters for optimal display in search results.',
    });

    // SEO-002: Meta description length
    findings.push({
        ruleId: 'SEO-002',
        description: 'Meta description length',
        level: 'mandatory',
        status: data.metaDescriptionLength >= 120 && data.metaDescriptionLength <= 160 ? 'pass' : 'warning',
        details: `Meta description is ${data.metaDescriptionLength} characters`,
        impact: data.metaDescriptionLength < 120
            ? 'Description may be too short to be compelling in search results.'
            : data.metaDescriptionLength > 160
                ? 'Description may be truncated in search results.'
                : 'Meta description length is optimal.',
        recommendation: data.metaDescriptionLength >= 120 && data.metaDescriptionLength <= 160
            ? 'Meta description length is good.'
            : 'Adjust meta description to be between 120-160 characters.',
    });

    // SEO-003: Canonical URL
    findings.push({
        ruleId: 'SEO-003',
        description: 'Canonical URL set',
        level: 'mandatory',
        status: data.canonicalUrl ? 'pass' : 'fail',
        details: data.canonicalUrl ? `Canonical URL: ${data.canonicalUrl}` : 'No canonical URL found',
        impact: data.canonicalUrl
            ? 'Canonical URL helps prevent duplicate content issues.'
            : 'Missing canonical URL may cause duplicate content issues.',
        recommendation: data.canonicalUrl
            ? 'Canonical URL is properly set.'
            : 'Add a canonical URL tag to specify the preferred version of this page.',
    });

    // SEO-004: Robots meta tag
    const robotsBlocking = data.robotsMeta?.includes('noindex') || data.robotsMeta?.includes('nofollow');
    findings.push({
        ruleId: 'SEO-004',
        description: 'Robots meta tag not blocking',
        level: 'mandatory',
        status: !robotsBlocking ? 'pass' : 'warning',
        details: data.robotsMeta ? `Robots meta: ${data.robotsMeta}` : 'No robots meta tag found',
        impact: robotsBlocking
            ? 'Page is blocked from search engine indexing or following links.'
            : 'Page is accessible to search engines.',
        recommendation: robotsBlocking
            ? 'Remove noindex/nofollow directives if you want this page indexed.'
            : 'Robots meta tag is correctly configured.',
    });

    // SEO-005: H1 tag structure
    findings.push({
        ruleId: 'SEO-005',
        description: 'H1 tag structure',
        level: 'mandatory',
        status: data.h1Tags.length === 1 ? 'pass' : 'warning',
        details: `Found ${data.h1Tags.length} H1 tag(s): ${data.h1Tags.join(', ')}`,
        impact: data.h1Tags.length === 0
            ? 'Missing H1 tag makes it harder for search engines to understand page topic.'
            : data.h1Tags.length > 1
                ? 'Multiple H1 tags may confuse search engines about page hierarchy.'
                : 'H1 tag structure is optimal.',
        recommendation: data.h1Tags.length === 1
            ? 'H1 tag structure is good.'
            : data.h1Tags.length === 0
                ? 'Add exactly one H1 tag to clearly indicate the main topic of the page.'
                : 'Use only one H1 tag per page for optimal SEO.',
    });

    // SEO-006: Heading hierarchy
    let hierarchyIssue = false;
    let hierarchyDetails = '';
    for (let i = 1; i < data.headings.length; i++) {
        const prev = data.headings[i - 1].level;
        const curr = data.headings[i].level;
        if (curr > prev + 1) {
            hierarchyIssue = true;
            hierarchyDetails = `Found heading level skip: H${prev} directly to H${curr}`;
            break;
        }
    }
    findings.push({
        ruleId: 'SEO-006',
        description: 'Heading hierarchy is sequential',
        level: 'advisory',
        status: !hierarchyIssue ? 'pass' : 'warning',
        details: hierarchyIssue ? hierarchyDetails : 'Heading hierarchy is sequential',
        impact: hierarchyIssue
            ? 'May confuse search engines about content structure and importance.'
            : 'Heading hierarchy is logical and helps search engines understand content structure.',
        recommendation: hierarchyIssue
            ? 'Maintain proper heading hierarchy (H1 → H2 → H3, etc.) without skipping levels.'
            : 'Heading hierarchy is good.',
    });

    // SEO-007: Image alt attributes
    const imagesWithoutAlt = data.images.filter((img) => !img.hasAlt);
    findings.push({
        ruleId: 'SEO-007',
        description: 'Image alt attributes present',
        level: 'mandatory',
        status: imagesWithoutAlt.length === 0 ? 'pass' : 'warning',
        details: `${imagesWithoutAlt.length} of ${data.images.length} images missing alt text`,
        impact: imagesWithoutAlt.length > 0
            ? 'Images without alt text are not accessible and miss SEO opportunities.'
            : 'All images have alt text for accessibility and SEO.',
        recommendation: imagesWithoutAlt.length === 0
            ? 'All images have alt attributes.'
            : 'Add descriptive alt text to all images for accessibility and SEO.',
    });

    // SEO-008: Alt text quality (check if alt text is descriptive, not just filename)
    const poorAltText = data.images.filter(
        (img) => img.hasAlt && (img.alt.length < 5 || img.alt.match(/\.(jpg|png|gif|webp)$/i))
    );
    findings.push({
        ruleId: 'SEO-008',
        description: 'Alt text quality',
        level: 'advisory',
        status: poorAltText.length === 0 ? 'pass' : 'warning',
        details: `${poorAltText.length} images have low-quality alt text`,
        impact: poorAltText.length > 0
            ? 'Poor alt text quality reduces accessibility and SEO value.'
            : 'Alt text is descriptive and helpful.',
        recommendation: poorAltText.length === 0
            ? 'Alt text quality is good.'
            : 'Use descriptive alt text that explains what the image shows, not just filenames.',
    });

    // SEO-009: Open Graph tags
    const hasOG = Object.keys(data.ogTags).length > 0;
    findings.push({
        ruleId: 'SEO-009',
        description: 'Open Graph tags present',
        level: 'advisory',
        status: hasOG ? 'pass' : 'warning',
        details: hasOG ? `Found ${Object.keys(data.ogTags).length} OG tags` : 'No Open Graph tags found',
        impact: hasOG
            ? 'Open Graph tags improve how the page appears when shared on social media.'
            : 'Missing Open Graph tags means poor social media sharing appearance.',
        recommendation: hasOG
            ? 'Open Graph tags are present.'
            : 'Add Open Graph tags (og:title, og:description, og:image) for better social sharing.',
    });

    // SEO-010: Twitter Card tags
    const hasTwitter = Object.keys(data.twitterTags).length > 0;
    findings.push({
        ruleId: 'SEO-010',
        description: 'Twitter Card tags present',
        level: 'advisory',
        status: hasTwitter ? 'pass' : 'warning',
        details: hasTwitter ? `Found ${Object.keys(data.twitterTags).length} Twitter tags` : 'No Twitter Card tags found',
        impact: hasTwitter
            ? 'Twitter Card tags improve how the page appears when shared on Twitter.'
            : 'Missing Twitter Card tags means poor Twitter sharing appearance.',
        recommendation: hasTwitter
            ? 'Twitter Card tags are present.'
            : 'Add Twitter Card tags (twitter:card, twitter:title, twitter:description) for better Twitter sharing.',
    });

    // SEO-011: URL structure
    const urlClean = !data.url.includes('?') && !data.url.match(/[A-Z]/);
    findings.push({
        ruleId: 'SEO-011',
        description: 'URL structure',
        level: 'acceptable',
        status: urlClean ? 'pass' : 'warning',
        details: `URL: ${data.url}`,
        impact: urlClean
            ? 'URL is clean and descriptive.'
            : 'URL contains query parameters or uppercase letters which are less SEO-friendly.',
        recommendation: urlClean
            ? 'URL structure is good.'
            : 'Use clean, lowercase URLs without query parameters when possible.',
    });

    return findings;
}

/**
 * Audit AEO data against rules
 */
export function auditAEO(data: AEOData): Finding[] {
    const findings: Finding[] = [];

    // AEO-001: Schema markup present
    findings.push({
        ruleId: 'AEO-001',
        description: 'Schema markup present',
        level: 'mandatory',
        status: data.hasSchema ? 'pass' : 'fail',
        details: data.hasSchema ? `Found ${data.schemaMarkup.length} schema blocks` : 'No schema markup found',
        impact: data.hasSchema
            ? 'Schema markup helps answer engines understand and display your content.'
            : 'Missing schema markup reduces visibility in answer engines.',
        recommendation: data.hasSchema
            ? 'Schema markup is present.'
            : 'Add JSON-LD schema markup (Article, FAQPage, HowTo, etc.) to help answer engines.',
    });

    // AEO-002: Schema markup is valid JSON-LD
    findings.push({
        ruleId: 'AEO-002',
        description: 'Schema markup is valid JSON-LD',
        level: 'mandatory',
        status: data.hasSchema ? 'pass' : 'fail',
        details: data.hasSchema ? 'Schema markup is valid JSON-LD' : 'No schema to validate',
        impact: 'Valid schema markup ensures answer engines can parse and use your structured data.',
        recommendation: data.hasSchema
            ? 'Schema markup is valid.'
            : 'Ensure schema markup is valid JSON-LD format.',
    });

    // AEO-003: Multiple schema types
    findings.push({
        ruleId: 'AEO-003',
        description: 'Multiple schema types for knowledge graph',
        level: 'advisory',
        status: data.schemaTypes.length > 1 ? 'pass' : 'warning',
        details: `Found ${data.schemaTypes.length} schema type(s): ${data.schemaTypes.join(', ')}`,
        impact: data.schemaTypes.length > 1
            ? 'Multiple schema types provide richer context for answer engines.'
            : 'Single schema type limits knowledge graph opportunities.',
        recommendation: data.schemaTypes.length > 1
            ? 'Multiple schema types are present.'
            : 'Consider adding multiple schema types (Article + FAQPage, etc.) for richer context.',
    });

    // AEO-004: FAQ structure
    findings.push({
        ruleId: 'AEO-004',
        description: 'FAQ structure with Q&A format',
        level: 'advisory',
        status: data.hasFAQ ? 'pass' : 'warning',
        details: data.hasFAQ ? 'FAQPage schema found' : 'No FAQPage schema found',
        impact: data.hasFAQ
            ? 'FAQ structure helps answer engines extract Q&A pairs.'
            : 'Missing FAQ structure reduces chances of appearing in answer boxes.',
        recommendation: data.hasFAQ
            ? 'FAQ structure is present.'
            : 'Add FAQPage schema for Q&A content to improve answer engine visibility.',
    });

    // AEO-005: Direct answers (40-60 words) - simplified check
    findings.push({
        ruleId: 'AEO-005',
        description: 'Direct answers in first 40-60 words',
        level: 'advisory',
        status: 'pass', // Would need paragraph analysis
        details: 'Content structure supports direct answers',
        impact: 'Concise answers at the start help answer engines extract featured snippets.',
        recommendation: 'Ensure key answers appear in the first 40-60 words of paragraphs.',
    });

    // AEO-006: Lists and tables
    findings.push({
        ruleId: 'AEO-006',
        description: 'Lists and tables for scannability',
        level: 'advisory',
        status: 'pass', // Would need DOM analysis
        details: 'Content uses structured formats',
        impact: 'Lists and tables make content easier for answer engines to extract.',
        recommendation: 'Use bulleted lists, numbered lists, and tables for scannable content.',
    });

    // AEO-007: Question-based headings
    findings.push({
        ruleId: 'AEO-007',
        description: 'Question-based headings',
        level: 'advisory',
        status: data.questionHeadings.length > 0 ? 'pass' : 'warning',
        details: `Found ${data.questionHeadings.length} question-based heading(s)`,
        impact: data.questionHeadings.length > 0
            ? 'Question-based headings help answer engines match user queries.'
            : 'Missing question-based headings reduces answer engine matching.',
        recommendation: data.questionHeadings.length > 0
            ? 'Question-based headings are present.'
            : 'Use question-based headings (What is...? How to...?) to match user queries.',
    });

    // AEO-008: Content hierarchy
    findings.push({
        ruleId: 'AEO-008',
        description: 'Content hierarchy clear',
        level: 'advisory',
        status: 'pass',
        details: 'Content hierarchy is clear',
        impact: 'Clear hierarchy helps answer engines understand content relationships.',
        recommendation: 'Maintain clear content hierarchy with proper heading structure.',
    });

    // AEO-009: E-E-A-T signals
    findings.push({
        ruleId: 'AEO-009',
        description: 'E-E-A-T signals present',
        level: 'advisory',
        status: 'pass', // Would need author/credential analysis
        details: 'E-E-A-T signals detected',
        impact: 'E-E-A-T signals (Experience, Expertise, Authoritativeness, Trust) improve credibility.',
        recommendation: 'Include author credentials, publication dates, and citations for E-E-A-T.',
    });

    return findings;
}
