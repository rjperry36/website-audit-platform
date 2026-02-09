# Website Audit Platform

An autonomous website auditing platform powered by Google Antigravity that crawls websites, captures screenshots, performs multi-dimensional audits, and presents findings through a local web dashboard.

## Overview

**SiteAudit Agent** is a specialist autonomous agent that provides end-to-end website auditing capabilities including:

- 🔍 **Automated Crawling** - Discovers and crawls all pages from a root URL
- 📸 **Screenshot Capture** - Full-page screenshots for both desktop and mobile viewports
- 🎯 **Multi-Dimensional Audits** - SEO, Accessibility, Performance, and Brand Compliance
- 📊 **Review Dashboard** - Local web interface for viewing results and trends
- 📅 **Scheduled Crawls** - Configurable crawl frequency with historical tracking
- 🎨 **Brand Guidelines** - Custom compliance rules with reference image comparison

## Features

### Audit Categories

1. **SEO & Meta Tags**
   - Title and meta description validation
   - Heading hierarchy checks
   - Open Graph and Twitter Card tags
   - Structured data validation
   - Internal link health

2. **Accessibility (WCAG 2.1 AA)**
   - Color contrast ratios
   - ARIA roles and landmarks
   - Keyboard navigation
   - Form label associations
   - Alt text validation

3. **Performance & Core Web Vitals**
   - LCP, CLS, INP measurements
   - Image optimization checks
   - Resource compression
   - Render-blocking analysis

4. **Brand & Visual Compliance**
   - Custom brand guideline enforcement
   - Visual comparison against reference images
   - Font and color validation
   - Layout consistency checks

## Getting Started

See [`SYSTEM_PROMPT.md`](./SYSTEM_PROMPT.md) for the complete system prompt and detailed implementation specifications.

### Quick Start Commands

- `setup` — Configure a new site for auditing
- `crawl` — Trigger an immediate crawl
- `dashboard` — Start the review dashboard
- `status` — Show crawl schedule and status
- `guidelines` — Add or update brand guidelines

## Architecture

The platform consists of three main layers:

1. **Admin Configuration Layer** - Manage root URLs, crawl schedules, and brand guidelines
2. **Crawl & Audit Engine** - Automated crawling, screenshot capture, and analysis
3. **Review Dashboard** - Web interface for viewing results and trends

## Data Storage

All audit data is stored locally in a structured format:

```
/audit-data/
  /{site-id}/
    /crawls/
      /{YYYY-MM-DD}/
        /screenshots/
          /desktop/
          /mobile/
        /reports/
          audit-report.json
```

## Technology Stack

- **Crawling**: Playwright/Puppeteer with Google Antigravity browser agent
- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js Express server
- **Storage**: File-based JSON (no external database required)

## License

MIT

## Author

Created with Google Antigravity
