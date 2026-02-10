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

/**
 * Audit UX data - Accessibility rules
 */
export function auditAccessibility(data: UXData, seoData: any): Finding[] {
    const findings: Finding[] = [];

    // UX-A11Y-001: Color Contrast (placeholder - would need image analysis)
    findings.push({
        ruleId: 'UX-A11Y-001',
        description: 'Color contrast ratio',
        level: 'mandatory',
        status: 'pass', // Placeholder
        details: 'Color contrast analysis requires screenshot processing',
        impact: 'Critical for users with visual impairments',
        recommendation: 'Ensure text has 4.5:1 contrast ratio (3:1 for large text)',
    });

    // UX-A11Y-002: Touch Target Size (placeholder - would need screenshot analysis)
    findings.push({
        ruleId: 'UX-A11Y-002',
        description: 'Touch target size (mobile)',
        level: 'mandatory',
        status: 'pass', // Placeholder
        details: 'Touch target analysis requires screenshot processing',
        impact: 'Users with motor impairments struggle with small targets',
        recommendation: 'Minimum 44x44px for all tappable elements',
    });

    // UX-A11Y-003: Focus Indicators (placeholder)
    findings.push({
        ruleId: 'UX-A11Y-003',
        description: 'Focus indicators',
        level: 'mandatory',
        status: 'pass', // Placeholder
        details: 'Focus indicator testing requires browser interaction',
        impact: 'Keyboard users cannot navigate without focus indicators',
        recommendation: 'Use :focus styles with clear visual indicators',
    });

    // UX-A11Y-004: Form Labels
    findings.push({
        ruleId: 'UX-A11Y-004',
        description: 'Form labels',
        level: 'mandatory',
        status: data.formLabels.total === 0 ? 'pass' :
            data.formLabels.labeled === data.formLabels.total ? 'pass' : 'fail',
        details: `${data.formLabels.labeled} of ${data.formLabels.total} inputs have labels`,
        impact: data.formLabels.labeled < data.formLabels.total
            ? 'Screen readers cannot identify unlabeled input purposes'
            : 'All form inputs are properly labeled',
        recommendation: data.formLabels.labeled === data.formLabels.total
            ? 'Form labels are properly implemented'
            : 'Add <label> elements or aria-label to all form inputs',
    });

    // UX-A11Y-005: Alt Text (reference SEO check)
    findings.push({
        ruleId: 'UX-A11Y-005',
        description: 'Image alt text',
        level: 'mandatory',
        status: 'pass', // Checked in SEO-007
        details: 'See SEO-007 for detailed image alt text analysis',
        impact: 'Screen readers cannot describe images without alt text',
        recommendation: 'Refer to SEO audit for image accessibility details',
    });

    // UX-A11Y-006: Heading Structure (reference SEO check)
    findings.push({
        ruleId: 'UX-A11Y-006',
        description: 'Heading structure',
        level: 'mandatory',
        status: 'pass', // Checked in SEO-006
        details: 'See SEO-006 for heading hierarchy analysis',
        impact: 'Screen readers use headings for navigation',
        recommendation: 'Refer to SEO audit for heading structure details',
    });

    // UX-A11Y-007: ARIA Landmarks
    findings.push({
        ruleId: 'UX-A11Y-007',
        description: 'ARIA landmarks',
        level: 'advisory',
        status: data.ariaLandmarks.length >= 3 ? 'pass' : 'warning',
        details: `Found ${data.ariaLandmarks.length} landmark(s): ${data.ariaLandmarks.join(', ')}`,
        impact: data.ariaLandmarks.length >= 3
            ? 'Screen readers can quickly navigate page sections'
            : 'Missing landmarks make navigation harder for screen reader users',
        recommendation: data.ariaLandmarks.length >= 3
            ? 'ARIA landmarks are properly implemented'
            : 'Add semantic HTML5 elements (nav, main, footer) or ARIA roles',
    });

    // UX-A11Y-008: Skip to Content Link
    findings.push({
        ruleId: 'UX-A11Y-008',
        description: 'Skip to content link',
        level: 'advisory',
        status: data.hasSkipLink ? 'pass' : 'warning',
        details: data.hasSkipLink ? 'Skip link detected' : 'No skip link found',
        impact: data.hasSkipLink
            ? 'Keyboard users can skip navigation'
            : 'Keyboard users must tab through entire nav on every page',
        recommendation: data.hasSkipLink
            ? 'Skip link is present'
            : 'Add a "skip to main content" link as the first focusable element',
    });

    // UX-A11Y-009: Text Resize Support (placeholder)
    findings.push({
        ruleId: 'UX-A11Y-009',
        description: 'Text resize support',
        level: 'advisory',
        status: 'pass', // Would need testing
        details: 'Text resize testing requires browser interaction',
        impact: 'Users with low vision need to resize text',
        recommendation: 'Use relative units (rem, em) instead of fixed px',
    });

    // UX-A11Y-010: Color Not Sole Indicator (placeholder)
    findings.push({
        ruleId: 'UX-A11Y-010',
        description: 'Color not sole indicator',
        level: 'advisory',
        status: 'pass', // Would need visual analysis
        details: 'Color usage analysis requires visual inspection',
        impact: 'Color-blind users cannot distinguish color-only indicators',
        recommendation: 'Use icons, underlines, or text in addition to color',
    });

    // UX-A11Y-011: Video/Audio Captions (placeholder)
    findings.push({
        ruleId: 'UX-A11Y-011',
        description: 'Video/audio captions',
        level: 'mandatory',
        status: 'pass', // Would need media detection
        details: 'Media caption analysis requires content inspection',
        impact: 'Deaf/hard-of-hearing users cannot access media without captions',
        recommendation: 'Provide captions for all video/audio content',
    });

    // UX-A11Y-012: Language Declaration
    findings.push({
        ruleId: 'UX-A11Y-012',
        description: 'Language declaration',
        level: 'mandatory',
        status: data.hasLangAttribute ? 'pass' : 'fail',
        details: data.hasLangAttribute
            ? `Language set to: ${data.langValue}`
            : 'No lang attribute on <html> tag',
        impact: data.hasLangAttribute
            ? 'Screen readers can pronounce text correctly'
            : 'Screen readers cannot determine correct pronunciation',
        recommendation: data.hasLangAttribute
            ? 'Language declaration is present'
            : 'Add lang attribute to <html> tag (e.g., <html lang="en">)',
    });

    return findings;
}

/**
 * Audit UX data - Mobile Usability rules
 */
export function auditMobileUsability(data: UXData): Finding[] {
    const findings: Finding[] = [];

    // UX-MOB-001: Viewport Meta Tag
    findings.push({
        ruleId: 'UX-MOB-001',
        description: 'Viewport meta tag',
        level: 'mandatory',
        status: data.hasViewportMeta ? 'pass' : 'fail',
        details: data.hasViewportMeta
            ? `Viewport: ${data.viewportContent}`
            : 'No viewport meta tag found',
        impact: data.hasViewportMeta
            ? 'Page is mobile-responsive'
            : 'Page will not be mobile-responsive without viewport tag',
        recommendation: data.hasViewportMeta
            ? 'Viewport meta tag is properly set'
            : 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
    });

    // UX-MOB-002: Mobile-Friendly Layout (placeholder)
    findings.push({
        ruleId: 'UX-MOB-002',
        description: 'Mobile-friendly layout',
        level: 'mandatory',
        status: data.isMobileFriendly ? 'pass' : 'warning',
        details: 'Mobile layout analysis requires screenshot comparison',
        impact: 'Users must scroll horizontally to read content',
        recommendation: 'Use responsive design with max-width: 100%',
    });

    // UX-MOB-003: Text Readability
    findings.push({
        ruleId: 'UX-MOB-003',
        description: 'Text readability (mobile)',
        level: 'mandatory',
        status: data.baseFontSize >= 16 ? 'pass' : 'warning',
        details: `Base font size: ${data.baseFontSize}px`,
        impact: data.baseFontSize >= 16
            ? 'Text is readable on mobile devices'
            : 'Small text is difficult to read on mobile',
        recommendation: data.baseFontSize >= 16
            ? 'Font size is appropriate for mobile'
            : 'Increase base font size to at least 16px',
    });

    // UX-MOB-004: Tap Target Spacing (placeholder)
    findings.push({
        ruleId: 'UX-MOB-004',
        description: 'Tap target spacing',
        level: 'mandatory',
        status: 'pass', // Would need screenshot analysis
        details: 'Tap target spacing analysis requires screenshot processing',
        impact: 'Users accidentally tap wrong element',
        recommendation: 'Maintain 8px spacing between tappable elements',
    });

    // UX-MOB-005: Hamburger Menu (placeholder)
    findings.push({
        ruleId: 'UX-MOB-005',
        description: 'Hamburger menu (mobile)',
        level: 'advisory',
        status: 'pass', // Would need screenshot detection
        details: 'Mobile navigation pattern requires screenshot analysis',
        impact: 'Navigation takes up too much screen space',
        recommendation: 'Use collapsible navigation on mobile',
    });

    // UX-MOB-006: Form Input Types (placeholder)
    findings.push({
        ruleId: 'UX-MOB-006',
        description: 'Form input types',
        level: 'advisory',
        status: 'pass', // Would need form analysis
        details: 'Form input type analysis requires detailed inspection',
        impact: 'Mobile keyboard doesn\'t optimize for input type',
        recommendation: 'Use type="email", type="tel", etc. for appropriate fields',
    });

    // UX-MOB-007: Sticky Headers (placeholder)
    findings.push({
        ruleId: 'UX-MOB-007',
        description: 'Sticky headers',
        level: 'acceptable',
        status: 'pass', // Would need screenshot measurement
        details: 'Sticky header analysis requires screenshot processing',
        impact: 'Sticky headers reduce usable screen space',
        recommendation: 'Keep sticky headers under 60px on mobile',
    });

    // UX-MOB-008: Image Optimization (placeholder)
    findings.push({
        ruleId: 'UX-MOB-008',
        description: 'Image optimization',
        level: 'advisory',
        status: 'pass', // Would need image analysis
        details: 'Image optimization requires srcset/sizes analysis',
        impact: 'Large images slow down mobile page load',
        recommendation: 'Use responsive images with srcset attribute',
    });

    // UX-MOB-009: Orientation Support (placeholder)
    findings.push({
        ruleId: 'UX-MOB-009',
        description: 'Orientation support',
        level: 'advisory',
        status: 'pass', // Would need testing
        details: 'Orientation testing requires device testing',
        impact: 'Users cannot use device in preferred orientation',
        recommendation: 'Support both portrait and landscape orientations',
    });

    // UX-MOB-010: Mobile CTA Visibility (placeholder)
    findings.push({
        ruleId: 'UX-MOB-010',
        description: 'Mobile CTA visibility',
        level: 'mandatory',
        status: data.hasPrimaryCTA ? 'pass' : 'warning',
        details: data.hasPrimaryCTA
            ? 'Primary CTA detected'
            : 'No clear primary CTA found',
        impact: data.hasPrimaryCTA
            ? 'Users can see primary action'
            : 'Users don\'t see primary action',
        recommendation: data.hasPrimaryCTA
            ? 'Primary CTA is present'
            : 'Place primary CTA above the fold on mobile',
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
