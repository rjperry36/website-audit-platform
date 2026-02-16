
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

// Create Supabase client with Service Role Key for Admin access (bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
    console.log('🌱 Starting database seed...');

    // 1. Load Data
    const projectsPath = path.join(process.cwd(), 'lib/projects.json');
    const briefsPath = path.join(process.cwd(), 'lib/briefs.json');

    let projects = [];
    let briefs = [];

    try {
        if (fs.existsSync(projectsPath)) {
            projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));
            console.log(`Loaded ${projects.length} projects from JSON.`);
        }
        if (fs.existsSync(briefsPath)) {
            briefs = JSON.parse(fs.readFileSync(briefsPath, 'utf-8'));
            console.log(`Loaded ${briefs.length} briefs from JSON.`);
        }
    } catch (error) {
        console.error('Error reading JSON files:', error);
        return;
    }

    // 2. Clear existing data (Optional: for development retry)
    // Be careful in production!
    // await supabase.from('brief_objectives').delete().neq('id', '0');
    // await supabase.from('briefs').delete().neq('id', '0');
    // await supabase.from('initiatives').delete().neq('id', '0');
    // await supabase.from('projects').delete().neq('id', '0');

    // 3. Insert Projects & Initiatives
    for (const project of projects) {
        // Insert Project
        const { error: pError } = await supabase.from('projects').upsert({
            id: project.id,
            title: project.title,
            description: project.description,
            owner: project.owner,
            tags: project.tags,
            status: 'active'
        }, { onConflict: 'id' });

        if (pError) console.error(`Error inserting project ${project.id}:`, pError);
        else console.log(`Inserted project: ${project.title}`);

        // Insert Initiatives
        if (project.initiatives && project.initiatives.length > 0) {
            const initiatives = project.initiatives.map((init: any, idx: number) => ({
                id: `${project.id}-${idx}`, // Generate ID if not present
                project_id: project.id, // Foreign key
                title: init.title,
                channel_id: init.channelId,
                start_week: init.startWeek,
                duration_weeks: init.duration,
                status: 'planned'
            }));

            const { error: iError } = await supabase.from('initiatives').upsert(initiatives, { onConflict: 'id' });
            if (iError) console.error(`Error inserting initiatives for ${project.id}:`, iError);
        }
    }

    // 4. Insert Briefs & Objectives
    for (const brief of briefs) {
        const { error: bError } = await supabase.from('briefs').upsert({
            id: brief.id,
            title: brief.title,
            markets: brief.markets,
            channel_types: brief.channelTypes,
            start_date: brief.startDate, // Ensure format matches, JSON usually ISO string or YYYY-MM-DD
            end_date: brief.endDate || null,
            status: brief.status || 'planning',
            tags: brief.tags
        }, { onConflict: 'id' });

        if (bError) console.error(`Error inserting brief ${brief.id}:`, bError);
        else console.log(`Inserted brief: ${brief.title}`);

        if (brief.objectives && brief.objectives.length > 0) {
            const objectives = brief.objectives.map((obj: any) => ({
                id: obj.id,
                brief_id: brief.id,
                objective: obj.objective,
                kpi: obj.kpi,
                target: obj.target
            }));

            const { error: oError } = await supabase.from('brief_objectives').upsert(objectives, { onConflict: 'id' });
            if (oError) console.error(`Error inserting objectives for ${brief.id}:`, oError);
        }
    }

    console.log('✅ Seeding complete!');
}

seed().catch(console.error);
