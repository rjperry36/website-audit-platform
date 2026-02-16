
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role to bypass policies if any

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBriefs() {
    const { data, error } = await supabase.from('briefs').select('*');
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Briefs in DB:', data && data.length);
    if (data) {
        data.forEach(b => console.log(`- ${b.title} (Markets: ${b.markets}, Status: ${b.status})`));
    }
}

checkBriefs();
