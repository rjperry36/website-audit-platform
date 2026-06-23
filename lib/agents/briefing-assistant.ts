/**
 * Briefing Assistant — KG-grounded recommendation engine
 *
 * Takes a new brief input, retrieves grounded context from the knowledge graph,
 * and asks GPT-4o for a structured recommendation: budget range, suggested team,
 * timeline, and risks. Every recommendation is citable back to specific KG nodes.
 *
 * Server-side only. Reads .env.local for OPENAI_API_KEY.
 */

import OpenAI from 'openai';
import {
    getCampaigns,
    getExecutionsEnriched,
    getApprovalSteps,
    getTimeTracking,
    getPeopleEnriched,
    getMarkets,
    getChannels,
    getCostLines,
    getMediaSpend,
    getRoles,
    getDepartments,
    getAvailability,
    formatCurrency,
    computeAvailablePctInWindow,
} from '@/lib/kg/loader';

// ===========================================================================
// Public types
// ===========================================================================

export interface BriefInput {
    /** Short identifier for the brief (e.g., "SPF Winter Launch DE") */
    title: string;
    /** KG market IDs, e.g., ['market:DE', 'market:FR'] */
    market_ids: string[];
    /** KG channel IDs, e.g., ['channel:PAID_MEDIA', 'channel:SOCIAL_MEDIA'] */
    channel_ids: string[];
    /** Planned start (ISO date) */
    start_date: string;
    /** Optional duration hint */
    duration_weeks?: number;
    /** Optional budget hint in GBP */
    budget_hint_gbp?: number;
    /** Free-text description of the brief */
    summary: string;
    /** Free-text objectives or KG objective IDs */
    objectives?: string[];
    /** Free-text constraints / notes */
    notes?: string;
}

export interface BudgetComposition {
    /** Total spend (labour + production + localisation + media) across comparable campaigns */
    total_gbp: number;
    labour_gbp: number;
    production_gbp: number;
    localisation_gbp: number;
    media_gbp: number;
    labour_pct: number;
    production_pct: number;
    localisation_pct: number;
    media_pct: number;
    /** Labour split by agency department/discipline */
    by_department: Array<{ department: string; gbp: number; pct: number }>;
    /** How many cost-line records this is built from */
    cost_line_samples: number;
}

export interface CitedCampaign {
    id: string;
    name: string;
    planned_gbp: number;
    actual_gbp: number;
    variance_pct: number;
}

export interface SuggestedPerson {
    person_id: string;
    person_name: string;
    role_name: string;
    proposed_role_on_brief: string;
    seniority: string;
    daily_rate_gbp: number;
    rationale: string;
    /** 0–100 — match score the agent assigned */
    match_score: number;
    /** Specific evidence — skills + channel/category years that justify the pick */
    evidence: string[];
}

export interface Risk {
    severity: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    /** Specific KG signals that triggered this risk */
    cited_signals: string[];
}

export interface BriefRecommendation {
    /** Budget range and rationale */
    budget: {
        recommended_low_gbp: number;
        recommended_high_gbp: number;
        rationale: string;
        cited_campaigns: CitedCampaign[];
        /** How comparable spend actually broke down — derived from cost lines + media spend */
        composition: BudgetComposition;
    };
    /** Timeline + approval buffers */
    timeline: {
        recommended_weeks: number;
        internal_review_days_avg: number;
        client_review_days_avg: number;
        rationale: string;
    };
    /** Proposed team — 3-6 people */
    team: SuggestedPerson[];
    /** Top risks the agent identified */
    risks: Risk[];
    /** Past campaigns the agent considered most similar */
    comparable_campaigns: Array<{
        id: string;
        name: string;
        why_comparable: string;
    }>;
    /** Free-text headline summary, 2–3 sentences */
    summary: string;
    /** How well-grounded the recommendation is — derived from retrieval coverage */
    confidence: {
        /** 0–100 overall grounding confidence */
        overall: number;
        label: 'high' | 'medium' | 'low';
        /** Human-readable one-liner explaining what the score is based on */
        basis: string;
        /** The raw evidence counts the score is derived from */
        signals: {
            similar_campaigns: number;
            approval_samples: number;
            candidate_people: number;
            budget_samples: number;
            cost_line_samples: number;
        };
        /** Per-section confidence 0–100 */
        budget: number;
        timeline: number;
        /** Average of the model's per-person match scores (model inference) */
        team_match_avg: number;
    };
    /** Diagnostics — context size sent, latency, model, token usage */
    meta: {
        model: string;
        latency_ms: number;
        context_campaigns: number;
        context_people: number;
        context_approvals: number;
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// ===========================================================================
// Live agent trace — events streamed to the UI as the agent works
// ===========================================================================

export type AgentEvent =
    | {
          type: 'step';
          /** 'retrieve' | 'analyse' | 'reason' */
          phase: 'retrieve' | 'analyse' | 'reason';
          /** stable id so the client can upgrade an 'active' step to 'done' */
          id: string;
          label: string;
          detail?: string;
          status: 'active' | 'done';
          /** real record count, where applicable */
          count?: number;
          /** elapsed ms for this step, where applicable */
          ms?: number;
      }
    | { type: 'tokens'; prompt?: number; completion?: number; total?: number; estimated?: boolean }
    | { type: 'done'; recommendation: BriefRecommendation }
    | { type: 'error'; message: string };

type EmitFn = (e: AgentEvent) => void;

/** Rough token estimate (~4 chars/token) for pre-call display + live counter. */
function estimateTokens(text: string): number {
    return Math.max(1, Math.round(text.length / 4));
}

// ===========================================================================
// OpenAI client (lazy)
// ===========================================================================

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
    if (!openaiClient) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
        openaiClient = new OpenAI({ apiKey });
    }
    return openaiClient;
}

// ===========================================================================
// Public entry point
// ===========================================================================

export async function adviseOnBrief(
    input: BriefInput,
    onEvent?: EmitFn,
): Promise<BriefRecommendation> {
    const t0 = Date.now();

    // 1. Retrieve a relevant slice of the KG
    const context = await buildContext(input, onEvent);

    // 2. Build the prompt
    const { systemPrompt, userPrompt } = buildPrompts(input, context);
    const promptTokensEst = estimateTokens(systemPrompt + userPrompt);
    onEvent?.({
        type: 'step',
        phase: 'reason',
        id: 'prompt',
        label: 'Composed reasoning prompt',
        detail: `~${promptTokensEst.toLocaleString()} tokens of grounded context`,
        status: 'done',
        count: promptTokensEst,
    });
    onEvent?.({ type: 'tokens', prompt: promptTokensEst, estimated: true });

    // 3. Call GPT-4o (streaming, so we can surface live token usage)
    const openai = getOpenAI();
    onEvent?.({
        type: 'step',
        phase: 'reason',
        id: 'model',
        label: 'Reasoning with gpt-4o',
        detail: 'generating recommendation…',
        status: 'active',
    });
    const tModel = Date.now();
    const stream = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.2,
        max_tokens: 2400,
        response_format: { type: 'json_object' },
        stream: true,
        stream_options: { include_usage: true },
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
    });

    let raw = '';
    let completionEst = 0;
    let usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null = null;
    for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
            raw += delta;
            completionEst += estimateTokens(delta);
            onEvent?.({ type: 'tokens', prompt: promptTokensEst, completion: completionEst, estimated: true });
        }
        if (chunk.usage) {
            usage = {
                prompt_tokens: chunk.usage.prompt_tokens,
                completion_tokens: chunk.usage.completion_tokens,
                total_tokens: chunk.usage.total_tokens,
            };
        }
    }
    // Exact usage from the API supersedes our running estimate
    if (usage) {
        onEvent?.({
            type: 'tokens',
            prompt: usage.prompt_tokens,
            completion: usage.completion_tokens,
            total: usage.total_tokens,
            estimated: false,
        });
    }
    onEvent?.({
        type: 'step',
        phase: 'reason',
        id: 'model',
        label: 'Reasoning complete',
        detail: usage ? `${usage.total_tokens.toLocaleString()} tokens used` : undefined,
        status: 'done',
        ms: Date.now() - tModel,
    });

    if (!raw) throw new Error('Briefing Assistant: empty response from model');

    let parsed: any;
    try {
        parsed = JSON.parse(raw);
    } catch (e) {
        throw new Error(`Briefing Assistant: model returned invalid JSON. Raw: ${raw.slice(0, 400)}`);
    }
    onEvent?.({
        type: 'step',
        phase: 'reason',
        id: 'parse',
        label: 'Validated structured recommendation',
        detail: 'budget · timeline · team · risks',
        status: 'done',
    });

    // 4. Validate + assemble final shape
    // Budget sanity check — guard against model serialising 1.2 instead of 1200000
    // for £1.2M. Any budget < £1000 is almost certainly a format slip.
    const rawLow = num(parsed?.budget?.recommended_low_gbp, NaN);
    const rawHigh = num(parsed?.budget?.recommended_high_gbp, NaN);
    const budgetSane = Number.isFinite(rawLow) && Number.isFinite(rawHigh) && rawLow >= 1000 && rawHigh >= 1000;
    // If the model wrote "1.2" meaning £1.2M, try to repair by multiplying.
    // Common slips: values 0.5–50 likely mean "in millions"; 50–1000 likely "in thousands".
    let repairedLow = rawLow;
    let repairedHigh = rawHigh;
    if (!budgetSane && Number.isFinite(rawLow) && Number.isFinite(rawHigh)) {
        if (rawLow > 0 && rawLow < 50 && rawHigh > 0 && rawHigh < 50) {
            repairedLow = rawLow * 1_000_000;
            repairedHigh = rawHigh * 1_000_000;
        } else if (rawLow >= 50 && rawLow < 1000 && rawHigh >= 50 && rawHigh < 1000) {
            repairedLow = rawLow * 1_000;
            repairedHigh = rawHigh * 1_000;
        } else {
            // Fall back to context-derived defaults
            repairedLow = context.budgetStats.p25 || (input.budget_hint_gbp || 50000);
            repairedHigh = context.budgetStats.p75 || (input.budget_hint_gbp ? input.budget_hint_gbp * 1.2 : 100000);
        }
    }

    const team: SuggestedPerson[] = arr(parsed?.team)
        .map((m: any) => {
            const person = context.candidatePeople.find((p) => p.id === m?.person_id);
            return {
                person_id: str(m?.person_id, ''),
                person_name: str(m?.person_name, person?.properties.name || ''),
                role_name: person?.role_name || str(m?.role_name, ''),
                proposed_role_on_brief: str(m?.proposed_role_on_brief, ''),
                seniority: str(person?.properties.seniority || m?.seniority, ''),
                daily_rate_gbp: num(person?.properties.daily_rate_gbp || m?.daily_rate_gbp, 0),
                rationale: str(m?.rationale, ''),
                match_score: clamp(num(m?.match_score, 70), 0, 100),
                evidence: arr(m?.evidence).map((e: any) => str(e, '')),
            };
        })
        .filter((m: SuggestedPerson) => !!m.person_id)
        .slice(0, 6);

    const confidence = computeConfidence(context, team);
    onEvent?.({
        type: 'step',
        phase: 'analyse',
        id: 'confidence',
        label: `Grounding confidence: ${confidence.label.toUpperCase()} (${confidence.overall})`,
        detail: confidence.basis,
        status: 'done',
        count: confidence.overall,
    });

    const recommendation: BriefRecommendation = {
        budget: {
            recommended_low_gbp: Math.round(repairedLow),
            recommended_high_gbp: Math.round(repairedHigh),
            rationale: str(parsed?.budget?.rationale, 'Based on comparable historical campaigns.'),
            cited_campaigns: arr(parsed?.budget?.cited_campaigns)
                .map((c: any) => ({
                    id: str(c?.id, ''),
                    name: str(c?.name, ''),
                    planned_gbp: num(c?.planned_gbp, 0),
                    actual_gbp: num(c?.actual_gbp, 0),
                    variance_pct: num(c?.variance_pct, 0),
                }))
                .filter((c: CitedCampaign) => !!c.id),
            composition: context.costComposition,
        },
        timeline: {
            recommended_weeks: num(parsed?.timeline?.recommended_weeks, 8),
            internal_review_days_avg: num(parsed?.timeline?.internal_review_days_avg, context.approvalStats.internalAvg),
            client_review_days_avg: num(parsed?.timeline?.client_review_days_avg, context.approvalStats.clientAvg),
            rationale: str(parsed?.timeline?.rationale, ''),
        },
        team,
        risks: arr(parsed?.risks)
            .map((r: any) => ({
                severity: severity(r?.severity),
                title: str(r?.title, ''),
                description: str(r?.description, ''),
                cited_signals: arr(r?.cited_signals).map((s: any) => str(s, '')),
            }))
            .filter((r: Risk) => !!r.title)
            .slice(0, 5),
        comparable_campaigns: arr(parsed?.comparable_campaigns)
            .map((c: any) => ({
                id: str(c?.id, ''),
                name: str(c?.name, ''),
                why_comparable: str(c?.why_comparable, ''),
            }))
            .filter((c) => !!c.id)
            .slice(0, 5),
        summary: str(parsed?.summary, 'Recommendation generated from historical KG patterns.'),
        confidence,
        meta: {
            model: 'gpt-4o',
            latency_ms: Date.now() - t0,
            context_campaigns: context.similarCampaigns.length,
            context_people: context.candidatePeople.length,
            context_approvals: context.approvalStats.sampleSize,
            prompt_tokens: usage?.prompt_tokens ?? promptTokensEst,
            completion_tokens: usage?.completion_tokens ?? completionEst,
            total_tokens: usage?.total_tokens ?? promptTokensEst + completionEst,
        },
    };

    return recommendation;
}

// ===========================================================================
// Confidence — derived from how much real evidence grounded the answer
// ===========================================================================

function computeConfidence(
    context: Awaited<ReturnType<typeof buildContext>>,
    team: SuggestedPerson[],
): BriefRecommendation['confidence'] {
    const similarCampaigns = context.similarCampaigns.length;
    const approvalSamples = context.approvalStats.sampleSize;
    const candidatePeople = context.candidatePeople.length;
    const budgetSamples = context.similarCampaigns.filter((c) => c.budget_actual > 0).length;
    const costLineSamples = context.costComposition.cost_line_samples;

    // Each signal saturates at a sensible evidence threshold.
    const campaignScore = clamp((similarCampaigns / 6) * 100, 0, 100);
    const approvalScore = clamp((approvalSamples / 30) * 100, 0, 100);
    const peopleScore = clamp((candidatePeople / 8) * 100, 0, 100);

    const overall = Math.round(0.4 * campaignScore + 0.3 * approvalScore + 0.3 * peopleScore);
    const label: 'high' | 'medium' | 'low' = overall >= 70 ? 'high' : overall >= 40 ? 'medium' : 'low';

    // Per-section confidence: budget leans on comparable-campaign sample AND
    // how granular the cost-line evidence is; timeline on approval-step sample.
    const budgetCampaignScore = clamp((budgetSamples / 5) * 100, 0, 100);
    const budgetCostScore = clamp((costLineSamples / 50) * 100, 0, 100);
    const budget = Math.round(0.6 * budgetCampaignScore + 0.4 * budgetCostScore);
    const timeline = Math.round(clamp((approvalSamples / 25) * 100, 0, 100));

    const teamScores = team.map((m) => m.match_score).filter((n) => n > 0);
    const team_match_avg = teamScores.length ? Math.round(avg(teamScores)) : 0;

    const basis = `Grounded in ${similarCampaigns} comparable campaign${similarCampaigns === 1 ? '' : 's'}, ${costLineSamples.toLocaleString()} cost line${costLineSamples === 1 ? '' : 's'}, ${approvalSamples} approval step${approvalSamples === 1 ? '' : 's'}, and a ${candidatePeople}-person candidate pool.`;

    return {
        overall,
        label,
        basis,
        signals: {
            similar_campaigns: similarCampaigns,
            approval_samples: approvalSamples,
            candidate_people: candidatePeople,
            budget_samples: budgetSamples,
            cost_line_samples: costLineSamples,
        },
        budget,
        timeline,
        team_match_avg,
    };
}

// ===========================================================================
// Context retrieval — filter the KG down to what's relevant
// ===========================================================================

async function buildContext(input: BriefInput, onEvent?: EmitFn) {
    // Wrap a KG fetch so the UI sees it start and finish with a real row count.
    const track = <T>(id: string, label: string, p: Promise<T>, count: (r: T) => number): Promise<T> => {
        const t = Date.now();
        onEvent?.({ type: 'step', phase: 'retrieve', id, label: `Reading ${label}…`, status: 'active' });
        return p.then((r) => {
            const n = count(r);
            onEvent?.({
                type: 'step',
                phase: 'retrieve',
                id,
                label: `Read ${label}`,
                detail: `${n.toLocaleString()} record${n === 1 ? '' : 's'}`,
                status: 'done',
                count: n,
                ms: Date.now() - t,
            });
            return r;
        });
    };

    const len = (r: any[]) => r.length;
    const [allCampaigns, allExecutions, allApprovals, allPeople, allMarkets, allChannels, allTimeTracking, allCostLines, allMediaSpend, allRoles, allDepartments, allAvailability] = await Promise.all([
        track('campaigns', 'campaigns', getCampaigns(), len),
        track('executions', 'campaign executions', getExecutionsEnriched(), len),
        track('approvals', 'approval steps', getApprovalSteps(), len),
        track('people', 'people', getPeopleEnriched(), len),
        track('markets', 'markets', getMarkets(), len),
        track('channels', 'channels', getChannels(), len),
        track('timetracking', 'time-tracking entries', getTimeTracking(), len),
        track('costlines', 'cost lines', getCostLines(), len),
        track('mediaspend', 'media-spend rows', getMediaSpend(), len),
        track('roles', 'roles', getRoles(), len),
        track('departments', 'departments', getDepartments(), len),
        track('availability', 'availability records', getAvailability(), len),
    ]);

    const inputMarketSet = new Set(input.market_ids);
    const inputChannelSet = new Set(input.channel_ids);

    // ----- Similar campaigns -----
    // Score each campaign by how much it overlaps with the brief on (markets × channels)
    const startDate = new Date(input.start_date);
    const cutoff = new Date(startDate);
    cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 2);

    const campaignScored = allCampaigns
        .map((c) => {
            const executions = allExecutions.filter((e) => e.campaign_id === c.id);
            const campaignMarkets = new Set(executions.map((e) => e.market_id).filter(Boolean));
            const campaignChannels = new Set(executions.map((e) => e.channel_id).filter(Boolean));
            const marketOverlap = [...campaignMarkets].filter((m) => inputMarketSet.has(m as string)).length;
            const channelOverlap = [...campaignChannels].filter((ch) => inputChannelSet.has(ch as string)).length;
            const dateOk = new Date(c.properties.start_date) >= cutoff;
            const score = (marketOverlap * 3 + channelOverlap * 2) * (dateOk ? 1 : 0.5);
            return { campaign: c, executions, marketOverlap, channelOverlap, score };
        })
        .filter((c) => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

    const similarCampaigns = campaignScored.map(({ campaign, executions, marketOverlap, channelOverlap }) => ({
        id: campaign.id,
        name: campaign.properties.name,
        type: campaign.properties.campaign_type,
        start_date: campaign.properties.start_date,
        end_date: campaign.properties.end_date,
        budget_planned: campaign.properties.budget_planned,
        budget_actual: campaign.properties.budget_actual,
        variance_pct: pct(campaign.properties.budget_planned, campaign.properties.budget_actual),
        executions_count: executions.length,
        market_overlap: marketOverlap,
        channel_overlap: channelOverlap,
        summary: campaign.properties.summary,
    }));

    onEvent?.({
        type: 'step',
        phase: 'analyse',
        id: 'similar',
        label: `Ranked ${allCampaigns.length} campaigns by market × channel overlap`,
        detail: `${similarCampaigns.length} most comparable selected`,
        status: 'done',
        count: similarCampaigns.length,
    });

    // ----- Budget stats from similar campaigns -----
    const planned = similarCampaigns.map((c) => c.budget_planned).filter((n) => n > 0);
    const actual = similarCampaigns.map((c) => c.budget_actual).filter((n) => n > 0);
    const budgetStats = {
        plannedMin: Math.min(...(planned.length ? planned : [0])),
        plannedMax: Math.max(...(planned.length ? planned : [0])),
        actualMin: Math.min(...(actual.length ? actual : [0])),
        actualMax: Math.max(...(actual.length ? actual : [0])),
        plannedAvg: avg(planned),
        actualAvg: avg(actual),
        p25: percentile(actual, 25),
        p75: percentile(actual, 75),
    };

    // ----- Budget composition (where the money actually goes) -----
    // Decompose comparable-campaign spend into labour / production / localisation
    // / media using the cost-line and media-spend tables, and split labour by
    // agency department so the agent can reason about the budget *mix*, not just
    // the total.
    const similarCampaignIds = new Set(similarCampaigns.map((c) => c.id));
    const similarExecIds = new Set(
        allExecutions.filter((e) => similarCampaignIds.has(e.campaign_id || '')).map((e) => e.id),
    );
    const deptNameById = new Map(allDepartments.map((d) => [d.id, d.properties.name]));
    const roleDeptName = new Map(
        allRoles.map((r) => [r.id, deptNameById.get(r.properties.department_id) || 'Other']),
    );
    let labour = 0;
    let production = 0;
    let localisation = 0;
    const labourByDept: Record<string, number> = {};
    let costLineSamples = 0;
    for (const cl of allCostLines) {
        if (!similarExecIds.has(cl.execution_id)) continue;
        costLineSamples++;
        const amt = (parseFloat(cl.units) || 0) * (parseFloat(cl.unit_cost) || 0) * (1 + (parseFloat(cl.markup_pct) || 0));
        if (cl.line_type === 'production_cost') production += amt;
        else if (cl.line_type === 'localisation_cost') localisation += amt;
        else {
            labour += amt; // fee_time (default)
            const dept = roleDeptName.get(cl.role_id) || 'Other';
            labourByDept[dept] = (labourByDept[dept] || 0) + amt;
        }
    }
    let media = 0;
    for (const ms of allMediaSpend) {
        if (!similarExecIds.has(ms.execution_id)) continue;
        media += parseFloat(ms.actual_spend) || 0;
    }
    const compTotal = labour + production + localisation + media;
    const safePct = (n: number) => (compTotal > 0 ? Math.round((n / compTotal) * 100) : 0);
    const costComposition = {
        total_gbp: Math.round(compTotal),
        labour_gbp: Math.round(labour),
        production_gbp: Math.round(production),
        localisation_gbp: Math.round(localisation),
        media_gbp: Math.round(media),
        labour_pct: safePct(labour),
        production_pct: safePct(production),
        localisation_pct: safePct(localisation),
        media_pct: safePct(media),
        by_department: Object.entries(labourByDept)
            .map(([department, gbp]) => ({ department, gbp: Math.round(gbp), pct: safePct(gbp) }))
            .sort((a, b) => b.gbp - a.gbp)
            .slice(0, 6),
        cost_line_samples: costLineSamples,
    };

    onEvent?.({
        type: 'step',
        phase: 'analyse',
        id: 'composition',
        label: `Decomposed ${formatCurrency(costComposition.total_gbp)} of comparable spend across ${costLineSamples.toLocaleString()} cost lines`,
        detail: `labour ${costComposition.labour_pct}% · media ${costComposition.media_pct}% · production ${costComposition.production_pct}% · localisation ${costComposition.localisation_pct}%`,
        status: 'done',
        count: costLineSamples,
    });

    // ----- Approval timing patterns -----
    // Pull approval steps for executions that ran in the input markets / channels
    const targetExecutionIds = new Set(
        allExecutions
            .filter((e) =>
                inputMarketSet.has(e.market_id || '') &&
                inputChannelSet.has(e.channel_id || ''),
            )
            .map((e) => e.id),
    );
    // Find approval steps via the REQUIRES_APPROVAL graph traversal
    // Since approval_steps are already linked, we can use the enriched executions' approval_steps
    const relevantApprovals: any[] = [];
    for (const e of allExecutions) {
        if (!targetExecutionIds.has(e.id)) continue;
        for (const a of e.approval_steps) {
            if (a) relevantApprovals.push(a);
        }
    }
    const internalApprovals = relevantApprovals.filter((a: any) => a.properties.gate === 'internal_review');
    const clientApprovals = relevantApprovals.filter((a: any) => a.properties.gate === 'client_review');
    const approvalStats = {
        internalAvg: avg(internalApprovals.map((a: any) => a.properties.actual_duration_days)),
        clientAvg: avg(clientApprovals.map((a: any) => a.properties.actual_duration_days)),
        internalSlipPct: internalApprovals.length
            ? Math.round((internalApprovals.filter((a: any) => a.properties.actual_duration_days > 5).length / internalApprovals.length) * 100)
            : 0,
        clientSlipPct: clientApprovals.length
            ? Math.round((clientApprovals.filter((a: any) => a.properties.actual_duration_days > 3).length / clientApprovals.length) * 100)
            : 0,
        sampleSize: relevantApprovals.length,
    };

    onEvent?.({
        type: 'step',
        phase: 'analyse',
        id: 'approvals',
        label: `Analysed ${relevantApprovals.length} approval steps for these markets/channels`,
        detail: `internal ~${approvalStats.internalAvg}d · client ~${approvalStats.clientAvg}d avg`,
        status: 'done',
        count: relevantApprovals.length,
    });

    // ----- Candidate people -----
    // Score people by relevant channel × category experience + skills
    const targetSkillIds = channelToSkillIds(input.channel_ids);
    const candidatePeople = allPeople
        .map((p) => {
            // Channel experience match
            const channelMatch = p.channel_experience
                .filter((c) => inputChannelSet.has(c.channel_id))
                .reduce((s, c) => s + c.years, 0);
            // Beauty / skincare category experience (this is Aurelune)
            const categoryMatch = p.category_experience
                .filter((c) => c.category_id === 'category:beauty' || c.category_id === 'category:skincare')
                .reduce((s, c) => s + c.years, 0);
            // Skill match
            const skillMatch = p.skills
                .filter((s) => targetSkillIds.has(s.skill_id))
                .reduce((s, sk) => s + sk.proficiency, 0);
            // Active in market — approximate via time-tracking presence in relevant period
            // (skipped for performance — agent gets the metadata to reason about)
            const score = channelMatch * 2 + categoryMatch * 2 + skillMatch * 1.5;
            return { person: p, channelMatch, categoryMatch, skillMatch, score };
        })
        .filter((p) => p.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 15)
        .map(({ person, channelMatch, categoryMatch, skillMatch, score }) => ({
            id: person.id,
            properties: person.properties,
            department_name: person.department_name,
            role_name: person.role_name,
            top_skills: person.skills.slice(0, 5),
            channel_experience: person.channel_experience,
            category_experience: person.category_experience,
            channel_match_years: channelMatch,
            category_match_years: categoryMatch,
            skill_match_total: skillMatch,
            score,
        }));

    // ----- Overload / availability heuristic -----
    // Count overload weeks per candidate in trailing 6 months
    const trailingCutoff = new Date(startDate);
    trailingCutoff.setUTCMonth(trailingCutoff.getUTCMonth() - 6);
    const overloadCount: Record<string, number> = {};
    const personById = new Map(allPeople.map((p) => [p.id, p]));
    const hoursByPersonWeek = new Map<string, number>();
    for (const t of allTimeTracking) {
        const wk = new Date(t.week_starting);
        if (wk < trailingCutoff) continue;
        const key = `${t.person_id}|${t.week_starting}`;
        hoursByPersonWeek.set(key, (hoursByPersonWeek.get(key) || 0) + parseFloat(t.actual_hours || '0'));
    }
    for (const [key, hours] of hoursByPersonWeek) {
        const personId = key.split('|')[0];
        const p = personById.get(personId);
        if (!p) continue;
        const cap = p.properties.capacity_hours_per_week || 40;
        if (hours > cap * 1.25) overloadCount[personId] = (overloadCount[personId] || 0) + 1;
    }
    // Compute the brief window for forward-looking availability:
    // start_date through start_date + duration_weeks (default 8 weeks if unspecified).
    const briefStart = input.start_date;
    const weeksAhead = input.duration_weeks ?? 8;
    const briefEndDate = new Date(briefStart);
    briefEndDate.setUTCDate(briefEndDate.getUTCDate() + weeksAhead * 7);
    const briefEnd = briefEndDate.toISOString().split('T')[0];

    const candidatePeopleWithLoad = candidatePeople.map((p) => {
        const availability = computeAvailablePctInWindow(allAvailability, p.id, briefStart, briefEnd);
        return {
            ...p,
            recent_overload_weeks: overloadCount[p.id] || 0,
            available_pct_in_window: availability.available_pct,
            conflicting_blocks: availability.conflicting_blocks,
        };
    });

    onEvent?.({
        type: 'step',
        phase: 'analyse',
        id: 'people',
        label: `Scored ${allPeople.length} people on channel, category & skill fit`,
        detail: `${candidatePeopleWithLoad.length} candidates shortlisted with live availability`,
        status: 'done',
        count: candidatePeopleWithLoad.length,
    });

    return {
        similarCampaigns,
        budgetStats,
        costComposition,
        approvalStats,
        candidatePeople: candidatePeopleWithLoad,
        markets: allMarkets.filter((m) => inputMarketSet.has(m.id)),
        channels: allChannels.filter((c) => inputChannelSet.has(c.id)),
        brief_window: { start: briefStart, end: briefEnd },
    };
}

// ===========================================================================
// Prompt construction
// ===========================================================================

function buildPrompts(input: BriefInput, context: Awaited<ReturnType<typeof buildContext>>) {
    const systemPrompt = `You are the Briefing Assistant for Halo & Helix, an independent marketing agency.

Your job: given a new brief from the client (Aurelune, a prestige skincare brand) and grounded historical context from Halo & Helix's knowledge graph, produce a STRUCTURED RECOMMENDATION for budget, timeline, team, and risks.

GROUNDING RULES — non-negotiable:
1. Every budget number must be defensible by the CITED CAMPAIGNS you reference AND match the apparent scope of the brief.
2. Every team member you suggest MUST come from the CANDIDATE PEOPLE list in the context. Do not invent people.
3. Every risk must cite a specific historical signal (campaign id, person id, approval pattern, or date concern).
4. Match scores (0–100) reflect strength of relevant channel + category + skill match. Anchor: 90+ = clear specialist for the channel, 70–89 = strong fit, 50–69 = workable with stretch, <50 = stretch.
5. If the historical signal is weak (few comparable campaigns, thin brief), say so explicitly — confidence over confidence-theatre.

BRIEF SCOPE — read carefully before budget/team sizing:
The brief summary tells you the SCOPE. Distinguish:
- "Content piece / seasonal asset / blog series / always-on always-on tweak" → SMALL: typically £20k–£120k, 2–4 people, 4–8 weeks
- "Campaign / activation / localisation push" → MEDIUM: typically £150k–£500k, 4–6 people, 8–14 weeks
- "Hero launch / flagship / retail-partner activation / new market entry" → LARGE: typically £500k+, 6–8+ people, 14–20+ weeks

DO NOT anchor the budget on the cited campaigns' raw averages if those campaigns are larger-scoped than the brief in front of you. The cited campaigns are useful for variance patterns and timing, not necessarily for absolute amounts.

BUDGET RANGE WIDTH:
- Recommended range should be ≤30% wide (high - low) / low. Tighter is better.
- A range of £680k–£1.14M (67%) is unhelpful. Aim for something like £680k–£820k.

BUDGET NUMBER FORMAT — CRITICAL:
- recommended_low_gbp and recommended_high_gbp MUST be FULL GBP INTEGERS.
- For £1.2 million, write 1200000. NOT 1.2. NOT 1200. NOT "1.2M".
- For £85,000, write 85000.
- For £42,500, write 42500.
- Any number below 1000 is wrong by orders of magnitude. Double-check before returning.

JUDGEMENT — challenge the brief if it doesn't add up:
- If stated objectives don't fit the channel mix (e.g., "$5M sell-through" on a SEO-only content brief), call it out as a "Brief coherence" risk and recommend a clarification before scoping further.
- If the start_date looks awkward (e.g., Christmas content launching Dec 22nd, summer launch starting in November), flag it as a "Timing" risk with a concrete suggestion.
- If the budget_hint is very low or very high vs your recommended range, flag it.
- If notes mention a specific persona (Performance Pip / Ritual Rina / Science Sven / Gentle Gemma), reflect that in your headline summary AND in at least one team member's rationale (e.g., "Pari Banerjee is the right copy lead for Performance Pip's evidence-driven preferences").

TEAM SIZING — match team to scope:
- Small brief: 2–3 people (typically channel specialist + PM + maybe creative)
- Medium brief: 4–6 people (lead + strategy + creative + channel + PM)
- Large brief: 6–8 people (full bench — incl. ECD/CD for hero work)
DO NOT pad the team with directors if a brief is small — that increases day-rate burn without adding value.

TEAM COMPOSITION — channel coverage matters more than seniority count:
For MEDIUM and LARGE briefs, the team must include CHANNEL SPECIALISTS in proportion to the channels in scope:
- For each channel beyond the first, include either a dedicated specialist or a senior channel expert who covers that channel.
- A team of 4 directors with no channel specialists is WRONG for a 5-channel hero brief. Better: 1 senior lead (ECD or Strat Director) + 1 PM + 3-4 channel specialists who actually execute.
- Look at the CANDIDATE PEOPLE list — the Channel Experts department has Channel Leads and Specialists. Use them for channel-heavy briefs.
- Don't double up on directors when you could pair one director with two specialists.

RISK SUFFICIENCY:
- Large/hero briefs almost always have at least 2 risks: schedule + capacity (top candidates' recent_overload_weeks), plus possibly budget vs hint, partner-specific risk, or thin signal.
- If the top candidates have 5+ recent_overload_weeks each, capacity is automatically a MEDIUM or HIGH risk.

AVAILABILITY — non-negotiable filtering rule:
Every candidate person has an AVAILABLE IN BRIEF WINDOW: X% value. Treat this as the dominant practical signal.

- Available < 30% in the brief window: DO NOT propose this person, even if their match score is excellent. Pick a substitute and reflect this in the headline summary as "first-choice X is unavailable; using Y instead".
- Available 30–69%: only acceptable if they're for a part-time / supporting role on the brief. In rationale, surface the constraint explicitly: "Maya is 40% available — proposed for strategic oversight only, not day-to-day delivery."
- Available 70–100%: acceptable for any role.

SUBSTITUTION NARRATIVE — this is the single most valuable signal you can surface:

When a top-match candidate (would have been ≥80% match if available) is blocked in the window, you SHOULD do this:

1. Name them explicitly in the headline summary: "Maya Chen is the obvious strategic lead but she's 40% allocated to Sephora Y2 through November — Wen Liu steps in as lead strategist instead."
2. Include the named substitute (Wen Liu) in the team array with proposed_role_on_brief reflecting that they're filling the gap.
3. In the substitute's rationale, briefly acknowledge the role they're stepping into.

Vague phrasing like "alternative team members have been proposed" is acceptable as a fallback only when NO good substitution story exists. If there's a credible named substitute available, USE THEIR NAME.

The brand director needs to see _"we wanted Maya, she's not available, here's Wen Liu instead and why she works."_ That sentence is the moment that proves the agent is doing real work.

HARD CONSTRAINT — Never reference a person in the summary who isn't in the team array. If you can't find a clean substitute in the candidate list, use vague phrasing instead. But always prefer the named version when possible.

TEAM SIZE — bias toward more, not fewer:
For LARGE / hero briefs (£500k+ or multi-channel with retail activation / events), the team MUST be at least 6 people. Coverage matters: one senior lead, project management, AND specialists for each major channel block. If you can't find a 100%-available specialist for a channel, include a partially-available one and flag the constraint in their rationale. Do not shrink the team to avoid partial-availability picks.

For MEDIUM briefs, 4-6 people. For SMALL briefs (content piece, single-channel always-on tweak), 2-3 people.

If 3+ of your team picks have availability < 70%, add a HIGH "Capacity overcommitment" risk citing the specific blocks (e.g. "Devon Ahmadi: parental leave Sep–Nov; Rachel Cohen: 60% on Sephora Y2 through Dec").

When a person has a partial allocation block (e.g., 60% on another campaign), reflect that in their proposed_role_on_brief — they're realistically a part-time contributor, not a primary lead.

Availability evidence — the FIRST item in the evidence array for each team member MUST be their availability formatted as "NN% available in window" (e.g. "85% available in window"). This drives the chip surfacing in the UI.

OUTPUT FORMAT — return STRICT JSON with this exact shape:

{
  "summary": "2–3 sentence headline. Name the brief scope plainly (e.g. 'a focused SEO content piece for DE', 'a hero global launch'). Reflect any persona note from the brief. A brand director should be able to read this in 10 seconds and know the shape of the recommendation.",
  "budget": {
    "recommended_low_gbp": number,
    "recommended_high_gbp": number,
    "rationale": "1–2 sentences. Reference the brief's apparent scope FIRST, then the cited campaigns for variance/timing patterns.",
    "cited_campaigns": [
      { "id": "campaign:...", "name": "...", "planned_gbp": number, "actual_gbp": number, "variance_pct": number }
    ]
  },
  "timeline": {
    "recommended_weeks": number,
    "internal_review_days_avg": number,
    "client_review_days_avg": number,
    "rationale": "1–2 sentences. Reference scope + approval patterns + any timing concerns."
  },
  "team": [
    {
      "person_id": "person:...",
      "person_name": "Maya Chen",
      "role_name": "Strategy Director",
      "proposed_role_on_brief": "Lead strategist",
      "seniority": "director",
      "daily_rate_gbp": 1380,
      "rationale": "Why this person — be specific. 1–2 sentences citing concrete skills + experience + (if relevant) persona alignment.",
      "match_score": 87,
      "evidence": ["85% available in window", "7 years on SOCIAL_MEDIA", "9 years on category:beauty", "proficiency 5 on positioning"]
    }
  ],
  "risks": [
    {
      "severity": "low" | "medium" | "high",
      "title": "Short title",
      "description": "1–2 sentences with a concrete next step or mitigation.",
      "cited_signals": ["campaign:...", "person:...", "date:2026-12-22"]
    }
  ],
  "comparable_campaigns": [
    { "id": "campaign:...", "name": "...", "why_comparable": "1 sentence — be specific about what makes it comparable (market overlap, channel overlap, brief shape)." }
  ]
}

RISK CHECKLIST — flag any of these that apply, in priority order:
1. Brief coherence — stated objectives don't fit the proposed channel mix or scope
2. Timing — start date awkward for the brief (seasonal mismatch, too late, too early)
3. Budget mismatch — recommended range differs significantly from budget_hint
4. Schedule — approval timing pattern in this market is historically slow
5. Capacity — top candidates have high recent_overload_weeks
6. Thin historical signal — < 3 truly comparable past campaigns

If there are no meaningful risks, return an empty risks array. Don't manufacture risks.`;

    const userPrompt = `BRIEF
=====
Title: ${input.title}
Summary: ${input.summary}
Markets: ${input.market_ids.join(', ')} (${context.markets.map((m) => m.properties.label).join(', ')})
Channels: ${input.channel_ids.join(', ')} (${context.channels.map((c) => c.properties.label).join(', ')})
Start date: ${input.start_date}
Duration hint: ${input.duration_weeks ? `${input.duration_weeks} weeks` : 'unspecified'}
Budget hint: ${input.budget_hint_gbp ? formatCurrency(input.budget_hint_gbp) : 'unspecified'}
Objectives: ${(input.objectives || []).join('; ') || 'unspecified'}
Notes: ${input.notes || '—'}

HISTORICAL CONTEXT (from Halo & Helix knowledge graph)
======================================================

Similar past campaigns (ranked by market × channel overlap with this brief):
${context.similarCampaigns.length === 0 ? 'NONE — no strong historical analogues for this combination.' :
        context.similarCampaigns.map((c, i) => `${i + 1}. ${c.id}
   Name: ${c.name}
   Type: ${c.type}  Dates: ${c.start_date} → ${c.end_date}
   Budget: planned ${formatCurrency(c.budget_planned)} → actual ${formatCurrency(c.budget_actual)} (variance ${c.variance_pct > 0 ? '+' : ''}${c.variance_pct}%)
   Executions: ${c.executions_count}, overlap: ${c.market_overlap} mkts × ${c.channel_overlap} channels
   Summary: ${c.summary || '—'}`).join('\n\n')}

Budget benchmarks across the similar campaigns above:
   Planned range: ${formatCurrency(context.budgetStats.plannedMin)} – ${formatCurrency(context.budgetStats.plannedMax)} (avg ${formatCurrency(context.budgetStats.plannedAvg)})
   Actual range:  ${formatCurrency(context.budgetStats.actualMin)} – ${formatCurrency(context.budgetStats.actualMax)} (avg ${formatCurrency(context.budgetStats.actualAvg)})
   Actual P25/P75: ${formatCurrency(context.budgetStats.p25)} – ${formatCurrency(context.budgetStats.p75)}

Budget COMPOSITION across these comparable campaigns (from ${context.costComposition.cost_line_samples.toLocaleString()} cost lines + media spend) — where the money actually went:
   Labour (fee time): ${context.costComposition.labour_pct}% (${formatCurrency(context.costComposition.labour_gbp)})
   Media spend:       ${context.costComposition.media_pct}% (${formatCurrency(context.costComposition.media_gbp)})
   Production:        ${context.costComposition.production_pct}% (${formatCurrency(context.costComposition.production_gbp)})
   Localisation:      ${context.costComposition.localisation_pct}% (${formatCurrency(context.costComposition.localisation_gbp)})
   Labour split by department: ${context.costComposition.by_department.map((d) => `${d.department} ${d.pct}%`).join(', ') || '—'}
   → Use this mix to sanity-check your recommended budget: a multi-channel paid brief should be media-heavy; a content/asset brief should be labour-heavy. Reference the split in your budget rationale where it informs the number.

Approval timing (for ${input.market_ids.join('+')} × ${input.channel_ids.join('+')}):
   Sample size: ${context.approvalStats.sampleSize}
   Internal review avg: ${context.approvalStats.internalAvg} days (planned 5)
   Client review avg:   ${context.approvalStats.clientAvg} days (planned 3)
   Internal slip rate:  ${context.approvalStats.internalSlipPct}% of executions slip past 5 days
   Client slip rate:    ${context.approvalStats.clientSlipPct}% of executions slip past 3 days

BRIEF WINDOW for availability checks: ${context.brief_window.start} → ${context.brief_window.end}

CANDIDATE PEOPLE (top ${context.candidatePeople.length} by relevant skill + experience):
${context.candidatePeople.map((p, i) => `${i + 1}. ${p.id}
   ${p.properties.name} — ${p.role_name}, ${p.department_name}, ${p.properties.office}
   Seniority: ${p.properties.seniority}, Daily rate: £${p.properties.daily_rate_gbp}, Capacity: ${p.properties.capacity_hours_per_week}h/wk
   Channel experience (matching): ${p.channel_match_years} years across the brief's channels
   Category experience (matching): ${p.category_match_years} years in beauty/skincare
   Top skills: ${p.top_skills.map((s) => `${s.skill_name} (${s.proficiency}/5)`).join(', ')}
   Channel experience detail: ${p.channel_experience.map((c) => `${c.channel_label}:${c.years}y`).join(', ')}
   Recent overload weeks (last 6mo): ${p.recent_overload_weeks}
   AVAILABLE IN BRIEF WINDOW: ${p.available_pct_in_window}%${p.conflicting_blocks.length > 0
            ? ' — conflicts: ' + p.conflicting_blocks.map((b: any) => `${b.reason} ${b.start}→${b.end} (${b.allocation_pct}%)`).join('; ')
            : ' — fully available'}`).join('\n\n')}

Now produce the JSON recommendation following the system prompt. Stay grounded in the data above.`;

    return { systemPrompt, userPrompt };
}

// ===========================================================================
// Skill mapping for channels — used to weight candidate people
// ===========================================================================

function channelToSkillIds(channelIds: string[]): Set<string> {
    const map: Record<string, string[]> = {
        'channel:PAID_MEDIA': ['skill:paid-search', 'skill:paid-social', 'skill:programmatic', 'skill:attribution', 'skill:analytics'],
        'channel:SOCIAL_MEDIA': ['skill:social-organic', 'skill:influencer', 'skill:concept-development', 'skill:copywriting-short-form'],
        'channel:SEO': ['skill:seo-traditional', 'skill:seo-aeo-geo', 'skill:content-strategy', 'skill:copywriting-long-form'],
        'channel:ECRM': ['skill:ecrm-architecture', 'skill:ecrm-copy', 'skill:analytics'],
        'channel:D2C': ['skill:experimentation', 'skill:analytics', 'skill:attribution'],
        'channel:UX': ['skill:experimentation', 'skill:analytics'],
        'channel:OOH': ['skill:ooh-planning', 'skill:art-direction', 'skill:print-production', 'skill:copywriting-short-form'],
        'channel:POSM': ['skill:posm-execution', 'skill:print-production', 'skill:art-direction'],
        'channel:EVENT': ['skill:events-production', 'skill:project-management'],
        'channel:RESEARCH': ['skill:audience-strategy', 'skill:analytics'],
        'channel:B2B': ['skill:negotiation', 'skill:brand-strategy'],
        'channel:B2B2C': ['skill:negotiation', 'skill:brand-strategy', 'skill:print-production'],
    };
    const out = new Set<string>();
    for (const ch of channelIds) {
        for (const s of map[ch] || []) out.add(s);
    }
    // Always include foundational skills
    out.add('skill:campaign-strategy');
    out.add('skill:project-management');
    return out;
}

// ===========================================================================
// Tiny utility helpers
// ===========================================================================

function str(v: any, dflt: string): string {
    return typeof v === 'string' ? v : dflt;
}
function num(v: any, dflt: number): number {
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : dflt;
}
function arr(v: any): any[] {
    return Array.isArray(v) ? v : [];
}
function severity(v: any): 'low' | 'medium' | 'high' {
    if (v === 'high' || v === 'medium' || v === 'low') return v;
    return 'medium';
}
function clamp(n: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, n));
}
function avg(arr: number[]): number {
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((s, n) => s + n, 0) / arr.length);
}
function pct(planned: number, actual: number): number {
    if (!planned) return 0;
    return Math.round(((actual - planned) / planned) * 100);
}
function percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.floor((p / 100) * (sorted.length - 1));
    return sorted[idx];
}
