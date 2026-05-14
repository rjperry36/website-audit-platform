/**
 * POST /api/agents/briefing-assistant
 *
 * Takes a brief input, returns a KG-grounded recommendation.
 * The server action could call adviseOnBrief() directly, but exposing it via an
 * API route makes the agent easier to invoke from client components and easier
 * to swap with a streaming version later.
 */

import { NextResponse } from 'next/server';
import { adviseOnBrief, BriefInput } from '@/lib/agents/briefing-assistant';

export const maxDuration = 60; // OpenAI calls can run up to ~30s

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Partial<BriefInput>;

        // Light validation — agent will be more lenient with empty optionals
        if (!body.title || !body.summary) {
            return NextResponse.json(
                { error: 'title and summary are required' },
                { status: 400 },
            );
        }
        if (!Array.isArray(body.market_ids) || body.market_ids.length === 0) {
            return NextResponse.json(
                { error: 'at least one market_id is required' },
                { status: 400 },
            );
        }
        if (!Array.isArray(body.channel_ids) || body.channel_ids.length === 0) {
            return NextResponse.json(
                { error: 'at least one channel_id is required' },
                { status: 400 },
            );
        }
        if (!body.start_date) {
            return NextResponse.json({ error: 'start_date is required' }, { status: 400 });
        }

        const recommendation = await adviseOnBrief(body as BriefInput);
        return NextResponse.json({ recommendation });
    } catch (err: any) {
        console.error('Briefing Assistant error:', err);
        return NextResponse.json(
            { error: err?.message || 'Briefing Assistant failed', stack: err?.stack },
            { status: 500 },
        );
    }
}
