/**
 * Security Audit Logic
 */

import { Finding, CategoryAudit } from '../types';
import { extractSecurityData, SecurityData } from './security-analyzer';
import securityRules from '../config/rules/security.json';

// Helper to get rule config
function getRule(category: keyof typeof securityRules, ruleId: string) {
    // @ts-ignore
    return securityRules[category][ruleId];
}

/**
 * Audit Security data against rules
 */
export function auditRules(data: SecurityData): Finding[] {
    const findings: Finding[] = [];

    // --- Architecture ---

    // SEC-ARCH-001: HTTPS Usage
    const rArch001 = getRule('architecture', 'SEC-ARCH-001');
    findings.push({
        ruleId: rArch001.id,
        description: rArch001.name,
        level: rArch001.level as any,
        status: data.https ? 'pass' : 'fail',
        details: data.https ? 'Site is served over HTTPS' : 'Site is requesting resources securely but URL is HTTP',
        impact: rArch001.impact,
        recommendation: rArch001.recommendation,
    });

    // --- Headers ---

    // SEC-HEAD-001: Strict-Transport-Security
    const rHead001 = getRule('headers', 'SEC-HEAD-001');
    findings.push({
        ruleId: rHead001.id,
        description: rHead001.name,
        level: rHead001.level as any,
        status: data.hsts ? 'pass' : 'fail',
        details: data.hsts ? `HSTS Header: ${data.hsts}` : 'HSTS header missing',
        impact: rHead001.impact,
        recommendation: rHead001.recommendation,
    });

    // SEC-HEAD-002: Content-Security-Policy
    const rHead002 = getRule('headers', 'SEC-HEAD-002');
    findings.push({
        ruleId: rHead002.id,
        description: rHead002.name,
        level: rHead002.level as any,
        status: data.csp ? 'pass' : 'fail',
        details: data.csp ? 'CSP header present' : 'CSP header missing',
        impact: rHead002.impact,
        recommendation: rHead002.recommendation,
    });

    // SEC-HEAD-003: X-Frame-Options
    const rHead003 = getRule('headers', 'SEC-HEAD-003');
    findings.push({
        ruleId: rHead003.id,
        description: rHead003.name,
        level: rHead003.level as any,
        status: data.xFrameOptions ? 'pass' : 'fail',
        details: data.xFrameOptions ? `X-Frame-Options: ${data.xFrameOptions}` : 'X-Frame-Options header missing',
        impact: rHead003.impact,
        recommendation: rHead003.recommendation,
    });

    // SEC-HEAD-004: X-Content-Type-Options
    const rHead004 = getRule('headers', 'SEC-HEAD-004');
    findings.push({
        ruleId: rHead004.id,
        description: rHead004.name,
        level: rHead004.level as any,
        status: data.xContentTypeOptions === 'nosniff' ? 'pass' : 'fail',
        details: data.xContentTypeOptions ? `X-Content-Type-Options: ${data.xContentTypeOptions}` : 'X-Content-Type-Options header missing',
        impact: rHead004.impact,
        recommendation: rHead004.recommendation,
    });

    // SEC-HEAD-005: Referrer-Policy
    const rHead005 = getRule('headers', 'SEC-HEAD-005');
    findings.push({
        ruleId: rHead005.id,
        description: rHead005.name,
        level: rHead005.level as any,
        status: data.referrerPolicy ? 'pass' : 'warning',
        details: data.referrerPolicy ? `Referrer-Policy: ${data.referrerPolicy}` : 'Referrer-Policy header missing',
        impact: rHead005.impact,
        recommendation: rHead005.recommendation,
    });

    // SEC-HEAD-006: Permissions-Policy
    const rHead006 = getRule('headers', 'SEC-HEAD-006');
    findings.push({
        ruleId: rHead006.id,
        description: rHead006.name,
        level: rHead006.level as any,
        status: data.permissionsPolicy ? 'pass' : 'warning',
        details: data.permissionsPolicy ? 'Permissions-Policy header present' : 'Permissions-Policy header missing',
        impact: rHead006.impact,
        recommendation: rHead006.recommendation,
    });

    // --- Inputs ---

    // SEC-INP-001: External Links Safety
    const rInp001 = getRule('inputs', 'SEC-INP-001');
    const unsafeLinks = data.externalLinks.filter(l =>
        l.target === '_blank' &&
        !l.rel.includes('noopener') &&
        !l.rel.includes('noreferrer')
    );

    findings.push({
        ruleId: rInp001.id,
        description: rInp001.name,
        level: rInp001.level as any,
        status: unsafeLinks.length === 0 ? 'pass' : 'fail',
        details: unsafeLinks.length === 0
            ? 'All external links (target=_blank) have rel="noopener"'
            : `Found ${unsafeLinks.length} unsafe external links (target=_blank without noopener)`,
        impact: rInp001.impact,
        recommendation: rInp001.recommendation,
    });

    // SEC-INP-002: Mixed Content
    const rInp002 = getRule('inputs', 'SEC-INP-002');
    const mixedContent = data.resources.filter(r => r.src.startsWith('http://'));

    findings.push({
        ruleId: rInp002.id,
        description: rInp002.name,
        level: rInp002.level as any,
        status: mixedContent.length === 0 ? 'pass' : 'fail',
        details: mixedContent.length === 0
            ? 'No mixed content found'
            : `Found ${mixedContent.length} resources loaded over HTTP`,
        impact: rInp002.impact,
        recommendation: rInp002.recommendation,
    });

    // --- Disclosure ---

    // SEC-DISC-001: Server Header
    const rDisc001 = getRule('disclosure', 'SEC-DISC-001');
    findings.push({
        ruleId: rDisc001.id,
        description: rDisc001.name,
        level: rDisc001.level as any,
        status: !data.server ? 'pass' : 'warning',
        details: data.server ? `Server header exposed: ${data.server}` : 'Server header not exposed',
        impact: rDisc001.impact,
        recommendation: rDisc001.recommendation,
    });

    // SEC-DISC-002: X-Powered-By
    const rDisc002 = getRule('disclosure', 'SEC-DISC-002');
    findings.push({
        ruleId: rDisc002.id,
        description: rDisc002.name,
        level: rDisc002.level as any,
        status: !data.xPoweredBy ? 'pass' : 'warning',
        details: data.xPoweredBy ? `X-Powered-By exposed: ${data.xPoweredBy}` : 'X-Powered-By header not exposed',
        impact: rDisc002.impact,
        recommendation: rDisc002.recommendation,
    });

    return findings;
}

/**
 * Calculate score from findings
 * Only mandatory items significantly impact the score to ensure "corporate grade" rigor
 */
function calculateScore(findings: Finding[]): number {
    if (findings.length === 0) return 100;

    let totalWeight = 0;
    let earnedWeight = 0;

    findings.forEach(finding => {
        // High penalty for mandatory
        const weight = finding.level === 'mandatory' ? 5 :
            finding.level === 'advisory' ? 2 : 1;

        totalWeight += weight;

        if (finding.status === 'pass') {
            earnedWeight += weight;
        } else if (finding.status === 'warning') {
            earnedWeight += weight * 0.5;
        }
        // 'fail' gets 0
    });

    return Math.round((earnedWeight / totalWeight) * 100);
}

/**
 * Main Security Audit Function
 */
export function auditSecurity(url: string, html: string, headers: Headers): CategoryAudit {
    const data = extractSecurityData(html, headers, url);
    const findings = auditRules(data);
    const score = calculateScore(findings);

    return {
        score,
        findings
    };
}
