---
description: Implement corporate-grade security audit workflow (OWASP ASVS Level 1)
---

This workflow guides you through implementing a security audit system that checks HTTP headers and HTML content against OWASP ASVS Level 1 standards.

## Prerequisites

Ensure the project has `cheerio` installed (for HTML parsing) and supports TypeScript/ESModules.

```bash
npm install cheerio
npm install --save-dev @types/cheerio tsx
```

## Implementation Steps

### 1. Create Security Audit Logic
Create a file named `scripts/security-audit.ts` (or integrate into your existing audit pipeline) with the following content. This script contains the analyzer, rules, and audit logic in a self-contained module.

```typescript
import * as cheerio from 'cheerio';

// --- Configuration: OWASP ASVS Level 1 Rules ---
const securityRules = {
    architecture: {
        "SEC-ARCH-001": { id: "SEC-ARCH-001", name: "HTTPS Usage", level: "mandatory", impact: "Data transmitted in cleartext", recommendation: "Enforce HTTPS" }
    },
    headers: {
        "SEC-HEAD-001": { id: "SEC-HEAD-001", name: "Strict-Transport-Security", level: "mandatory", impact: "Downgrade attacks possible", recommendation: "Add Strict-Transport-Security header" },
        "SEC-HEAD-002": { id: "SEC-HEAD-002", name: "Content-Security-Policy", level: "mandatory", impact: "XSS vulnerability", recommendation: "Add robust CSP header" },
        "SEC-HEAD-003": { id: "SEC-HEAD-003", name: "X-Frame-Options", level: "mandatory", impact: "Clickjacking vulnerability", recommendation: "Add X-Frame-Options: SAMEORIGIN" },
        "SEC-HEAD-004": { id: "SEC-HEAD-004", name: "X-Content-Type-Options", level: "mandatory", impact: "MIME-sniffing vulnerability", recommendation: "Add X-Content-Type-Options: nosniff" },
        "SEC-HEAD-005": { id: "SEC-HEAD-005", name: "Referrer-Policy", level: "advisory", impact: "Information leakage in Referer header", recommendation: "Add Referrer-Policy: strict-origin-when-cross-origin" },
        "SEC-HEAD-006": { id: "SEC-HEAD-006", name: "Permissions-Policy", level: "advisory", impact: "Unnecessary feature access", recommendation: "Add Permissions-Policy header" }
    },
    inputs: {
        "SEC-INP-001": { id: "SEC-INP-001", name: "External Links Safety", level: "mandatory", impact: "Tabnabbing vulnerability", recommendation: "Add rel='noopener' to target='_blank' links" },
        "SEC-INP-002": { id: "SEC-INP-002", name: "Mixed Content", level: "mandatory", impact: "Insecure resource loading", recommendation: "Load all resources via HTTPS" }
    },
    disclosure: {
        "SEC-DISC-001": { id: "SEC-DISC-001", name: "Server Header", level: "advisory", impact: "Information disclosure", recommendation: "Remove/obscure Server header" },
        "SEC-DISC-002": { id: "SEC-DISC-002", name: "X-Powered-By", level: "advisory", impact: "Stack disclosure", recommendation: "Remove X-Powered-By header" }
    }
};

// --- Analyzer: Extract Data ---
function extractSecurityData(html: string, headers: Headers, url: string) {
    const $ = cheerio.load(html);
    const getHeader = (name: string) => headers.get(name) || headers.get(name.toLowerCase()) || null;

    const hsts = getHeader('Strict-Transport-Security');
    const csp = getHeader('Content-Security-Policy');
    const xFrameOptions = getHeader('X-Frame-Options');
    const xContentTypeOptions = getHeader('X-Content-Type-Options');
    const referrerPolicy = getHeader('Referrer-Policy');
    const permissionsPolicy = getHeader('Permissions-Policy');
    const server = getHeader('Server');
    const xPoweredBy = getHeader('X-Powered-By');
    const https = url.startsWith('https://');

    const externalLinks: any[] = [];
    $('a[href^="http"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        const rel = $(el).attr('rel') || '';
        const target = $(el).attr('target') || '';
        try {
            if (new URL(href).hostname !== new URL(url).hostname) externalLinks.push({ href, rel, target });
        } catch (e) {}
    });

    const resources: any[] = [];
    $('script[src], img[src], link[rel="stylesheet"]').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('href') || '';
        if (src) resources.push({ src, type: el.tagName });
    });

    return { https, hsts, csp, xFrameOptions, xContentTypeOptions, referrerPolicy, permissionsPolicy, server, xPoweredBy, externalLinks, resources };
}

// --- Audit: Evaluate Rules ---
export function auditSecurity(url: string, html: string, headers: Headers) {
    const data = extractSecurityData(html, headers, url);
    const findings: any[] = [];

    // Architecture
    findings.push({ ...securityRules.architecture["SEC-ARCH-001"], status: data.https ? 'pass' : 'fail', details: data.https ? 'HTTPS used' : 'HTTP used' });

    // Headers
    findings.push({ ...securityRules.headers["SEC-HEAD-001"], status: data.hsts ? 'pass' : 'fail', details: data.hsts || 'Missing header' });
    findings.push({ ...securityRules.headers["SEC-HEAD-002"], status: data.csp ? 'pass' : 'fail', details: data.csp ? 'Present' : 'Missing header' });
    findings.push({ ...securityRules.headers["SEC-HEAD-003"], status: data.xFrameOptions ? 'pass' : 'fail', details: data.xFrameOptions || 'Missing header' });
    findings.push({ ...securityRules.headers["SEC-HEAD-004"], status: data.xContentTypeOptions === 'nosniff' ? 'pass' : 'fail', details: data.xContentTypeOptions || 'Missing header' });
    findings.push({ ...securityRules.headers["SEC-HEAD-005"], status: data.referrerPolicy ? 'pass' : 'warning', details: data.referrerPolicy || 'Missing header' });
    findings.push({ ...securityRules.headers["SEC-HEAD-006"], status: data.permissionsPolicy ? 'pass' : 'warning', details: data.permissionsPolicy ? 'Present' : 'Missing header' });

    // Inputs
    const unsafeLinks = data.externalLinks.filter(l => l.target === '_blank' && !l.rel.includes('noopener') && !l.rel.includes('noreferrer'));
    findings.push({ ...securityRules.inputs["SEC-INP-001"], status: unsafeLinks.length === 0 ? 'pass' : 'fail', details: `${unsafeLinks.length} unsafe links` });

    const mixedContent = data.resources.filter(r => r.src.startsWith('http://'));
    findings.push({ ...securityRules.inputs["SEC-INP-002"], status: mixedContent.length === 0 ? 'pass' : 'fail', details: `${mixedContent.length} mixed content items` });

    // Disclosure
    findings.push({ ...securityRules.disclosure["SEC-DISC-001"], status: !data.server ? 'pass' : 'warning', details: data.server || 'Hidden' });
    findings.push({ ...securityRules.disclosure["SEC-DISC-002"], status: !data.xPoweredBy ? 'pass' : 'warning', details: data.xPoweredBy || 'Hidden' });

    // Calculate Score
    let totalWeight = 0, earnedWeight = 0;
    findings.forEach(f => {
        const weight = f.level === 'mandatory' ? 5 : 2;
        totalWeight += weight;
        if (f.status === 'pass') earnedWeight += weight;
        else if (f.status === 'warning') earnedWeight += weight * 0.5;
    });

    return { score: Math.round((earnedWeight / totalWeight) * 100), findings };
}

// --- Runner (if called directly) ---
if (import.meta.url === `file://${process.argv[1]}`) {
    const targetUrl = process.argv[2];
    if (!targetUrl) {
        console.error("Usage: npx tsx scripts/security-audit.ts <url>");
        process.exit(1);
    }
    console.log(`Auditing ${targetUrl}...`);
    fetch(targetUrl).then(async res => {
        const html = await res.text();
        const result = auditSecurity(targetUrl, html, res.headers);
        console.log(`Score: ${result.score}/100`);
        result.findings.filter(f => f.status !== 'pass').forEach(f => {
            console.log(`[${f.level.toUpperCase()}] ${f.name}: ${f.status.toUpperCase()} - ${f.details}`);
            console.log(`  Fix: ${f.recommendation}`);
        });
    }).catch(console.error);
}
```

### 2. Add Run Script
Add the following to your `package.json`:

```json
"scripts": {
    "audit:security": "tsx scripts/security-audit.ts"
}
```

### 3. Usage
Run the audit against any URL:

```bash
npm run audit:security -- https://your-site.com
```

### 4. Integration
To integrate into an existing pipeline, import `auditSecurity` and call it with the URL, HTML string, and Headers object.
