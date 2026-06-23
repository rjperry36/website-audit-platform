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
    getAgents,
    getAgentUsage,
    getAvailability,
    getBrands,
    getCampaignStructureEdges,
    getBrandStructureEdges,
    formatCurrency,
    computeAvailablePctInWindow,
} from '@/lib/kg/loader';

/** Which KG categories define "category experience" for each brand. */
const BRAND_CATEGORIES: Record<string, string[]> = {
    'brand:aurelune': ['category:beauty', 'category:skincare'],
    'brand:kestrel': ['category:fashion', 'category:wellness'],
};

// ===========================================================================
// Public types
// ===========================================================================

export interface BriefInput {
    /** KG brand id this brief is for, e.g. 'brand:aurelune' | 'brand:kestrel'. Defaults to Aurelune. */
    brand_id?: string;
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
    ai_gbp: number;
    labour_pct: number;
    production_pct: number;
    localisation_pct: number;
    media_pct: number;
    ai_pct: number;
    /** Labour split by agency department/discipline */
    by_department: Array<{ department: string; gbp: number; pct: number }>;
    /** How many cost-line records this is built from */
    cost_line_samples: number;
}

export interface Delivery {
    /** Expected end-to-end delivery, derived from real lead times + the relay */
    expected_weeks_low: number;
    expected_weeks_high: number;
    /** Per-channel delivery dynamics for the brief's channels */
    per_channel: Array<{
        channel: string;
        median_calendar_days: number;
        avg_slip_days: number;
        on_time_pct: number;
        median_person_days: number;
        sample: number;
    }>;
    /** The repeatable stage sequence (relay) with median duration + lead team */
    relay: Array<{ stage: string; median_days: number; dominant_department: string; sample: number }>;
    /** Can the bench cover the brief's channels, given availability in the window? */
    channel_coverage: Array<{
        channel: string;
        specialists_total: number;
        specialists_available: number;
        status: 'ok' | 'thin' | 'none';
    }>;
    /** How many executions the delivery stats are built from */
    sample_executions: number;
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
    /** 'human' (default) or 'agent' — whether this is a person or an AI agent */
    resource_type: 'human' | 'agent';
    /** Agent-only: provider + model + estimated token cost for this brief */
    provider?: string;
    model_id?: string;
    est_cost_gbp?: number;
    /** Agent-only: estimated human person-days the agent displaces, and £ of that human time */
    man_days_saved?: number;
    human_equiv_gbp?: number;
}

export interface Risk {
    severity: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    /** Concrete mitigation / next step — may propose an AI agent */
    mitigation: string;
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
    /** Delivery dynamics — lead times, the relay, and channel coverage (derived) */
    delivery: Delivery;
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
        .map((m: any): SuggestedPerson => {
            const id = str(m?.person_id, '');
            const agent = context.candidateAgents.find((a) => a.id === id);
            if (agent || m?.resource_type === 'agent') {
                const ap = agent?.properties;
                return {
                    person_id: id,
                    person_name: str(m?.person_name, ap?.name || ''),
                    role_name: ap ? `${ap.provider} · ${ap.model_id}` : str(m?.role_name, 'AI agent'),
                    proposed_role_on_brief: str(m?.proposed_role_on_brief, ''),
                    seniority: 'AI agent',
                    daily_rate_gbp: 0,
                    rationale: str(m?.rationale, ''),
                    match_score: clamp(num(m?.match_score, 70), 0, 100),
                    evidence: arr(m?.evidence).map((e: any) => str(e, '')),
                    resource_type: 'agent',
                    provider: ap?.provider,
                    model_id: ap?.model_id,
                    est_cost_gbp: num(m?.est_cost_gbp, agent?.avg_cost_per_execution_gbp || 0),
                };
            }
            const person = context.candidatePeople.find((p) => p.id === id);
            return {
                person_id: id,
                person_name: str(m?.person_name, person?.properties.name || ''),
                role_name: person?.role_name || str(m?.role_name, ''),
                proposed_role_on_brief: str(m?.proposed_role_on_brief, ''),
                seniority: str(person?.properties.seniority || m?.seniority, ''),
                daily_rate_gbp: num(person?.properties.daily_rate_gbp || m?.daily_rate_gbp, 0),
                rationale: str(m?.rationale, ''),
                match_score: clamp(num(m?.match_score, 70), 0, 100),
                evidence: arr(m?.evidence).map((e: any) => str(e, '')),
                resource_type: 'human',
            };
        })
        .filter((m: SuggestedPerson) => !!m.person_id)
        .slice(0, 8);

    // Man-days saved for each agent member — a grounded estimate of the human
    // effort displaced. Built from REAL per-channel person-days (time-tracking)
    // and a blended human day-rate, with two documented assumptions:
    //   DRAFT_DISPLACEMENT — an agent first-drafts ~half the human effort (the
    //     human still reviews/finishes), and
    //   execsCovered — the agent supports roughly one execution per fortnight.
    const DRAFT_DISPLACEMENT = 0.5;
    const execsCovered = clamp(Math.round((input.duration_weeks || 8) / 2), 1, 12);
    const blendedDailyRate = Math.round(avg(context.candidatePeople.map((p) => p.properties.daily_rate_gbp).filter((n) => n > 0))) || 800;
    const chIdToLabel = new Map(context.channels.map((c) => [c.id, c.properties.label]));
    const chLabelToDays = new Map(context.delivery.per_channel.map((c) => [c.channel, c.median_person_days]));
    const maxChannelDays = Math.max(0, ...context.delivery.per_channel.map((c) => c.median_person_days));
    for (const m of team) {
        if (m.resource_type !== 'agent') continue;
        const agent = context.candidateAgents.find((a) => a.id === m.person_id);
        let personDays = 0;
        if (agent) {
            const fit = (agent.properties.channels || [])
                .filter((c) => c.suitability >= 3 && chIdToLabel.has(c.channel_id))
                .sort((x, y) => y.suitability - x.suitability);
            for (const f of fit) {
                const d = chLabelToDays.get(chIdToLabel.get(f.channel_id) || '');
                if (d) { personDays = d; break; }
            }
        }
        if (!personDays) personDays = maxChannelDays;
        m.man_days_saved = Math.round(personDays * execsCovered * DRAFT_DISPLACEMENT);
        m.human_equiv_gbp = Math.round(m.man_days_saved * blendedDailyRate);
    }

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
        delivery: context.delivery,
        team,
        risks: arr(parsed?.risks)
            .map((r: any) => ({
                severity: severity(r?.severity),
                title: str(r?.title, ''),
                description: str(r?.description, ''),
                mitigation: str(r?.mitigation, ''),
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
    // Timeline now blends approval-gate evidence with real delivery-execution evidence.
    const approvalScoreForTimeline = clamp((approvalSamples / 25) * 100, 0, 100);
    const deliveryScoreForTimeline = clamp((context.delivery.sample_executions / 40) * 100, 0, 100);
    const timeline = Math.round(0.5 * approvalScoreForTimeline + 0.5 * deliveryScoreForTimeline);

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
    const [allCampaigns, allExecutions, allApprovals, allPeople, allMarkets, allChannels, allTimeTracking, allCostLines, allMediaSpend, allRoles, allDepartments, allAgents, allAgentUsage, allAvailability] = await Promise.all([
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
        track('agents', 'AI agents', getAgents(), len),
        track('agentusage', 'AI agent usage records', getAgentUsage(), len),
        track('availability', 'availability records', getAvailability(), len),
    ]);

    // Resolve the brand and which campaigns/executions belong to it.
    const [allBrands, campaignStructure, brandStructure] = await Promise.all([getBrands(), getCampaignStructureEdges(), getBrandStructureEdges()]);
    const brandId = input.brand_id && allBrands.some((b) => b.id === input.brand_id) ? input.brand_id : 'brand:aurelune';
    const brand = allBrands.find((b) => b.id === brandId);
    const brandName = brand?.properties.name || 'the client';
    const brandCategory = brand?.properties.category || '';
    const brandCategories = new Set(BRAND_CATEGORIES[brandId] || ['category:beauty', 'category:skincare']);
    // team -> brand (brand-structure OWNS), then campaign -> team (COMMISSIONED_BY) -> brand
    const teamToBrand = new Map<string, string>();
    for (const e of brandStructure) if (e.type === 'OWNS') teamToBrand.set(e.to, e.from);
    const campaignToBrand = new Map<string, string>();
    for (const e of campaignStructure) if (e.type === 'COMMISSIONED_BY') campaignToBrand.set(e.from, teamToBrand.get(e.to) || '');
    const isBrandCampaign = (campaignId: string | undefined) => !!campaignId && campaignToBrand.get(campaignId) === brandId;
    onEvent?.({
        type: 'step',
        phase: 'analyse',
        id: 'brand',
        label: `Scoped to ${brandName}`,
        detail: brandCategory,
        status: 'done',
    });

    const inputMarketSet = new Set(input.market_ids);
    const inputChannelSet = new Set(input.channel_ids);

    // ----- Similar campaigns -----
    // Score each campaign by how much it overlaps with the brief on (markets × channels)
    const startDate = new Date(input.start_date);
    const cutoff = new Date(startDate);
    cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 2);

    const campaignScored = allCampaigns
        .filter((c) => isBrandCampaign(c.id))
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
        label: `Ranked ${allCampaigns.filter((c) => isBrandCampaign(c.id)).length} ${brandName} campaigns by market × channel overlap`,
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
    let ai = 0;
    for (const u of allAgentUsage) {
        if (!similarExecIds.has(u.execution_id)) continue;
        ai += parseFloat(u.cost_gbp) || 0;
    }
    const compTotal = labour + production + localisation + media + ai;
    const safePct = (n: number) => (compTotal > 0 ? Math.round((n / compTotal) * 100) : 0);
    const costComposition = {
        total_gbp: Math.round(compTotal),
        labour_gbp: Math.round(labour),
        production_gbp: Math.round(production),
        localisation_gbp: Math.round(localisation),
        media_gbp: Math.round(media),
        ai_gbp: Math.round(ai),
        labour_pct: safePct(labour),
        production_pct: safePct(production),
        localisation_pct: safePct(localisation),
        media_pct: safePct(media),
        ai_pct: safePct(ai),
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
                isBrandCampaign(e.campaign_id) &&
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
            // Category experience relevant to this brand
            const categoryMatch = p.category_experience
                .filter((c) => brandCategories.has(c.category_id))
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

    // ----- Candidate AI agents (the hybrid bench) -----
    // Score agents on the same channel + skill axes as humans, and attach their
    // real historical token usage / cost from agent-usage.
    const agentUsageByAgent: Record<string, { n: number; tokens: number; cost: number }> = {};
    for (const u of allAgentUsage) {
        const a = (agentUsageByAgent[u.agent_id] = agentUsageByAgent[u.agent_id] || { n: 0, tokens: 0, cost: 0 });
        a.n++;
        a.tokens += parseInt(u.total_tokens) || 0;
        a.cost += parseFloat(u.cost_gbp) || 0;
    }
    const candidateAgents = allAgents
        .map((a) => {
            const channelFit = (a.properties.channels || [])
                .filter((c) => inputChannelSet.has(c.channel_id))
                .reduce((s, c) => s + c.suitability, 0);
            const skillFit = (a.properties.skills || [])
                .filter((s) => targetSkillIds.has(s.skill_id))
                .reduce((s, sk) => s + sk.proficiency, 0);
            const score = channelFit * 2 + skillFit;
            const hist = agentUsageByAgent[a.id] || { n: 0, tokens: 0, cost: 0 };
            return {
                id: a.id,
                properties: a.properties,
                channel_fit: channelFit,
                skill_fit: skillFit,
                score,
                hist_executions: hist.n,
                hist_total_tokens: hist.tokens,
                hist_total_cost_gbp: Math.round(hist.cost),
                avg_cost_per_execution_gbp: hist.n ? +(hist.cost / hist.n).toFixed(2) : 0,
                top_skills: (a.properties.skills || []).filter((s) => s.proficiency >= 3).sort((x, y) => y.proficiency - x.proficiency).slice(0, 5),
            };
        })
        .filter((a) => a.score > 0)
        .sort((x, y) => y.score - x.score)
        .slice(0, 6);

    onEvent?.({
        type: 'step',
        phase: 'analyse',
        id: 'agents',
        label: `Scored ${allAgents.length} AI agents on channel & skill fit`,
        detail: candidateAgents.length
            ? `top: ${candidateAgents.slice(0, 3).map((a) => a.properties.name).join(', ')}`
            : 'no agent fit for these channels',
        status: 'done',
        count: candidateAgents.length,
    });

    // ----- Delivery dynamics: lead time, the relay, and channel coverage -----
    const dayDiff = (a?: string, b?: string): number | null =>
        a && b ? Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000) : null;
    const channelLabelById = new Map(allChannels.map((c) => [c.id, c.properties.label]));

    // Effort (person-days) per execution from time-tracking.
    const hoursByExec: Record<string, number> = {};
    for (const t of allTimeTracking) {
        hoursByExec[t.execution_id] = (hoursByExec[t.execution_id] || 0) + (parseFloat(t.actual_hours) || 0);
    }

    // Per-channel delivery stats for the brief's channels.
    let deliverySample = 0;
    const deliveryPerChannel = input.channel_ids.map((chId) => {
        const execs = allExecutions.filter(
            (e) => isBrandCampaign(e.campaign_id) && e.channel_id === chId && e.properties.actual_start && e.properties.actual_end,
        );
        const cals = execs.map((e) => dayDiff(e.properties.actual_start, e.properties.actual_end)).filter((n): n is number => n != null);
        const slips = execs
            .map((e) => {
                const cal = dayDiff(e.properties.actual_start, e.properties.actual_end);
                const plan = dayDiff(e.properties.planned_start, e.properties.planned_end);
                return cal != null && plan != null ? cal - plan : null;
            })
            .filter((n): n is number => n != null);
        const pdays = execs.map((e) => (hoursByExec[e.id] || 0) / 8).filter((n) => n > 0);
        deliverySample += execs.length;
        return {
            channel: channelLabelById.get(chId) || chId,
            median_calendar_days: Math.round(percentile(cals, 50)),
            avg_slip_days: Math.round(avg(slips)),
            on_time_pct: slips.length ? Math.round((slips.filter((s) => s <= 0).length / slips.length) * 100) : 0,
            median_person_days: Math.round(percentile(pdays, 50)),
            sample: execs.length,
        };
    });

    // The relay: execution-type stage sequence with median duration + lead team.
    const STAGES: Array<{ key: string; label: string }> = [
        { key: 'global_asset_creation', label: 'Global asset creation' },
        { key: 'localisation', label: 'Localisation' },
        { key: 'local_campaign', label: 'Local campaign' },
    ];
    const stageOfExec = new Map(allExecutions.map((e) => [e.id, e.properties.execution_type]));
    const stageDeptCost: Record<string, Record<string, number>> = {};
    for (const cl of allCostLines) {
        if (cl.line_type === 'production_cost' || cl.line_type === 'localisation_cost') continue;
        const st = stageOfExec.get(cl.execution_id);
        if (!st) continue;
        const amt = (parseFloat(cl.units) || 0) * (parseFloat(cl.unit_cost) || 0) * (1 + (parseFloat(cl.markup_pct) || 0));
        const dept = roleDeptName.get(cl.role_id) || 'Other';
        (stageDeptCost[st] = stageDeptCost[st] || {})[dept] = (stageDeptCost[st][dept] || 0) + amt;
    }
    const deliveryRelay = STAGES.map(({ key, label }) => {
        const execs = allExecutions.filter((e) => isBrandCampaign(e.campaign_id) && e.properties.execution_type === key && e.properties.actual_start && e.properties.actual_end);
        const cals = execs.map((e) => dayDiff(e.properties.actual_start, e.properties.actual_end)).filter((n): n is number => n != null);
        const dominant = Object.entries(stageDeptCost[key] || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
        return { stage: label, median_days: Math.round(percentile(cals, 50)), dominant_department: dominant, sample: execs.length };
    }).filter((r) => r.sample > 0);

    // Channel coverage: bench specialists vs available-in-window specialists.
    const channelCoverage = input.channel_ids.map((chId) => {
        const specs = allPeople.filter((p) => p.channel_experience.some((ce) => ce.channel_id === chId && ce.years >= 2));
        const available = specs.filter((p) => computeAvailablePctInWindow(allAvailability, p.id, briefStart, briefEnd).available_pct >= 50).length;
        const total = specs.length;
        const status: 'ok' | 'thin' | 'none' = total === 0 ? 'none' : available <= 1 ? 'thin' : 'ok';
        return { channel: channelLabelById.get(chId) || chId, specialists_total: total, specialists_available: available, status };
    });

    // Expected end-to-end delivery from the relay (sequential), +30% for slip.
    const relayDays = deliveryRelay.reduce((s, r) => s + r.median_days, 0);
    const maxChannelDays = Math.max(0, ...deliveryPerChannel.map((c) => c.median_calendar_days));
    const baseDays = relayDays > 0 ? relayDays : maxChannelDays;
    const delivery = {
        expected_weeks_low: Math.max(1, Math.round(baseDays / 7)),
        expected_weeks_high: Math.max(2, Math.round((baseDays * 1.3) / 7)),
        per_channel: deliveryPerChannel,
        relay: deliveryRelay,
        channel_coverage: channelCoverage,
        sample_executions: deliverySample,
    };

    const thinChannels = channelCoverage.filter((c) => c.status !== 'ok');
    onEvent?.({
        type: 'step',
        phase: 'analyse',
        id: 'delivery',
        label: `Measured delivery across ${deliverySample.toLocaleString()} past executions in these channels`,
        detail: `expected ~${delivery.expected_weeks_low}–${delivery.expected_weeks_high} wks end-to-end`,
        status: 'done',
        count: deliverySample,
    });
    onEvent?.({
        type: 'step',
        phase: 'analyse',
        id: 'relay',
        label: `Reconstructed the delivery relay (${deliveryRelay.length} stages)`,
        detail: deliveryRelay.map((r) => `${r.stage} ~${r.median_days}d`).join(' → ') || '—',
        status: 'done',
    });
    onEvent?.({
        type: 'step',
        phase: 'analyse',
        id: 'coverage',
        label: `Checked channel coverage vs the bench`,
        detail: thinChannels.length
            ? `thin/none: ${thinChannels.map((c) => `${c.channel} (${c.specialists_available}/${c.specialists_total})`).join(', ')}`
            : 'all channels covered with available specialists',
        status: 'done',
    });

    return {
        similarCampaigns,
        budgetStats,
        costComposition,
        approvalStats,
        delivery,
        candidatePeople: candidatePeopleWithLoad,
        candidateAgents,
        markets: allMarkets.filter((m) => inputMarketSet.has(m.id)),
        channels: allChannels.filter((c) => inputChannelSet.has(c.id)),
        brief_window: { start: briefStart, end: briefEnd },
        brandName,
        brandCategory,
    };
}

// ===========================================================================
// Prompt construction
// ===========================================================================

function buildPrompts(input: BriefInput, context: Awaited<ReturnType<typeof buildContext>>) {
    const systemPrompt = `You are the Briefing Assistant for Halo & Helix, an independent marketing agency.

Your job: given a new brief from the client (${context.brandName}${context.brandCategory ? `, ${context.brandCategory}` : ''}) and grounded historical context from Halo & Helix's knowledge graph, produce a STRUCTURED RECOMMENDATION for budget, timeline, team, and risks.

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

AI AGENTS — the hybrid bench (this is a core part of modern resource planning):
You are given a CANDIDATE AI AGENTS list. Treat agents as real resources alongside people. They are strong at some disciplines (long-form copy, content, localisation, analysis, drafting) and weak/unusable at others (art direction, events, OOH/POSM physical production, negotiation). They bill in TOKENS (pennies-to-pounds), not day rates, and are effectively ALWAYS AVAILABLE.

Use agents deliberately:
1. Propose a HYBRID team. For suitable, high-volume or first-draft work (localisation variants, SEO/ECRM copy, research synthesis, data analysis), include a named agent from the candidate list with proposed_role_on_brief describing the task (e.g. "First-draft localisation across DE/FR", "SEO content drafting", "Performance analysis"). Pair agents with a human reviewer/lead rather than replacing senior judgement.
2. Agents are the natural MITIGATION for capacity/coverage gaps. If a channel is THIN/NONE on human specialists, or a top human is unavailable, propose an agent to fill the gap and say so explicitly in the risk's mitigation and/or the summary (e.g. "SEO bench is thin — Claude Sonnet 4.6 drafts long-form SEO at proficiency 4 for ~£X in tokens, reviewed by [human]").
3. For an agent team member: set resource_type:"agent", person_id to the agent's id from the candidate list, daily_rate_gbp:0, and est_cost_gbp to a sensible token cost for this brief (use the agent's avg cost/execution × the rough number of executions). The FIRST evidence item for an agent should be its cost basis (e.g. "~£12 in tokens vs £880/day human equiv"), NOT availability.
4. Do not force the "% available in window" evidence rule on agents — that rule is for humans only.

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
      "person_id": "person:... or agent:... for AI agents",
      "person_name": "Maya Chen",
      "role_name": "Strategy Director",
      "proposed_role_on_brief": "Lead strategist",
      "seniority": "director",
      "daily_rate_gbp": 1380,
      "rationale": "Why this resource — be specific. 1–2 sentences citing concrete skills + experience + (if relevant) persona alignment.",
      "match_score": 87,
      "evidence": ["85% available in window", "7 years on SOCIAL_MEDIA", "9 years on category:beauty", "proficiency 5 on positioning"],
      "resource_type": "human",
      "est_cost_gbp": 0
    },
    {
      "person_id": "agent:anthropic-claude-sonnet-4-6",
      "person_name": "Claude Sonnet 4.6",
      "proposed_role_on_brief": "First-draft localisation across DE/FR",
      "rationale": "Why this agent — the task it covers and why it fits.",
      "match_score": 80,
      "evidence": ["~£8 in tokens vs £480/day human equiv", "proficiency 5 on ecrm-copy", "always available"],
      "resource_type": "agent",
      "est_cost_gbp": 8
    }
  ],
  "risks": [
    {
      "severity": "low" | "medium" | "high",
      "title": "Short title",
      "description": "1–2 sentences describing the risk and its impact.",
      "mitigation": "1 sentence — the concrete next step to mitigate. Propose an AI agent here where it fits.",
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

DELIVERY DYNAMICS (from ${context.delivery.sample_executions.toLocaleString()} past executions in these channels) — how long delivery ACTUALLY takes:
   Expected end-to-end: ~${context.delivery.expected_weeks_low}–${context.delivery.expected_weeks_high} weeks (relay-based, includes typical slip)
   Per channel:${context.delivery.per_channel.map((c) => `
     ${c.channel}: median ${c.median_calendar_days}d calendar, ~${c.median_person_days} person-days, ${c.on_time_pct}% on-time, avg slip ${c.avg_slip_days > 0 ? '+' : ''}${c.avg_slip_days}d (n=${c.sample})`).join('')}
   Delivery relay (the repeatable stage sequence):${context.delivery.relay.map((r) => `
     ${r.stage}: ~${r.median_days}d median, led by ${r.dominant_department}`).join('')}
   → Ground recommended_weeks in this. Don't recommend a timeline shorter than the expected end-to-end unless you justify why. If on-time % is low or slip is high, reflect it as a schedule risk.

CHANNEL COVERAGE (specialists on the bench vs available in the brief window):${context.delivery.channel_coverage.map((c) => `
   ${c.channel}: ${c.specialists_available} available / ${c.specialists_total} on bench — ${c.status.toUpperCase()}`).join('')}
   → If any channel is THIN (≤1 available specialist) or NONE (no bench), raise it as a capacity/coverage risk and reflect it in the team (or flag the gap explicitly in the summary).

BRIEF WINDOW for availability checks: ${context.brief_window.start} → ${context.brief_window.end}

CANDIDATE PEOPLE (top ${context.candidatePeople.length} by relevant skill + experience):
${context.candidatePeople.map((p, i) => `${i + 1}. ${p.id}
   ${p.properties.name} — ${p.role_name}, ${p.department_name}, ${p.properties.office}
   Seniority: ${p.properties.seniority}, Daily rate: £${p.properties.daily_rate_gbp}, Capacity: ${p.properties.capacity_hours_per_week}h/wk
   Channel experience (matching): ${p.channel_match_years} years across the brief's channels
   Category experience (matching): ${p.category_match_years} years in ${context.brandCategory || 'the brand category'}
   Top skills: ${p.top_skills.map((s) => `${s.skill_name} (${s.proficiency}/5)`).join(', ')}
   Channel experience detail: ${p.channel_experience.map((c) => `${c.channel_label}:${c.years}y`).join(', ')}
   Recent overload weeks (last 6mo): ${p.recent_overload_weeks}
   AVAILABLE IN BRIEF WINDOW: ${p.available_pct_in_window}%${p.conflicting_blocks.length > 0
            ? ' — conflicts: ' + p.conflicting_blocks.map((b: any) => `${b.reason} ${b.start}→${b.end} (${b.allocation_pct}%)`).join('; ')
            : ' — fully available'}`).join('\n\n')}

CANDIDATE AI AGENTS (the hybrid bench — token-priced, always available):
${context.candidateAgents.length === 0 ? 'NONE fit these channels.' :
        context.candidateAgents.map((a, i) => `${i + 1}. ${a.id}
   ${a.properties.name} — ${a.properties.provider}, model ${a.properties.model_id}${a.properties.pricing_model === 'per_seat' ? `, £${a.properties.seat_gbp_per_month}/seat/mo` : `, £${a.properties.input_price_gbp_per_mtok}/£${a.properties.output_price_gbp_per_mtok} per Mtok (in/out)`}
   Best for: ${a.properties.best_for || '—'}
   Strong skills: ${a.top_skills.map((s) => `${s.skill_id.replace('skill:', '')} (${s.proficiency}/5)`).join(', ')}
   Channel fit (this brief): ${a.channel_fit}, skill fit: ${a.skill_fit}
   History: used on ${a.hist_executions} past executions, ${a.hist_total_tokens.toLocaleString()} tokens, ~£${a.avg_cost_per_execution_gbp}/execution`).join('\n\n')}

Now produce the JSON recommendation following the system prompt. Propose a HYBRID team (humans + agents) and use agents as mitigation where coverage is thin. Stay grounded in the data above.`;

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
