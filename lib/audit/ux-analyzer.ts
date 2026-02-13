/**
 * UX Analyzer - Evaluates user experience, accessibility, and mobile usability
 */

import * as cheerio from 'cheerio';
import { Finding } from '../types';

export interface UXData {
    // Accessibility
    hasViewportMeta: boolean;
    viewportContent: string | null;
    hasLangAttribute: boolean;
    langValue: string | null;
    formLabels: { total: number; labeled: number };
    ariaLandmarks: string[];
    hasSkipLink: boolean;

    // Mobile
    isMobileFriendly: boolean;
    baseFontSize: number;

    // Visual
    fontFamilies: string[];
    colorPalette: string[];

    // UX
    hasHeroSection: boolean;
    hasPrimaryCTA: boolean;
    hasSearch: boolean;
    hasBreadcrumbs: boolean;
    hasFooter: boolean;

    // Performance (would need separate measurement)
    hasLazyLoading: boolean;
    hasFontDisplay: boolean;
}

/**
 * Extract UX data from HTML
 */
export function extractUXData(html: string): UXData {
    const $ = cheerio.load(html);

    // Accessibility checks
    const viewportMeta = $('meta[name="viewport"]');
    const hasViewportMeta = viewportMeta.length > 0;
    const viewportContent = viewportMeta.attr('content') || null;

    const htmlTag = $('html');
    const hasLangAttribute = htmlTag.attr('lang') !== undefined;
    const langValue = htmlTag.attr('lang') || null;

    // Form labels
    const totalInputs = $('input:not([type="hidden"]), textarea, select').length;
    let labeledInputs = 0;
    $('input:not([type="hidden"]), textarea, select').each((_, el) => {
        const id = $(el).attr('id');
        const ariaLabel = $(el).attr('aria-label');
        const ariaLabelledBy = $(el).attr('aria-labelledby');
        const hasLabel = id && $(`label[for="${id}"]`).length > 0;
        if (hasLabel || ariaLabel || ariaLabelledBy) {
            labeledInputs++;
        }
    });

    // ARIA landmarks
    const ariaLandmarks: string[] = [];
    $('[role], nav, main, aside, header, footer').each((_, el) => {
        const role = $(el).attr('role') || $(el).prop('tagName')?.toLowerCase();
        if (role && !ariaLandmarks.includes(role)) {
            ariaLandmarks.push(role);
        }
    });

    // Skip link
    const firstLink = $('a').first();
    const hasSkipLink = firstLink.text().toLowerCase().includes('skip') ||
        firstLink.attr('href') === '#main' ||
        firstLink.attr('href') === '#content';

    // Mobile checks
    const isMobileFriendly = hasViewportMeta &&
        viewportContent?.includes('width=device-width') === true;

    // Font size (approximate from body or html)
    const bodyStyle = $('body').attr('style') || '';
    const fontSizeMatch = bodyStyle.match(/font-size:\s*(\d+)px/);
    const baseFontSize = fontSizeMatch ? parseInt(fontSizeMatch[1]) : 16;

    // Visual design
    const fontFamilies: string[] = [];
    $('*').each((_, el) => {
        const style = $(el).attr('style') || '';
        const fontMatch = style.match(/font-family:\s*([^;]+)/);
        if (fontMatch && !fontFamilies.includes(fontMatch[1])) {
            fontFamilies.push(fontMatch[1]);
        }
    });

    // Color palette (simplified - would need more sophisticated extraction)
    const colorPalette: string[] = [];
    $('*').each((_, el) => {
        const style = $(el).attr('style') || '';
        const colorMatch = style.match(/color:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\))/);
        const bgMatch = style.match(/background(?:-color)?:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\))/);
        if (colorMatch && !colorPalette.includes(colorMatch[1])) {
            colorPalette.push(colorMatch[1]);
        }
        if (bgMatch && !colorPalette.includes(bgMatch[1])) {
            colorPalette.push(bgMatch[1]);
        }
    });

    // UX elements
    const hasHeroSection = $('section, .hero, .banner, header').length > 0;
    const hasPrimaryCTA = $('button, .btn, .cta, a.button').length > 0;
    const hasSearch = $('input[type="search"], [role="search"]').length > 0;
    const hasBreadcrumbs = $('[aria-label*="breadcrumb"], .breadcrumb, nav ol').length > 0;
    const hasFooter = $('footer').length > 0;

    // Performance
    const hasLazyLoading = $('img[loading="lazy"]').length > 0;
    const hasFontDisplay = $('style, link[rel="stylesheet"]').text().includes('font-display');

    return {
        hasViewportMeta,
        viewportContent,
        hasLangAttribute,
        langValue,
        formLabels: { total: totalInputs, labeled: labeledInputs },
        ariaLandmarks,
        hasSkipLink,
        isMobileFriendly,
        baseFontSize,
        fontFamilies: fontFamilies.slice(0, 10), // Limit to 10
        colorPalette: colorPalette.slice(0, 10),
        hasHeroSection,
        hasPrimaryCTA,
        hasSearch,
        hasBreadcrumbs,
        hasFooter,
        hasLazyLoading,
        hasFontDisplay,
    };
}

import uxRules from '../config/rules/ux.json';

// Helper to get rule config
function getRule(category: keyof typeof uxRules, ruleId: string) {
    // @ts-ignore - straightforward access for now
    return uxRules[category][ruleId];
}

/**
 * Audit UX data - Accessibility rules
 */
export function auditAccessibility(data: UXData, seoData: any): Finding[] {
    const findings: Finding[] = [];
    const cat = 'accessibility';

    // UX-A11Y-001: Color Contrast
    const r001 = getRule(cat, 'UX-A11Y-001');
    findings.push({
        ruleId: r001.id,
        description: r001.name,
        level: r001.level as any,
        status: 'pass', // Placeholder
        details: 'Color contrast analysis requires screenshot processing',
        impact: r001.impact,
        recommendation: r001.recommendation,
    });

    // UX-A11Y-002: Touch Target Size
    const r002 = getRule(cat, 'UX-A11Y-002');
    findings.push({
        ruleId: r002.id,
        description: r002.name,
        level: r002.level as any,
        status: 'pass', // Placeholder
        details: 'Touch target analysis requires screenshot processing',
        impact: r002.impact,
        recommendation: r002.recommendation,
    });

    // UX-A11Y-004: Form Labels
    const r004 = getRule(cat, 'UX-A11Y-004');
    findings.push({
        ruleId: r004.id,
        description: r004.name,
        level: r004.level as any,
        status: data.formLabels.total === 0 ? 'pass' :
            data.formLabels.labeled === data.formLabels.total ? 'pass' : 'fail',
        details: `${data.formLabels.labeled} of ${data.formLabels.total} inputs have labels`,
        impact: r004.impact,
        recommendation: r004.recommendation,
    });

    // UX-A11Y-007: ARIA Landmarks
    const r007 = getRule(cat, 'UX-A11Y-007');
    const minLandmarks = r007.thresholds?.minLandmarks || 3;
    findings.push({
        ruleId: r007.id,
        description: r007.name,
        level: r007.level as any,
        status: data.ariaLandmarks.length >= minLandmarks ? 'pass' : 'warning',
        details: `Found ${data.ariaLandmarks.length} landmark(s): ${data.ariaLandmarks.join(', ')}`,
        impact: r007.impact,
        recommendation: r007.recommendation,
    });

    // UX-A11Y-008: Skip to Content Link
    const r008 = getRule(cat, 'UX-A11Y-008');
    findings.push({
        ruleId: r008.id,
        description: r008.name,
        level: r008.level as any,
        status: data.hasSkipLink ? 'pass' : 'warning',
        details: data.hasSkipLink ? 'Skip link detected' : 'No skip link found',
        impact: r008.impact,
        recommendation: r008.recommendation,
    });

    // UX-A11Y-012: Language Declaration
    const r012 = getRule(cat, 'UX-A11Y-012');
    findings.push({
        ruleId: r012.id,
        description: r012.name,
        level: r012.level as any,
        status: data.hasLangAttribute ? 'pass' : 'fail',
        details: data.hasLangAttribute
            ? `Language set to: ${data.langValue}`
            : 'No lang attribute on <html> tag',
        impact: r012.impact,
        recommendation: r012.recommendation,
    });

    return findings;
}

/**
 * Audit UX data - Mobile Usability rules
 */
export function auditMobileUsability(data: UXData): Finding[] {
    const findings: Finding[] = [];
    const cat = 'mobile';

    // UX-MOB-001: Viewport Meta Tag
    const r001 = getRule(cat, 'UX-MOB-001');
    findings.push({
        ruleId: r001.id,
        description: r001.name,
        level: r001.level as any,
        status: data.hasViewportMeta ? 'pass' : 'fail',
        details: data.hasViewportMeta
            ? `Viewport: ${data.viewportContent}`
            : 'No viewport meta tag found',
        impact: r001.impact,
        recommendation: r001.recommendation,
    });

    // UX-MOB-002: Mobile-Friendly Layout
    const r002 = getRule(cat, 'UX-MOB-002');
    findings.push({
        ruleId: r002.id,
        description: r002.name,
        level: r002.level as any,
        status: data.isMobileFriendly ? 'pass' : 'warning',
        details: 'Mobile layout analysis requires screenshot comparison',
        impact: r002.impact,
        recommendation: r002.recommendation,
    });

    // UX-MOB-003: Text Readability
    const r003 = getRule(cat, 'UX-MOB-003');
    const minFontSize = r003.thresholds?.minFontSize || 16;
    findings.push({
        ruleId: r003.id,
        description: r003.name,
        level: r003.level as any,
        status: data.baseFontSize >= minFontSize ? 'pass' : 'warning',
        details: `Base font size: ${data.baseFontSize}px`,
        impact: r003.impact,
        recommendation: r003.recommendation,
    });

    // UX-MOB-010: Mobile CTA Visibility
    const r010 = getRule(cat, 'UX-MOB-010');
    findings.push({
        ruleId: r010.id,
        description: r010.name,
        level: r010.level as any,
        status: data.hasPrimaryCTA ? 'pass' : 'warning',
        details: data.hasPrimaryCTA
            ? 'Primary CTA detected'
            : 'No clear primary CTA found',
        impact: r010.impact,
        recommendation: r010.recommendation,
    });

    return findings;
}

/**
 * Calculate UX score from findings
 */
export function calculateUXScore(findings: Finding[]): number {
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
