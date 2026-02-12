---
name: Web Security Audit
description: Implement corporate-grade security audit workflow (OWASP ASVS Level 1) for web applications.
---

# Web Security Audit Skill

This skill guides you through implementing a security audit system that checks HTTP headers and HTML content against OWASP ASVS Level 1 standards.

## Usage
Use this skill when a user asks to:
- "Add security checks"
- "Audit the website for security"
- "Implement OWASP rules"
- "Check for security headers"

## Implementation Steps

### 1. Install Dependencies
Ensure `cheerio` is installed for HTML parsing.
```bash
npm install cheerio
npm install --save-dev @types/cheerio
```

### 2. Create Security Configuration
Create `lib/config/rules/security.json` with the following rule structure:
- **Architecture**: HTTPS usage
- **Headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- **Inputs**: External link safety (`rel="noopener"`), Mixed content
- **Disclosure**: Server header, X-Powered-By

(Refer to `examples/security.json` in this skill folder for the full JSON structure)

### 3. Implement Analyzer
Create `lib/audit/security-analyzer.ts`.
**Responsibilities**:
- Accept `html` string and `headers` object.
- Parse HTML using `cheerio`.
- Extract security headers.
- Identify external links and checks for `rel="noopener"`.
- Identify mixed content (HTTP resources on HTTPS page).

### 4. Implement Audit Logic
Create `lib/audit/security-audit.ts`.
**Responsibilities**:
- Import `security.json` rules.
- Compare extracted data against rules.
- Return findings with status: `pass`, `fail`, or `warning`.
- Categorize findings into `mandatory` (critical) and `advisory` (recommendations).

### 5. Integrate with Crawler
Update the main crawler (e.g., `lib/crawl/crawler.ts`):
- Update `fetchHTML` to return response **headers** alongside the HTML body.
- Pass the headers to the `auditSecurity` function.
- Store the results in the page audit report.

## Verification
Always verify the implementation by running a test script that simulates:
1.  **Secure Page**: Has all headers, HTTPS, valid links. -> Should PASS.
2.  **Insecure Page**: Missing headers, HTTP links. -> Should FAIL.

## Common Pitfalls
- **Case-Insensitive Headers**: browsers treat headers as case-insensitive. Ensure the analyzer checks for `content-security-policy` AND `Content-Security-Policy`.
- **External Links**: Only check `target="_blank"` links for `rel="noopener"`.
