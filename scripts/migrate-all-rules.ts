
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

async function migrate() {
    console.log('🚀 Starting Full Rules Migration...');

    // Dynamic import for supabase
    const { supabase } = await import('../lib/supabase');

    // Read ux.json
    const uxJsonPath = path.join(process.cwd(), 'lib/config/rules/ux.json');
    const uxJsonRaw = fs.readFileSync(uxJsonPath, 'utf-8');
    const uxRules = JSON.parse(uxJsonRaw);

    const rulesToInsert = [];

    // Parse ux.json structure: { category: { ruleId: ruleObj } }
    for (const [category, rulesMap] of Object.entries(uxRules)) {
        for (const [ruleId, ruleObj] of Object.entries(rulesMap as any)) {
            const rule = ruleObj as any;

            rulesToInsert.push({
                id: rule.id,
                category: category,
                rule_name: rule.name,
                description: rule.description,
                priority_level: rule.level,
                impact: rule.impact,
                recommendation: rule.recommendation,
                thresholds: rule.thresholds ? rule.thresholds : null,
                is_active: true
            });
        }
    }

    console.log(`📦 Found ${rulesToInsert.length} rules to migrate.`);

    // Upsert into DB
    const { error } = await supabase
        .from('ai_rules')
        .upsert(rulesToInsert, { onConflict: 'id' });

    if (error) {
        console.error('❌ Migration failed:', error);
    } else {
        console.log('✅ Migration successful! All rules are now in the DB.');
    }
}

migrate();
