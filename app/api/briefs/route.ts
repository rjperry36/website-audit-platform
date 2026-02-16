import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, markets, startDate, endDate, objectives, channelTypes, tags } = body;

        // Validation
        if (!title || !markets || !startDate || !channelTypes) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Determine Status
        const status = endDate ? 'planned' : 'planning';

        // Use a generated ID for consistency
        const briefId = `brief_${Date.now()}`;

        // 1. Insert Brief
        const { error: briefError } = await supabase
            .from('briefs')
            .insert({
                id: briefId,
                title,
                markets,
                channel_types: channelTypes,
                start_date: startDate,
                end_date: endDate || null,
                status,
                tags: tags || []
            });

        if (briefError) {
            console.error('Supabase Brief Error:', briefError);
            return NextResponse.json({ error: briefError.message }, { status: 500 });
        }

        // 2. Insert Objectives
        if (objectives && objectives.length > 0) {
            const objectivesData = objectives.map((obj: any) => ({
                id: obj.id || `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                brief_id: briefId,
                objective: obj.objective,
                kpi: obj.kpi,
                target: obj.target
            }));

            const { error: objError } = await supabase
                .from('brief_objectives')
                .insert(objectivesData);

            if (objError) {
                console.error('Supabase Objective Error:', objError);
                // Note: Brief was created but objectives failed. 
                // In production, we might want a transaction or cleanup.
                return NextResponse.json({ error: 'Brief created but objectives failed: ' + objError.message }, { status: 500 });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Brief created successfully',
            brief: { id: briefId, title, status }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating brief:', error);
        return NextResponse.json(
            { error: 'Failed to create brief' },
            { status: 500 }
        );
    }
}
