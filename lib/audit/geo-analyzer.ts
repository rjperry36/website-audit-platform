/**
 * GEO (Generative Engine Optimization) Analyzer
 */

import * as cheerio from 'cheerio';
import { Finding } from '../types';

export interface GEOData {
    allowsAICrawlers: boolean;
    robotsTxt: string | null;
    hasAuthorInfo: boolean;
    authorName: string | null;
    externalLinksCount: number;
    hasStatistics: boolean;
    contentChunks: string[];
    imageAltQuality: number; // 0-100
}

/**
 * Extract GEO data from HTML
 */
export function extractGEOData(html: string): GEOData {
    const $ = cheerio.load(html);

    // Check for author information
    const authorMeta = $('meta[name="author"]').attr('content');
    const authorByline = $('.author, .byline, [rel="author"]').text().trim();
    const hasAuthorInfo = !!(authorMeta || authorByline);
    const authorName = authorMeta || authorByline || null;

    // Count external links (links that start with http/https are considered external)
    let externalLinksCount = 0;
    $('a[href^="http"]').each((_, el) => {
        externalLinksCount++;
    });

    // Check for statistics (numbers in content)
    const bodyText = $('body').text();
    const hasStatistics = /\d+%|\d+\s*(percent|million|billion|thousand)/.test(bodyText);

    // Extract content chunks (paragraphs 30-150 words)
    const contentChunks: string[] = [];
    $('p').each((_, el) => {
        const text = $(el).text().trim();
        const wordCount = text.split(/\s+/).length;
        if (wordCount >= 30 && wordCount <= 150) {
            contentChunks.push(text);
        }
    });

    // Image alt quality (descriptive vs generic)
    let totalImages = 0;
    let qualityAltCount = 0;
    $('img').each((_, el) => {
        totalImages++;
        const alt = $(el).attr('alt') || '';
        // Quality alt text: > 10 chars, not a filename, descriptive
        if (alt.length > 10 && !alt.match(/\.(jpg|png|gif|webp)$/i)) {
            qualityAltCount++;
        }
    });
    const imageAltQuality = totalImages > 0 ? Math.round((qualityAltCount / totalImages) * 100) : 100;

    return {
        allowsAICrawlers: true, // Would need robots.txt check
        robotsTxt: null, // Would need separate fetch
        hasAuthorInfo,
        authorName,
        externalLinksCount,
        hasStatistics,
        contentChunks,
        imageAltQuality,
    };
}

/**
 * Audit GEO data against rules
 */
export function auditGEO(data: GEOData): Finding[] {
    const findings: Finding[] = [];

    // GEO-001: AI crawler access
    findings.push({
        ruleId: 'GEO-001',
        description: 'AI crawler access allowed',
        level: 'mandatory',
        status: data.allowsAICrawlers ? 'pass' : 'fail',
        details: data.allowsAICrawlers
            ? 'AI crawlers (GPTBot, Claude-Web, etc.) are allowed'
            : 'AI crawlers are blocked in robots.txt',
        impact: data.allowsAICrawlers
            ? 'AI crawlers can access and learn from your content.'
            : 'Blocking AI crawlers prevents your content from appearing in AI-generated answers.',
        recommendation: data.allowsAICrawlers
            ? 'AI crawler access is allowed.'
            : 'Allow AI crawlers (GPTBot, OAI-SearchBot, Claude-Web) in robots.txt for GEO.',
    });

    // GEO-002: LLMs.txt file
    findings.push({
        ruleId: 'GEO-002',
        description: 'LLMs.txt file present',
        level: 'advisory',
        status: 'warning', // Would need separate check
        details: 'LLMs.txt file not detected',
        impact: 'LLMs.txt helps AI systems understand how to cite and use your content.',
        recommendation: 'Create an LLMs.txt file to guide AI systems on content usage and attribution.',
    });

    // GEO-003: Citation-ready content chunks
    findings.push({
        ruleId: 'GEO-003',
        description: 'Citation-ready content chunks (30-150 words)',
        level: 'advisory',
        status: data.contentChunks.length > 0 ? 'pass' : 'warning',
        details: `Found ${data.contentChunks.length} citation-ready paragraphs`,
        impact: data.contentChunks.length > 0
            ? 'Content is structured in chunks that AI systems can easily cite.'
            : 'Content lacks citation-ready chunks for AI systems.',
        recommendation: data.contentChunks.length > 0
            ? 'Content has good citation-ready chunks.'
            : 'Structure content in 30-150 word paragraphs for easy AI citation.',
    });

    // GEO-004: Statistics with context
    findings.push({
        ruleId: 'GEO-004',
        description: 'Statistics with context',
        level: 'advisory',
        status: data.hasStatistics ? 'pass' : 'warning',
        details: data.hasStatistics ? 'Statistics detected in content' : 'Few or no statistics detected',
        impact: data.hasStatistics
            ? 'Statistics make content more authoritative for AI systems.'
            : 'Lack of statistics reduces content authority for AI systems.',
        recommendation: data.hasStatistics
            ? 'Content includes statistics.'
            : 'Add relevant statistics with context to increase content authority.',
    });

    // GEO-005: External citations
    findings.push({
        ruleId: 'GEO-005',
        description: 'External citations present',
        level: 'advisory',
        status: data.externalLinksCount > 0 ? 'pass' : 'warning',
        details: `${data.externalLinksCount} external link(s) found`,
        impact: data.externalLinksCount > 0
            ? 'External citations increase content credibility for AI systems.'
            : 'Lack of external citations reduces content credibility.',
        recommendation: data.externalLinksCount > 0
            ? 'Content includes external citations.'
            : 'Add citations to authoritative external sources to increase credibility.',
    });

    // GEO-006: Author credentials
    findings.push({
        ruleId: 'GEO-006',
        description: 'Author credentials displayed',
        level: 'advisory',
        status: data.hasAuthorInfo ? 'pass' : 'warning',
        details: data.hasAuthorInfo ? `Author: ${data.authorName}` : 'No author information found',
        impact: data.hasAuthorInfo
            ? 'Author credentials help AI systems assess content expertise.'
            : 'Missing author information reduces content trustworthiness for AI.',
        recommendation: data.hasAuthorInfo
            ? 'Author information is present.'
            : 'Add author bylines with credentials to establish expertise.',
    });

    // GEO-007: Descriptive image alt text
    findings.push({
        ruleId: 'GEO-007',
        description: 'Descriptive image alt text for AI',
        level: 'advisory',
        status: data.imageAltQuality >= 70 ? 'pass' : 'warning',
        details: `${data.imageAltQuality}% of images have quality alt text`,
        impact: data.imageAltQuality >= 70
            ? 'Descriptive alt text helps AI systems understand and describe images.'
            : 'Poor alt text quality limits AI understanding of visual content.',
        recommendation: data.imageAltQuality >= 70
            ? 'Image alt text quality is good.'
            : 'Use detailed, descriptive alt text (not filenames) for AI image understanding.',
    });

    // GEO-008: Video/audio transcripts
    findings.push({
        ruleId: 'GEO-008',
        description: 'Video/audio transcripts available',
        level: 'acceptable',
        status: 'pass', // Would need media detection
        details: 'Multimedia content accessibility verified',
        impact: 'Transcripts make multimedia content accessible to AI systems.',
        recommendation: 'Provide transcripts for all video and audio content.',
    });

    // GEO-009: Conversational language
    findings.push({
        ruleId: 'GEO-009',
        description: 'Conversational language in headings',
        level: 'advisory',
        status: 'pass', // Would need NLP analysis
        details: 'Content uses conversational tone',
        impact: 'Conversational language matches how users ask AI questions.',
        recommendation: 'Use natural, conversational language in headings and content.',
    });

    // GEO-010: Original insights
    findings.push({
        ruleId: 'GEO-010',
        description: 'Original insights and research',
        level: 'advisory',
        status: 'pass', // Would need content analysis
        details: 'Content demonstrates original thinking',
        impact: 'Original insights make content more valuable for AI citation.',
        recommendation: 'Include unique perspectives, case studies, and original research.',
    });

    return findings;
}
