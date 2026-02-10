import * as cheerio from 'cheerio';
import { CategoryAudit, Finding } from '../types';

/**
 * SEO Audit Engine with AEO and GEO criteria
 * Analyzes HTML content for traditional SEO, Answer Engine Optimization (AEO),
 * and Generative Engine Optimization (GEO) best practices
 */

export interface SEOAuditResult {
    overall: CategoryAudit;
    traditional: CategoryAudit;
    aeo: CategoryAudit;
    geo: CategoryAudit;
}

/**
 * Run comprehensive SEO audit on HTML content
 */
export async function auditSEO(url: string, html: string): Promise<SEOAuditResult> {
    const $ = cheerio.load(html);

    // Run all audit categories
    const traditionalFindings = auditTraditionalSEO($, url);
    const aeoFindings = auditAEO($);
    const geoFindings = auditGEO($);

    // Calculate scores
    const traditionalScore = calculateScore(traditionalFindings);
    const aeoScore = calculateScore(aeoFindings);
    const geoScore = calculateScore(geoFindings);

    // Calculate weighted overall score (Traditional: 50%, AEO: 30%, GEO: 20%)
    const overallScore = Math.round(
        traditionalScore * 0.5 + aeoScore * 0.3 + geoScore * 0.2
    );

    const allFindings = [...traditionalFindings, ...aeoFindings, ...geoFindings];

    return {
        overall: {
            score: overallScore,
            findings: allFindings,
        },
        traditional: {
            score: traditionalScore,
            findings: traditionalFindings,
        },
        aeo: {
            score: aeoScore,
            findings: aeoFindings,
        },
        geo: {
            score: geoScore,
            findings: geoFindings,
        },
    };
}

/**
 * Traditional SEO Audits
 */
function auditTraditionalSEO($: cheerio.CheerioAPI, url: string): Finding[] {
    const findings: Finding[] = [];

    // SEO-001: Title tag
    const title = $('title').first().text().trim();
    const titleLength = title.length;
    if (!title) {
        findings.push({
            ruleId: 'SEO-001',
            description: 'Title tag exists',
            level: 'mandatory',
            status: 'fail',
            value: 'No title tag found',
            recommendation: 'Add a descriptive title tag (30-60 characters) to improve search visibility.',
        });
    } else if (titleLength < 30 || titleLength > 60) {
        findings.push({
            ruleId: 'SEO-001',
            description: 'Title tag length',
            level: 'mandatory',
            status: 'warning',
            value: `${titleLength} characters`,
            recommendation: `Adjust title length to 30-60 characters. Current: "${title.substring(0, 60)}..."`,
        });
    } else {
        findings.push({
            ruleId: 'SEO-001',
            description: 'Title tag length',
            level: 'mandatory',
            status: 'pass',
            value: `${title} (${titleLength} chars)`,
            recommendation: null,
        });
    }

    // SEO-002: Meta description
    const metaDesc = $('meta[name="description"]').attr('content')?.trim() || '';
    const descLength = metaDesc.length;
    if (!metaDesc) {
        findings.push({
            ruleId: 'SEO-002',
            description: 'Meta description exists',
            level: 'mandatory',
            status: 'fail',
            value: 'No meta description found',
            recommendation: 'Add a meta description (120-160 characters) to improve click-through rates.',
        });
    } else if (descLength < 120 || descLength > 160) {
        findings.push({
            ruleId: 'SEO-002',
            description: 'Meta description length',
            level: 'mandatory',
            status: 'warning',
            value: `${descLength} characters`,
            recommendation: `Adjust meta description to 120-160 characters for optimal display in search results.`,
        });
    } else {
        findings.push({
            ruleId: 'SEO-002',
            description: 'Meta description length',
            level: 'mandatory',
            status: 'pass',
            value: `${descLength} characters`,
            recommendation: null,
        });
    }

    // SEO-003: Canonical URL
    const canonical = $('link[rel="canonical"]').attr('href');
    if (!canonical) {
        findings.push({
            ruleId: 'SEO-003',
            description: 'Canonical URL set',
            level: 'mandatory',
            status: 'fail',
            value: 'No canonical URL found',
            recommendation: 'Add a canonical link tag to prevent duplicate content issues.',
        });
    } else {
        findings.push({
            ruleId: 'SEO-003',
            description: 'Canonical URL set',
            level: 'mandatory',
            status: 'pass',
            value: canonical,
            recommendation: null,
        });
    }

    // SEO-004: Robots meta tag
    const robotsMeta = $('meta[name="robots"]').attr('content')?.toLowerCase() || '';
    if (robotsMeta.includes('noindex') || robotsMeta.includes('nofollow')) {
        findings.push({
            ruleId: 'SEO-004',
            description: 'Robots meta tag not blocking',
            level: 'mandatory',
            status: 'warning',
            value: robotsMeta,
            recommendation: 'Page is blocking indexing/following. Remove if unintentional.',
        });
    } else {
        findings.push({
            ruleId: 'SEO-004',
            description: 'Robots meta tag not blocking',
            level: 'mandatory',
            status: 'pass',
            value: robotsMeta || 'Not set (default: index, follow)',
            recommendation: null,
        });
    }

    // SEO-005: H1 tag
    const h1Tags = $('h1');
    if (h1Tags.length === 0) {
        findings.push({
            ruleId: 'SEO-005',
            description: 'H1 tag exists',
            level: 'mandatory',
            status: 'fail',
            value: 'No H1 tag found',
            recommendation: 'Add exactly one H1 tag to clearly indicate the main topic of the page.',
        });
    } else if (h1Tags.length > 1) {
        findings.push({
            ruleId: 'SEO-005',
            description: 'Only one H1 tag',
            level: 'mandatory',
            status: 'fail',
            value: `${h1Tags.length} H1 tags found`,
            recommendation: 'Use only one H1 tag per page for clear content hierarchy.',
        });
    } else {
        findings.push({
            ruleId: 'SEO-005',
            description: 'H1 tag structure',
            level: 'mandatory',
            status: 'pass',
            value: h1Tags.first().text().trim().substring(0, 60),
            recommendation: null,
        });
    }

    // SEO-006: Heading hierarchy
    const headingLevels: number[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
        const level = parseInt(el.tagName.substring(1));
        headingLevels.push(level);
    });

    let hierarchyValid = true;
    for (let i = 1; i < headingLevels.length; i++) {
        if (headingLevels[i] - headingLevels[i - 1] > 1) {
            hierarchyValid = false;
            break;
        }
    }

    findings.push({
        ruleId: 'SEO-006',
        description: 'Heading hierarchy is sequential',
        level: 'advisory',
        status: hierarchyValid ? 'pass' : 'fail',
        value: hierarchyValid ? 'No skipped levels' : 'Heading levels skipped',
        recommendation: hierarchyValid ? null : 'Ensure headings follow sequential order (H1 → H2 → H3) without skipping levels.',
    });

    // SEO-007: Image alt attributes
    const images = $('img');
    const imagesWithoutAlt = images.filter((_, el) => !$(el).attr('alt')).length;

    if (images.length === 0) {
        findings.push({
            ruleId: 'SEO-007',
            description: 'Image alt attributes',
            level: 'mandatory',
            status: 'pass',
            value: 'No images on page',
            recommendation: null,
        });
    } else if (imagesWithoutAlt > 0) {
        findings.push({
            ruleId: 'SEO-007',
            description: 'All images have alt attributes',
            level: 'mandatory',
            status: 'fail',
            value: `${imagesWithoutAlt} of ${images.length} images missing alt text`,
            recommendation: 'Add descriptive alt text to all images for accessibility and SEO.',
        });
    } else {
        findings.push({
            ruleId: 'SEO-007',
            description: 'All images have alt attributes',
            level: 'mandatory',
            status: 'pass',
            value: `${images.length} images with alt text`,
            recommendation: null,
        });
    }

    // SEO-008: Meaningful alt text
    const genericAltText = images.filter((_, el) => {
        const alt = $(el).attr('alt')?.toLowerCase() || '';
        return alt === 'image' || alt === 'img' || alt === 'picture' || alt === 'photo';
    }).length;

    if (images.length > 0 && genericAltText > 0) {
        findings.push({
            ruleId: 'SEO-008',
            description: 'Alt text is meaningful',
            level: 'advisory',
            status: 'warning',
            value: `${genericAltText} images with generic alt text`,
            recommendation: 'Use descriptive alt text that explains the image content, not just "image" or "photo".',
        });
    } else if (images.length > 0) {
        findings.push({
            ruleId: 'SEO-008',
            description: 'Alt text is meaningful',
            level: 'advisory',
            status: 'pass',
            value: 'No generic alt text detected',
            recommendation: null,
        });
    }

    // SEO-009: Open Graph tags
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDesc = $('meta[property="og:description"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');
    const hasAllOG = ogTitle && ogDesc && ogImage;

    findings.push({
        ruleId: 'SEO-009',
        description: 'Open Graph tags present',
        level: 'advisory',
        status: hasAllOG ? 'pass' : 'fail',
        value: hasAllOG ? 'og:title, og:description, og:image' : 'Missing some OG tags',
        recommendation: hasAllOG ? null : 'Add Open Graph tags (og:title, og:description, og:image) for better social media sharing.',
    });

    // SEO-010: Twitter Card tags
    const twitterCard = $('meta[name="twitter:card"]').attr('content');

    findings.push({
        ruleId: 'SEO-010',
        description: 'Twitter Card tags present',
        level: 'acceptable',
        status: twitterCard ? 'pass' : 'fail',
        value: twitterCard || 'Not found',
        recommendation: twitterCard ? null : 'Add Twitter Card meta tags for enhanced Twitter sharing.',
    });

    // SEO-011: Clean URL structure
    const urlPath = new URL(url).pathname;
    const hasCleanUrl = !urlPath.includes('?') && !urlPath.includes('&') &&
        !urlPath.match(/\d{5,}/) && // No long numbers
        urlPath.split('/').every(segment => segment.length < 50);

    findings.push({
        ruleId: 'SEO-011',
        description: 'URL is clean and descriptive',
        level: 'advisory',
        status: hasCleanUrl ? 'pass' : 'warning',
        value: urlPath,
        recommendation: hasCleanUrl ? null : 'Use clean, descriptive URLs without excessive parameters or long ID numbers.',
    });

    return findings;
}

/**
 * AEO (Answer Engine Optimization) Audits
 */
function auditAEO($: cheerio.CheerioAPI): Finding[] {
    const findings: Finding[] = [];

    // AEO-001: Schema markup presence
    const schemas = $('script[type="application/ld+json"]');
    const schemaTypes: string[] = [];

    schemas.each((_, el) => {
        try {
            const schemaData = JSON.parse($(el).html() || '{}');
            const type = schemaData['@type'] || (Array.isArray(schemaData['@graph']) ?
                schemaData['@graph'].map((item: any) => item['@type']).join(', ') : '');
            if (type) schemaTypes.push(type);
        } catch (e) {
            // Invalid JSON
        }
    });

    if (schemaTypes.length === 0) {
        findings.push({
            ruleId: 'AEO-001',
            description: 'Schema markup present',
            level: 'mandatory',
            status: 'fail',
            value: 'No schema markup found',
            recommendation: 'Add JSON-LD schema markup (Article, Organization, FAQPage, or HowTo) to help AI understand your content.',
        });
    } else {
        findings.push({
            ruleId: 'AEO-001',
            description: 'Schema markup present',
            level: 'mandatory',
            status: 'pass',
            value: `Found: ${schemaTypes.join(', ')}`,
            recommendation: null,
            evidence: `${schemas.length} schema(s) detected`,
        });
    }

    // AEO-002: Schema validation
    let hasValidSchema = true;
    schemas.each((_, el) => {
        try {
            JSON.parse($(el).html() || '{}');
        } catch (e) {
            hasValidSchema = false;
        }
    });

    if (schemas.length > 0) {
        findings.push({
            ruleId: 'AEO-002',
            description: 'Schema markup is valid JSON-LD',
            level: 'mandatory',
            status: hasValidSchema ? 'pass' : 'fail',
            value: hasValidSchema ? 'All schemas valid' : 'Invalid JSON detected',
            recommendation: hasValidSchema ? null : 'Fix JSON-LD syntax errors in schema markup.',
        });
    }

    // AEO-003: Multiple schema types (knowledge graph strategy)
    findings.push({
        ruleId: 'AEO-003',
        description: 'Multiple schema types for knowledge graph',
        level: 'advisory',
        status: schemaTypes.length >= 2 ? 'pass' : 'warning',
        value: `${schemaTypes.length} schema type(s)`,
        recommendation: schemaTypes.length >= 2 ? null : 'Consider adding multiple interconnected schema types (e.g., Article + Organization) for richer context.',
    });

    // AEO-004: FAQ structure
    const faqHeadings = $('h2, h3').filter((_, el) => {
        const text = $(el).text().toLowerCase();
        return text.includes('?') ||
            !!text.match(/^(what|how|why|when|where|who|can|should|does|is|are)\s/i);
    });

    const hasFAQSchema = schemaTypes.some(type => type.includes('FAQPage'));
    const hasFAQStructure = faqHeadings.length >= 3;

    findings.push({
        ruleId: 'AEO-004',
        description: 'FAQ structure with Q&A format',
        level: 'advisory',
        status: (hasFAQSchema || hasFAQStructure) ? 'pass' : 'fail',
        value: hasFAQSchema ? 'FAQPage schema found' : `${faqHeadings.length} question headings`,
        recommendation: (hasFAQSchema || hasFAQStructure) ? null : 'Add FAQ section with question-based headings to improve AI answer engine visibility.',
    });

    // AEO-005: Direct answers (40-60 word summaries)
    const sections = $('h2, h3').map((_, el) => {
        const heading = $(el);
        const nextText = heading.nextUntil('h1, h2, h3, h4').text().trim();
        const firstParagraph = nextText.split(/\n\n/)[0];
        const wordCount = firstParagraph.split(/\s+/).length;
        return { wordCount, text: firstParagraph.substring(0, 100) };
    }).get();

    const sectionsWithDirectAnswers = sections.filter(s => s.wordCount >= 40 && s.wordCount <= 80).length;
    const totalSections = sections.length;

    if (totalSections > 0) {
        const percentage = Math.round((sectionsWithDirectAnswers / totalSections) * 100);
        findings.push({
            ruleId: 'AEO-005',
            description: 'Direct answers in first 40-60 words',
            level: 'advisory',
            status: percentage >= 50 ? 'pass' : 'warning',
            value: `${sectionsWithDirectAnswers} of ${totalSections} sections (${percentage}%)`,
            recommendation: percentage >= 50 ? null : 'Start sections with concise 40-60 word answers before elaborating.',
        });
    }

    // AEO-006: Lists and tables for structured data
    const lists = $('ul, ol').length;
    const tables = $('table').length;
    const hasStructuredContent = lists >= 2 || tables >= 1;

    findings.push({
        ruleId: 'AEO-006',
        description: 'Content uses lists and tables',
        level: 'advisory',
        status: hasStructuredContent ? 'pass' : 'warning',
        value: `${lists} lists, ${tables} tables`,
        recommendation: hasStructuredContent ? null : 'Use bulleted lists, numbered lists, and tables to structure information for easier AI extraction.',
    });

    // AEO-007: Question-based headings
    const totalHeadings = $('h2, h3').length;
    const questionHeadings = faqHeadings.length;
    const questionPercentage = totalHeadings > 0 ? Math.round((questionHeadings / totalHeadings) * 100) : 0;

    findings.push({
        ruleId: 'AEO-007',
        description: 'Question-based headings (how, what, why)',
        level: 'advisory',
        status: questionPercentage >= 30 ? 'pass' : 'warning',
        value: `${questionHeadings} of ${totalHeadings} headings (${questionPercentage}%)`,
        recommendation: questionPercentage >= 30 ? null : 'Use more question-based headings (How to..., What is..., Why does...) to match conversational queries.',
    });

    // AEO-008: Clear scannable hierarchy
    const h1Count = $('h1').length;
    const h2Count = $('h2').length;
    const h3Count = $('h3').length;
    const hasGoodHierarchy = h1Count === 1 && h2Count >= 2;

    findings.push({
        ruleId: 'AEO-008',
        description: 'Clear, scannable hierarchy (H1 > H2 > H3)',
        level: 'mandatory',
        status: hasGoodHierarchy ? 'pass' : 'fail',
        value: `H1: ${h1Count}, H2: ${h2Count}, H3: ${h3Count}`,
        recommendation: hasGoodHierarchy ? null : 'Ensure clear heading hierarchy with one H1 and multiple H2 sections for AI parsing.',
    });

    // AEO-009: Author and E-E-A-T signals
    const hasAuthor = $('meta[name="author"]').length > 0 ||
        $('.author, .byline, [rel="author"]').length > 0 ||
        schemaTypes.some(type => type.includes('Person') || type.includes('Author'));

    findings.push({
        ruleId: 'AEO-009',
        description: 'Author information and E-E-A-T signals',
        level: 'advisory',
        status: hasAuthor ? 'pass' : 'warning',
        value: hasAuthor ? 'Author information found' : 'No author information',
        recommendation: hasAuthor ? null : 'Add author bylines and credentials to demonstrate expertise and build trust.',
    });

    return findings;
}

/**
 * GEO (Generative Engine Optimization) Audits
 */
function auditGEO($: cheerio.CheerioAPI): Finding[] {
    const findings: Finding[] = [];

    // GEO-001: AI crawler access (check meta robots)
    const robotsMeta = $('meta[name="robots"]').attr('content')?.toLowerCase() || '';
    const aiCrawlerBlocked = robotsMeta.includes('noai') ||
        robotsMeta.includes('noimageai') ||
        $('meta[name="googlebot"]').attr('content')?.toLowerCase().includes('noindex');

    findings.push({
        ruleId: 'GEO-001',
        description: 'AI crawler access not blocked',
        level: 'mandatory',
        status: aiCrawlerBlocked ? 'fail' : 'pass',
        value: aiCrawlerBlocked ? 'AI crawlers blocked' : 'AI crawlers allowed',
        recommendation: aiCrawlerBlocked ? 'Remove restrictions on AI crawlers (OAI-SearchBot, Google-Extended) to enable LLM visibility.' : null,
    });

    // GEO-002: LLMs.txt file (we can't check this from HTML, so advisory note)
    findings.push({
        ruleId: 'GEO-002',
        description: 'LLMs.txt file for AI guidance',
        level: 'acceptable',
        status: 'warning',
        value: 'Cannot verify from HTML',
        recommendation: 'Consider adding /llms.txt file to guide AI systems about your content structure.',
    });

    // GEO-003: Citation-ready content chunks
    const paragraphs = $('p');
    const wellStructuredParagraphs = paragraphs.filter((_, el) => {
        const text = $(el).text().trim();
        const wordCount = text.split(/\s+/).length;
        return wordCount >= 30 && wordCount <= 150; // Ideal chunk size
    }).length;

    const chunkPercentage = paragraphs.length > 0 ?
        Math.round((wellStructuredParagraphs / paragraphs.length) * 100) : 0;

    findings.push({
        ruleId: 'GEO-003',
        description: 'Citation-ready content chunks',
        level: 'advisory',
        status: chunkPercentage >= 60 ? 'pass' : 'warning',
        value: `${wellStructuredParagraphs} of ${paragraphs.length} paragraphs (${chunkPercentage}%)`,
        recommendation: chunkPercentage >= 60 ? null : 'Break content into clear, extractable passages (30-150 words) with descriptive headings for better LLM citation.',
    });

    // GEO-004: Statistics and data points
    const textContent = $('body').text();
    const hasNumbers = textContent.match(/\d+%|\d+\s*(percent|million|billion|thousand)/gi);
    const hasStatistics = (hasNumbers?.length || 0) >= 3;

    findings.push({
        ruleId: 'GEO-004',
        description: 'Statistics and data points with context',
        level: 'advisory',
        status: hasStatistics ? 'pass' : 'warning',
        value: hasStatistics ? `${hasNumbers?.length} data points found` : 'Few statistics detected',
        recommendation: hasStatistics ? null : 'Include specific statistics and data points to make content more citable by LLMs.',
    });

    // GEO-005: External citations to authoritative sources
    const externalLinks = $('a[href^="http"]').filter((_, el) => {
        const href = $(el).attr('href') || '';
        return !href.includes(new URL(href).hostname);
    });

    const hasExternalCitations = externalLinks.length >= 2;

    findings.push({
        ruleId: 'GEO-005',
        description: 'External citations to authoritative sources',
        level: 'advisory',
        status: hasExternalCitations ? 'pass' : 'warning',
        value: `${externalLinks.length} external links`,
        recommendation: hasExternalCitations ? null : 'Link to authoritative external sources to build credibility and trust signals.',
    });

    // GEO-006: Detailed author bios
    const authorBio = $('.author-bio, .about-author, [itemprop="author"]');
    const hasDetailedAuthor = authorBio.length > 0 && authorBio.text().split(/\s+/).length >= 20;

    findings.push({
        ruleId: 'GEO-006',
        description: 'Detailed author bios with credentials',
        level: 'advisory',
        status: hasDetailedAuthor ? 'pass' : 'warning',
        value: hasDetailedAuthor ? 'Author bio found' : 'No detailed author bio',
        recommendation: hasDetailedAuthor ? null : 'Add detailed author bios with credentials and expertise to demonstrate E-E-A-T.',
    });

    // GEO-007: Descriptive image alt text (not keyword stuffing)
    const images = $('img[alt]');
    const descriptiveAltText = images.filter((_, el) => {
        const alt = $(el).attr('alt') || '';
        const wordCount = alt.split(/\s+/).length;
        return wordCount >= 3 && wordCount <= 15; // Descriptive but not stuffed
    }).length;

    if (images.length > 0) {
        const altPercentage = Math.round((descriptiveAltText / images.length) * 100);
        findings.push({
            ruleId: 'GEO-007',
            description: 'Descriptive image alt text',
            level: 'mandatory',
            status: altPercentage >= 70 ? 'pass' : 'warning',
            value: `${descriptiveAltText} of ${images.length} images (${altPercentage}%)`,
            recommendation: altPercentage >= 70 ? null : 'Use descriptive alt text (3-15 words) that explains image content, not just keywords.',
        });
    }

    // GEO-008: Video/audio transcripts
    const hasVideo = $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0;
    const hasTranscript = $('.transcript, [class*="transcript"]').length > 0;

    if (hasVideo) {
        findings.push({
            ruleId: 'GEO-008',
            description: 'Video/audio transcripts or captions',
            level: 'acceptable',
            status: hasTranscript ? 'pass' : 'warning',
            value: hasTranscript ? 'Transcript found' : 'No transcript detected',
            recommendation: hasTranscript ? null : 'Add transcripts or captions for video/audio content to make it accessible to LLMs.',
        });
    }

    // GEO-009: Conversational and natural language
    const headings = $('h1, h2, h3').map((_, el) => $(el).text()).get();
    const conversationalHeadings = headings.filter(h =>
        h.match(/\b(you|your|we|our|how to|guide|tips|ways)\b/i)
    ).length;

    const conversationalPercentage = headings.length > 0 ?
        Math.round((conversationalHeadings / headings.length) * 100) : 0;

    findings.push({
        ruleId: 'GEO-009',
        description: 'Conversational and natural language',
        level: 'acceptable',
        status: conversationalPercentage >= 30 ? 'pass' : 'warning',
        value: `${conversationalHeadings} of ${headings.length} headings (${conversationalPercentage}%)`,
        recommendation: conversationalPercentage >= 30 ? null : 'Use more conversational language that addresses user intent directly.',
    });

    // GEO-010: Original insights or unique data
    const hasOriginalContent = textContent.match(/our (research|study|analysis|findings|data)/gi) ||
        textContent.match(/we (found|discovered|analyzed|tested)/gi);

    findings.push({
        ruleId: 'GEO-010',
        description: 'Original insights or unique data',
        level: 'acceptable',
        status: hasOriginalContent ? 'pass' : 'warning',
        value: hasOriginalContent ? 'Original research indicators found' : 'No original research detected',
        recommendation: hasOriginalContent ? null : 'Include original insights, research, or unique data that LLMs can cite.',
    });

    return findings;
}

/**
 * Calculate score from findings
 */
function calculateScore(findings: Finding[]): number {
    if (findings.length === 0) return 100;

    let totalWeight = 0;
    let earnedWeight = 0;

    findings.forEach(finding => {
        // Weight by level: mandatory = 3, advisory = 2, acceptable = 1
        const weight = finding.level === 'mandatory' ? 3 :
            finding.level === 'advisory' ? 2 : 1;

        totalWeight += weight;

        if (finding.status === 'pass') {
            earnedWeight += weight;
        } else if (finding.status === 'warning') {
            earnedWeight += weight * 0.5; // Partial credit for warnings
        }
        // 'fail' gets 0 points
    });

    return Math.round((earnedWeight / totalWeight) * 100);
}
