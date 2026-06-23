/**
 * POST /api/agents/briefing-assistant/stream
 *
 * Server-Sent Events variant of the briefing assistant. Streams the agent's live
 * trace (KG reads, analysis/inference steps, token usage) as it works, then a
 * final `done` event carrying the full recommendation. The non-streaming JSON
 * route at the parent path remains as a fallback — both share `adviseOnBrief`.
 */

import { adviseOnBrief, BriefInput, AgentEvent } from '@/lib/agents/briefing-assistant';

export const maxDuration = 60; // OpenAI calls can run up to ~30s
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const body = (await request.json()) as Partial<BriefInput>;

    // Same light validation as the JSON route — fail fast before streaming.
    const missing =
        !body.title || !body.summary
            ? 'title and summary are required'
            : !Array.isArray(body.market_ids) || body.market_ids.length === 0
              ? 'at least one market_id is required'
              : !Array.isArray(body.channel_ids) || body.channel_ids.length === 0
                ? 'at least one channel_id is required'
                : !body.start_date
                  ? 'start_date is required'
                  : null;
    if (missing) {
        return new Response(JSON.stringify({ error: missing }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const send = (e: AgentEvent) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
            };
            try {
                const recommendation = await adviseOnBrief(body as BriefInput, send);
                send({ type: 'done', recommendation });
            } catch (err: any) {
                console.error('Briefing Assistant (stream) error:', err);
                send({ type: 'error', message: err?.message || 'Briefing Assistant failed' });
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            // Disable proxy buffering so events flush immediately.
            'X-Accel-Buffering': 'no',
        },
    });
}
