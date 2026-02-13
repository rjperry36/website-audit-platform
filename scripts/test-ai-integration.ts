
import { processCrawlResults } from './browser-crawl';
import { promises as fs } from 'fs';
import path from 'path';
import { TEST_SITE_CONFIG } from '../lib/client-config';

async function runTest() {
    console.log('🚀 Starting AI Integration Test...');

    try {
        // 1. Get a real screenshot from previous artifacts
        // We'll use the one from the "Verification" if available, or just any image
        // Let's assume we have one in the brain directory or use a placeholder
        // Actually, let's look for a file in audit-data

        const siteId = TEST_SITE_CONFIG.id;
        const auditDataDir = path.join(process.cwd(), 'audit-data', siteId);

        // Find a recent screenshot
        // For the test, we'll just try to find ANY png file in recursive search or just fail if not found
        // But to be safe, let's just create a dummy "crawl" with a dummy image if regular ones aren't there?
        // No, we need a real image for GPT-4o to analyze meaningfully.

        // Let's try to find a file we know exists from the conversation history
        // "branding_journal_desktop_1770741325263.png" in the artifacts dir
        const artifactPath = '/Users/russellperry/.gemini/antigravity/brain/a7793c55-805a-41b1-9a60-3e95add6aa0b/branding_journal_desktop_1770741325263.png';
        const htmlPath = path.join(process.cwd(), 'package.json'); // Dummy HTML content source (just need string)

        console.log(`Reading screenshot from: ${artifactPath}`);
        const screenshotBuffer = await fs.readFile(artifactPath);
        const screenshotBase64 = screenshotBuffer.toString('base64');

        console.log('Reading dummy HTML...');
        // We will just use a simple HTML string
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Test Page</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="description" content="Test description">
        </head>
        <body>
            <h1>Test Header</h1>
            <p>Test content.</p>
        </body>
        </html>
        `;

        // 2. Mock Crawl Result
        const result = {
            url: 'https://thebrandingjournal.com',
            html: html,
            status: 200,
            desktopScreenshot: screenshotBase64,
            mobileScreenshot: screenshotBase64 // reuse for test
        };

        // 3. Run processing
        console.log('Processing results...');
        const today = new Date().toISOString().split('T')[0];

        // This will trigger the AI analysis if OPENAI_API_KEY is present
        await processCrawlResults(siteId, today, result);

        console.log('✅ Test complete! Check the logs above for "Running AI Visual Analysis"');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

runTest();
