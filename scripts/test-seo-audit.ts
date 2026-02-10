import { auditSEO } from '../lib/audit/seo-audit';
import { logger } from '../lib/logger';

/**
 * Test the SEO audit engine with sample HTML
 */

const sampleHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Guide to Web Development Best Practices</title>
    <meta name="description" content="Learn the essential web development best practices including SEO, accessibility, and performance optimization techniques for modern websites.">
    <link rel="canonical" href="https://example.com/web-dev-guide">
    <meta name="robots" content="index, follow">
    <meta name="author" content="Jane Smith">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Complete Guide to Web Development">
    <meta property="og:description" content="Essential web development best practices">
    <meta property="og:image" content="https://example.com/images/guide.jpg">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    
    <!-- Schema Markup -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Complete Guide to Web Development Best Practices",
        "author": {
            "@type": "Person",
            "name": "Jane Smith"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Web Dev Academy"
        }
    }
    </script>
    
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is SEO?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "SEO stands for Search Engine Optimization, the practice of improving website visibility in search engines."
                }
            }
        ]
    }
    </script>
</head>
<body>
    <h1>Complete Guide to Web Development Best Practices</h1>
    
    <section>
        <h2>What is Web Development?</h2>
        <p>Web development is the process of building and maintaining websites. It encompasses web design, web content development, client-side scripting, server-side scripting, and network security configuration. Modern web development requires understanding of multiple technologies and best practices to create effective, accessible, and performant websites.</p>
        
        <img src="web-dev.jpg" alt="Developer working on modern web application with multiple screens">
    </section>
    
    <section>
        <h2>How to Optimize Your Website for Search Engines</h2>
        <p>Search engine optimization begins with understanding user intent and creating high-quality content. Focus on providing value to your visitors through well-structured, informative content that directly answers their questions. Use semantic HTML, implement proper heading hierarchy, and ensure all images have descriptive alt text.</p>
        
        <h3>Key SEO Techniques</h3>
        <ul>
            <li>Use descriptive, keyword-rich titles and meta descriptions</li>
            <li>Implement structured data markup</li>
            <li>Optimize page load speed</li>
            <li>Ensure mobile responsiveness</li>
            <li>Build quality backlinks</li>
        </ul>
    </section>
    
    <section>
        <h2>Why is Accessibility Important?</h2>
        <p>Web accessibility ensures that websites are usable by everyone, including people with disabilities. According to our research, approximately 15% of the global population experiences some form of disability. By making your website accessible, you not only comply with legal requirements but also expand your potential audience and improve overall user experience.</p>
        
        <img src="accessibility.jpg" alt="Inclusive web design showing diverse users accessing content">
        
        <table>
            <tr>
                <th>Accessibility Feature</th>
                <th>Benefit</th>
            </tr>
            <tr>
                <td>Alt text for images</td>
                <td>Screen reader compatibility</td>
            </tr>
            <tr>
                <td>Keyboard navigation</td>
                <td>Motor disability support</td>
            </tr>
        </table>
    </section>
    
    <section>
        <h2>Frequently Asked Questions</h2>
        
        <h3>What are the most important web development skills?</h3>
        <p>The most critical web development skills include HTML, CSS, and JavaScript for front-end development, along with understanding of responsive design, version control with Git, and basic SEO principles. We found in our 2026 developer survey that 87% of successful developers also have strong problem-solving abilities and continuous learning habits.</p>
        
        <h3>How long does it take to learn web development?</h3>
        <p>Learning web development typically takes 6-12 months of dedicated study to reach a job-ready level. However, becoming proficient is a continuous journey. Our analysis shows that developers who practice consistently for at least 2 hours daily progress 3x faster than those with irregular study patterns.</p>
    </section>
    
    <section class="author-bio">
        <h2>About the Author</h2>
        <p itemprop="author">Jane Smith is a senior web developer with over 10 years of experience in full-stack development. She specializes in modern JavaScript frameworks and has contributed to numerous open-source projects. Jane holds a Master's degree in Computer Science and regularly speaks at web development conferences worldwide.</p>
    </section>
    
    <footer>
        <p>Learn more from our <a href="https://developer.mozilla.org">trusted resources</a> and <a href="https://web.dev">industry guides</a>.</p>
    </footer>
</body>
</html>
`;

async function testSEOAudit() {
    console.log('🧪 Testing SEO Audit Engine with AEO and GEO\n');
    console.log('='.repeat(60));

    try {
        const result = await auditSEO('https://example.com/web-dev-guide', sampleHTML);

        console.log('\n📊 OVERALL RESULTS');
        console.log('='.repeat(60));
        console.log(`Overall Score: ${result.overall.score}/100`);
        console.log(`Traditional SEO Score: ${result.traditional.score}/100`);
        console.log(`AEO Score: ${result.aeo.score}/100`);
        console.log(`GEO Score: ${result.geo.score}/100`);
        console.log(`Total Findings: ${result.overall.findings.length}`);

        // Traditional SEO Results
        console.log('\n📝 TRADITIONAL SEO FINDINGS');
        console.log('='.repeat(60));
        result.traditional.findings.forEach(finding => {
            const icon = finding.status === 'pass' ? '✅' : finding.status === 'warning' ? '⚠️' : '❌';
            console.log(`${icon} [${finding.ruleId}] ${finding.description}`);
            console.log(`   Status: ${finding.status} | Level: ${finding.level}`);
            console.log(`   Value: ${finding.value}`);
            if (finding.recommendation) {
                console.log(`   💡 ${finding.recommendation}`);
            }
            console.log('');
        });

        // AEO Results
        console.log('\n🤖 AEO (ANSWER ENGINE OPTIMIZATION) FINDINGS');
        console.log('='.repeat(60));
        result.aeo.findings.forEach(finding => {
            const icon = finding.status === 'pass' ? '✅' : finding.status === 'warning' ? '⚠️' : '❌';
            console.log(`${icon} [${finding.ruleId}] ${finding.description}`);
            console.log(`   Status: ${finding.status} | Level: ${finding.level}`);
            console.log(`   Value: ${finding.value}`);
            if (finding.recommendation) {
                console.log(`   💡 ${finding.recommendation}`);
            }
            console.log('');
        });

        // GEO Results
        console.log('\n🌐 GEO (GENERATIVE ENGINE OPTIMIZATION) FINDINGS');
        console.log('='.repeat(60));
        result.geo.findings.forEach(finding => {
            const icon = finding.status === 'pass' ? '✅' : finding.status === 'warning' ? '⚠️' : '❌';
            console.log(`${icon} [${finding.ruleId}] ${finding.description}`);
            console.log(`   Status: ${finding.status} | Level: ${finding.level}`);
            console.log(`   Value: ${finding.value}`);
            if (finding.recommendation) {
                console.log(`   💡 ${finding.recommendation}`);
            }
            console.log('');
        });

        // Summary Statistics
        console.log('\n📈 SUMMARY STATISTICS');
        console.log('='.repeat(60));
        const passed = result.overall.findings.filter(f => f.status === 'pass').length;
        const warnings = result.overall.findings.filter(f => f.status === 'warning').length;
        const failed = result.overall.findings.filter(f => f.status === 'fail').length;

        console.log(`✅ Passed: ${passed}`);
        console.log(`⚠️  Warnings: ${warnings}`);
        console.log(`❌ Failed: ${failed}`);

        const mandatory = result.overall.findings.filter(f => f.level === 'mandatory');
        const mandatoryPassed = mandatory.filter(f => f.status === 'pass').length;
        console.log(`\n🔴 Mandatory Checks: ${mandatoryPassed}/${mandatory.length} passed`);

        console.log('\n✨ Test completed successfully!\n');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testSEOAudit();
