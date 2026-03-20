
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verifyRules() {
    console.log('🔍 Checking ai_rules table...');

    // Dynamic import to ensure env vars are loaded
    const { supabase } = await import('../lib/supabase');

    const { data, error } = await supabase
        .from('ai_rules')
        .select('*');

    if (error) {
        console.error('❌ Error fetching rules:', error);
        return;
    }

    console.log(`✅ Found ${data?.length} rules in database.`);

    if (data && data.length > 0) {
        console.log('Sample Rule:', data[0]);
    } else {
        console.warn('⚠️ No rules found! Did you run the migration?');
    }
}

verifyRules();
