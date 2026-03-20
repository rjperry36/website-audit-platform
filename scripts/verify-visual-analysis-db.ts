
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function verify() {
    console.log('🚀 Starting Verification of DB-driven Visual Analysis...');

    // 1. Create a dummy image (1x1 red pixel)
    const dummyImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const tempImagePath = path.join(process.cwd(), 'temp-test-image.png');

    fs.writeFileSync(tempImagePath, Buffer.from(dummyImageBase64, 'base64'));
    console.log(`📸 Created dummy image at: ${tempImagePath}`);

    try {
        // Dynamic import to ensure env vars are ready before module init
        const { auditVisualDesign } = await import('../lib/audit/visual-analyzer');

        console.log('🔍 Running auditVisualDesign...');
        const findings = await auditVisualDesign(tempImagePath);

        console.log('\n📊 Findings Result:');
        console.log(JSON.stringify(findings, null, 2));

        if (findings.length > 0) {
            console.log(`\n✅ Success: Generated ${findings.length} findings.`);

            // Check if findings have descriptions from DB
            const sampleFinding = findings[0];
            if (sampleFinding.description && sampleFinding.ruleId) {
                console.log(`✅ Meaningful Data Check: RuleID "${sampleFinding.ruleId}" mapped to "${sampleFinding.description}"`);
            } else {
                console.warn('⚠️ Findings generated but might be missing DB details?');
            }
        } else {
            console.warn('⚠️ No findings generated. This might be due to OpenAI response or empty DB rules.');
        }

    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        // Cleanup
        if (fs.existsSync(tempImagePath)) {
            fs.unlinkSync(tempImagePath);
            console.log('🧹 Cleaned up temp image.');
        }
    }
}

verify();
