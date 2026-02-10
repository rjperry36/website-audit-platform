# SEO Audit Criteria Reference

## Traditional SEO Checks (11)

| Rule ID | Description | Level | What It Checks |
|---------|-------------|-------|----------------|
| SEO-001 | Title tag length | Mandatory | Title exists and is 30-60 characters |
| SEO-002 | Meta description length | Mandatory | Meta description exists and is 120-160 characters |
| SEO-003 | Canonical URL set | Mandatory | Canonical link tag is present |
| SEO-004 | Robots meta tag not blocking | Mandatory | Page is not blocking indexing/following |
| SEO-005 | H1 tag structure | Mandatory | Exactly one H1 tag exists |
| SEO-006 | Heading hierarchy is sequential | Advisory | No skipped heading levels (H1→H2→H3) |
| SEO-007 | All images have alt attributes | Mandatory | Every image has alt text |
| SEO-008 | Alt text is meaningful | Advisory | Alt text is descriptive, not generic |
| SEO-009 | Open Graph tags present | Advisory | og:title, og:description, og:image exist |
| SEO-010 | Twitter Card tags present | Acceptable | Twitter Card meta tags exist |
| SEO-011 | URL is clean and descriptive | Advisory | URL structure is clean without excessive parameters |

## AEO (Answer Engine Optimization) Checks (9)

| Rule ID | Description | Level | What It Checks |
|---------|-------------|-------|----------------|
| AEO-001 | Schema markup present | Mandatory | JSON-LD schema exists (Article, FAQPage, HowTo, etc.) |
| AEO-002 | Schema markup is valid JSON-LD | Mandatory | All schema markup is valid JSON |
| AEO-003 | Multiple schema types for knowledge graph | Advisory | 2+ schema types for richer context |
| AEO-004 | FAQ structure with Q&A format | Advisory | Question-based headings or FAQPage schema |
| AEO-005 | Direct answers in first 40-60 words | Advisory | Sections start with concise answers |
| AEO-006 | Content uses lists and tables | Advisory | Structured content with lists/tables |
| AEO-007 | Question-based headings | Advisory | 30%+ headings use question format |
| AEO-008 | Clear, scannable hierarchy | Mandatory | One H1 and multiple H2 sections |
| AEO-009 | Author information and E-E-A-T signals | Advisory | Author bylines and credentials present |

## GEO (Generative Engine Optimization) Checks (10)

| Rule ID | Description | Level | What It Checks |
|---------|-------------|-------|----------------|
| GEO-001 | AI crawler access not blocked | Mandatory | AI crawlers (OAI-SearchBot, etc.) not blocked |
| GEO-002 | LLMs.txt file for AI guidance | Acceptable | Recommendation for /llms.txt file |
| GEO-003 | Citation-ready content chunks | Advisory | 60%+ paragraphs are 30-150 words |
| GEO-004 | Statistics and data points with context | Advisory | 3+ data points/statistics present |
| GEO-005 | External citations to authoritative sources | Advisory | 2+ external links to authoritative sites |
| GEO-006 | Detailed author bios with credentials | Advisory | Author bio with 20+ words |
| GEO-007 | Descriptive image alt text | Mandatory | 70%+ images have 3-15 word alt text |
| GEO-008 | Video/audio transcripts or captions | Acceptable | Transcripts available for media |
| GEO-009 | Conversational and natural language | Acceptable | 30%+ headings use conversational language |
| GEO-010 | Original insights or unique data | Acceptable | Original research indicators present |

## Scoring System

### Overall Score Calculation
- **Traditional SEO**: 50% weight
- **AEO**: 30% weight  
- **GEO**: 20% weight

### Level-Based Weighting
- **Mandatory**: 3x weight
- **Advisory**: 2x weight
- **Acceptable**: 1x weight

### Status Points
- **Pass**: 100% of points
- **Warning**: 50% of points
- **Fail**: 0% of points

## Quick Reference

### For Traditional Search Engines
Focus on: Title tags, meta descriptions, heading structure, image alt text, canonical URLs

### For AI Answer Engines (ChatGPT, Perplexity, etc.)
Focus on: Schema markup, FAQ structure, question-based headings, direct answers, E-E-A-T signals

### For LLM Citation (Claude, Gemini, etc.)
Focus on: Citation-ready chunks, statistics, external citations, author credentials, conversational language

## Example: High-Scoring Page

A page that scores 90+ typically has:
- ✅ Proper meta tags (title 30-60 chars, description 120-160 chars)
- ✅ Single H1 with clear H2/H3 hierarchy
- ✅ Multiple schema types (Article + Organization/FAQPage)
- ✅ Question-based headings (What is X? How to Y?)
- ✅ Direct answers at start of sections
- ✅ Lists, tables, and structured content
- ✅ Author information with credentials
- ✅ Well-sized paragraphs (30-150 words)
- ✅ External citations to authoritative sources
- ✅ Descriptive image alt text
