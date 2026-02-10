import { Finding } from '@/components/search/findings-table'

export const mockSEOFindings: Finding[] = [
    {
        ruleId: 'SEO-001',
        description: 'Title tag length',
        level: 'Mandatory',
        status: 'pass',
        details: 'Title tag is 45 characters long, within the optimal range of 30-60 characters.',
        impact: 'Critical for search rankings and click-through rates in search results.',
        recommendation: undefined
    },
    {
        ruleId: 'SEO-002',
        description: 'Meta description length',
        level: 'Mandatory',
        status: 'pass',
        details: 'Meta description is 148 characters long, within the optimal range of 120-160 characters.',
        impact: 'Important for search result snippets and user engagement.',
        recommendation: undefined
    },
    {
        ruleId: 'SEO-003',
        description: 'Canonical URL set',
        level: 'Mandatory',
        status: 'pass',
        details: 'Canonical link tag is present and points to the correct URL.',
        impact: 'Prevents duplicate content issues and consolidates ranking signals.',
        recommendation: undefined
    },
    {
        ruleId: 'SEO-004',
        description: 'Robots meta tag not blocking',
        level: 'Mandatory',
        status: 'pass',
        details: 'Page allows indexing and following of links (no noindex or nofollow directives).',
        impact: 'Essential for page visibility in search engines.',
        recommendation: undefined
    },
    {
        ruleId: 'SEO-005',
        description: 'H1 tag structure',
        level: 'Mandatory',
        status: 'pass',
        details: 'Exactly one H1 tag found on the page.',
        impact: 'Helps search engines understand the main topic of the page.',
        recommendation: undefined
    },
    {
        ruleId: 'SEO-006',
        description: 'Heading hierarchy is sequential',
        level: 'Advisory',
        status: 'warning',
        details: 'Found heading level skip: H1 directly to H3 on line 127 without an H2 in between.',
        impact: 'May confuse search engines about content structure and importance.',
        recommendation: 'Add an H2 heading before the H3 on line 127 to maintain proper hierarchy.'
    },
    {
        ruleId: 'SEO-007',
        description: 'All images have alt attributes',
        level: 'Mandatory',
        status: 'pass',
        details: 'All 12 images on the page have alt attributes.',
        impact: 'Critical for accessibility and image search optimization.',
        recommendation: undefined
    },
    {
        ruleId: 'SEO-008',
        description: 'Alt text is meaningful',
        level: 'Advisory',
        status: 'fail',
        details: '3 out of 12 images have generic alt text like "image" or "photo".',
        impact: 'Reduces accessibility and misses opportunities for image search traffic.',
        recommendation: 'Replace generic alt text with descriptive text that explains what the image shows. For example, change "image" to "Customer using mobile app to track order status".'
    },
    {
        ruleId: 'SEO-009',
        description: 'Open Graph tags present',
        level: 'Advisory',
        status: 'pass',
        details: 'All required Open Graph tags are present: og:title, og:description, og:image, og:url.',
        impact: 'Improves appearance when shared on social media platforms.',
        recommendation: undefined
    },
    {
        ruleId: 'SEO-010',
        description: 'Twitter Card tags present',
        level: 'Acceptable',
        status: 'pass',
        details: 'Twitter Card meta tags are present with summary_large_image card type.',
        impact: 'Enhances appearance when shared on Twitter/X.',
        recommendation: undefined
    },
    {
        ruleId: 'SEO-011',
        description: 'URL is clean and descriptive',
        level: 'Advisory',
        status: 'pass',
        details: 'URL structure is clean with descriptive slugs and no excessive parameters.',
        impact: 'Improves user trust and search engine understanding.',
        recommendation: undefined
    }
]

export const mockAEOFindings: Finding[] = [
    {
        ruleId: 'AEO-001',
        description: 'Schema markup present',
        level: 'Mandatory',
        status: 'pass',
        details: 'JSON-LD schema markup found: Article and Organization types.',
        impact: 'Essential for rich results and knowledge graph inclusion.',
        recommendation: undefined
    },
    {
        ruleId: 'AEO-002',
        description: 'Schema markup is valid JSON-LD',
        level: 'Mandatory',
        status: 'pass',
        details: 'All schema markup validates as proper JSON-LD syntax.',
        impact: 'Ensures search engines can parse and use the structured data.',
        recommendation: undefined
    },
    {
        ruleId: 'AEO-003',
        description: 'Multiple schema types for knowledge graph',
        level: 'Advisory',
        status: 'pass',
        details: '2 schema types found (Article, Organization), providing rich context.',
        impact: 'Increases chances of appearing in knowledge panels and rich results.',
        recommendation: undefined
    },
    {
        ruleId: 'AEO-004',
        description: 'FAQ structure with Q&A format',
        level: 'Advisory',
        status: 'pass',
        details: 'FAQPage schema with 5 question-answer pairs detected.',
        impact: 'Enables FAQ rich results in search engines.',
        recommendation: undefined
    },
    {
        ruleId: 'AEO-005',
        description: 'Direct answers in first 40-60 words',
        level: 'Advisory',
        status: 'pass',
        details: '8 out of 10 sections start with concise 40-60 word answers.',
        impact: 'Optimizes for featured snippets and AI answer extraction.',
        recommendation: undefined
    },
    {
        ruleId: 'AEO-006',
        description: 'Content uses lists and tables',
        level: 'Advisory',
        status: 'pass',
        details: 'Found 4 lists and 2 tables providing structured information.',
        impact: 'Makes content easier for AI to extract and present.',
        recommendation: undefined
    },
    {
        ruleId: 'AEO-007',
        description: 'Question-based headings',
        level: 'Advisory',
        status: 'pass',
        details: '6 out of 15 headings (40%) use question format.',
        impact: 'Aligns with how users search and how AI answers questions.',
        recommendation: undefined
    },
    {
        ruleId: 'AEO-008',
        description: 'Clear, scannable hierarchy',
        level: 'Mandatory',
        status: 'pass',
        details: 'One H1 with multiple H2 sections creating clear content structure.',
        impact: 'Helps AI understand content organization and extract relevant sections.',
        recommendation: undefined
    },
    {
        ruleId: 'AEO-009',
        description: 'Author information and E-E-A-T signals',
        level: 'Advisory',
        status: 'pass',
        details: 'Author byline present with credentials and expertise indicators.',
        impact: 'Builds trust and authority for AI answer engines.',
        recommendation: undefined
    }
]

export const mockGEOFindings: Finding[] = [
    {
        ruleId: 'GEO-001',
        description: 'AI crawler access not blocked',
        level: 'Mandatory',
        status: 'pass',
        details: 'AI crawlers (GPTBot, OAI-SearchBot, Claude-Web) are not blocked in robots.txt.',
        impact: 'Critical for inclusion in AI-generated answers and citations.',
        recommendation: undefined
    },
    {
        ruleId: 'GEO-002',
        description: 'LLMs.txt file for AI guidance',
        level: 'Acceptable',
        status: 'warning',
        details: 'No /llms.txt file found to guide AI crawlers.',
        impact: 'Missed opportunity to provide AI-specific context and preferences.',
        recommendation: 'Create an /llms.txt file with key information about your site, preferred citation format, and important pages for AI to reference.'
    },
    {
        ruleId: 'GEO-003',
        description: 'Citation-ready content chunks',
        level: 'Advisory',
        status: 'pass',
        details: '72% of paragraphs are 30-150 words, ideal for AI citation.',
        impact: 'Makes content easy for LLMs to extract and cite accurately.',
        recommendation: undefined
    },
    {
        ruleId: 'GEO-004',
        description: 'Statistics and data points with context',
        level: 'Advisory',
        status: 'pass',
        details: '7 statistics found with proper context and sources.',
        impact: 'Provides factual content that AI can confidently cite.',
        recommendation: undefined
    },
    {
        ruleId: 'GEO-005',
        description: 'External citations to authoritative sources',
        level: 'Advisory',
        status: 'pass',
        details: '4 external links to authoritative sources (.edu, .gov, industry leaders).',
        impact: 'Demonstrates research quality and builds trust with AI systems.',
        recommendation: undefined
    },
    {
        ruleId: 'GEO-006',
        description: 'Detailed author bios with credentials',
        level: 'Advisory',
        status: 'pass',
        details: 'Author bio is 45 words with credentials and expertise areas.',
        impact: 'Establishes E-E-A-T signals for AI trust assessment.',
        recommendation: undefined
    },
    {
        ruleId: 'GEO-007',
        description: 'Descriptive image alt text',
        level: 'Mandatory',
        status: 'warning',
        details: '8 out of 12 images (67%) have 3-15 word descriptive alt text.',
        impact: 'AI systems rely on alt text to understand and describe images.',
        recommendation: 'Improve alt text for the remaining 4 images to be more descriptive (3-15 words explaining what the image shows).'
    },
    {
        ruleId: 'GEO-008',
        description: 'Video/audio transcripts or captions',
        level: 'Acceptable',
        status: 'pass',
        details: 'Video has embedded captions and separate transcript available.',
        impact: 'Makes multimedia content accessible to AI for summarization.',
        recommendation: undefined
    },
    {
        ruleId: 'GEO-009',
        description: 'Conversational and natural language',
        level: 'Acceptable',
        status: 'warning',
        details: '4 out of 15 headings (27%) use conversational language.',
        impact: 'Natural language helps AI match user queries more effectively.',
        recommendation: 'Consider rephrasing more headings in conversational style (e.g., "How to improve SEO" instead of "SEO Improvement Methods").'
    },
    {
        ruleId: 'GEO-010',
        description: 'Original insights or unique data',
        level: 'Acceptable',
        status: 'pass',
        details: 'Original case study and proprietary research data detected.',
        impact: 'Unique content is more likely to be cited by AI systems.',
        recommendation: undefined
    }
]
