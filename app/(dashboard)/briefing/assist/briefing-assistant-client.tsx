'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Loader2, Sparkles, AlertTriangle, AlertCircle, TrendingUp, TrendingDown,
    Calendar, Banknote, Users, ShieldAlert, Link as LinkIcon, RotateCcw,
    Database, Brain, BarChart3, Cpu, CheckCircle2, Gauge, ChevronDown,
    Truck, Workflow, Clock, ArrowRight, Bot, ShieldCheck,
} from 'lucide-react';
import type { BriefRecommendation, AgentEvent } from '@/lib/agents/briefing-assistant';

// A single line in the live agent trace (the streamed 'step' events).
interface AgentStep {
    id: string;
    phase: 'retrieve' | 'analyse' | 'reason';
    label: string;
    detail?: string;
    status: 'active' | 'done';
    count?: number;
    ms?: number;
}

interface TokenUsage {
    prompt?: number;
    completion?: number;
    total?: number;
    estimated?: boolean;
}

interface MarketRef { id: string; label: string; ref_id: string }
interface ChannelRef { id: string; label: string; ref_id: string }

interface BriefingAssistantClientProps {
    markets: MarketRef[];
    channels: ChannelRef[];
}

// Demo briefs preloadable with one click — useful for the live demo
const DEMO_BRIEFS = [
    {
        label: 'Mineral SPF Push — DACH H2 2026',
        brief: {
            title: 'Mineral SPF Push — DACH H2 2026',
            summary:
                'Drive trial of the Mineral Defence SPF50 in Germany and France for late-summer / early-autumn 2026. Bridge audience from competitors (La Roche-Posay, EltaMD). Lean into the AM phase narrative.',
            market_ids: ['market:DE', 'market:FR'],
            channel_ids: ['channel:PAID_MEDIA', 'channel:SOCIAL_MEDIA', 'channel:ECRM', 'channel:SEO'],
            start_date: '2026-08-15',
            duration_weeks: 10,
            budget_hint_gbp: 450000,
            objectives: ['Acquire 8,000 new DE customers', 'Hit blended ROAS ≥ 2.8x', 'Lift aided awareness in DE by 2pp'],
            notes: 'Sensitive-skin angle (Gentle Gemma persona) is dominant in DE. FR responds to ritual storytelling.',
        },
    },
    {
        label: 'Retinoid PM Anniversary — US Sephora 2026',
        brief: {
            title: 'Retinoid PM Anniversary — US Sephora 2026',
            summary:
                'Hero campaign for the US market: 4-year anniversary of Retinoid PM Serum, with Sephora US retail activation. POSM in all 240 doors, supporting paid + social + 6 launch events in flagship cities.',
            market_ids: ['market:US'],
            channel_ids: ['channel:B2B2C', 'channel:POSM', 'channel:EVENT', 'channel:SOCIAL_MEDIA', 'channel:PAID_MEDIA'],
            start_date: '2026-09-01',
            duration_weeks: 14,
            budget_hint_gbp: 1200000,
            objectives: ['Hit Sephora top-15 in Skincare Treatments', '$5M Y1 sell-through', '60k new customers'],
            notes: 'Performance Pip is the US lead persona. Heavy evidence-driven creative. Need approvals through Rachel Park (US VP).',
        },
    },
    {
        label: 'JP Tokyo Always-On 2026',
        brief: {
            title: 'JP Tokyo Always-On 2026',
            summary:
                'Year 2 in Japan. Maintain Tokyo concept-store residency, scale LINE loyalty programme, add a Q4 OOH wave in Shibuya + Shinjuku. Local agency partner for in-market production.',
            market_ids: ['market:JP'],
            channel_ids: ['channel:OOH', 'channel:EVENT', 'channel:ECRM', 'channel:SOCIAL_MEDIA'],
            start_date: '2026-07-01',
            duration_weeks: 26,
            budget_hint_gbp: 650000,
            objectives: ['Scale LINE loyalty to 18,000 members', 'OOH prompted recall 12%+', '¥240M Y2 revenue'],
            notes: 'Ritual Rina is the JP lead. Approvals through Yuki Saito + global brand sign-off on hero work.',
        },
    },
] as const;

export function BriefingAssistantClient({ markets, channels }: BriefingAssistantClientProps) {
    // Form state
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [marketIds, setMarketIds] = useState<string[]>([]);
    const [channelIds, setChannelIds] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('2026-09-01');
    const [durationWeeks, setDurationWeeks] = useState<number | ''>('');
    const [budgetHint, setBudgetHint] = useState<number | ''>('');
    const [objectives, setObjectives] = useState('');
    const [notes, setNotes] = useState('');

    // Result state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recommendation, setRecommendation] = useState<BriefRecommendation | null>(null);
    // Live agent trace
    const [steps, setSteps] = useState<AgentStep[]>([]);
    const [tokens, setTokens] = useState<TokenUsage>({});

    const toggle = (id: string, list: string[], setter: (v: string[]) => void) => {
        setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
    };

    const loadDemo = (i: number) => {
        const b = DEMO_BRIEFS[i].brief;
        setTitle(b.title);
        setSummary(b.summary);
        setMarketIds([...b.market_ids]);
        setChannelIds([...b.channel_ids]);
        setStartDate(b.start_date);
        setDurationWeeks(b.duration_weeks);
        setBudgetHint(b.budget_hint_gbp);
        setObjectives(b.objectives.join('\n'));
        setNotes(b.notes);
        setRecommendation(null);
        setError(null);
        setSteps([]);
        setTokens({});
    };

    const reset = () => {
        setTitle('');
        setSummary('');
        setMarketIds([]);
        setChannelIds([]);
        setStartDate('2026-09-01');
        setDurationWeeks('');
        setBudgetHint('');
        setObjectives('');
        setNotes('');
        setRecommendation(null);
        setError(null);
        setSteps([]);
        setTokens({});
    };

    const submit = async () => {
        setError(null);
        setRecommendation(null);
        setSteps([]);
        setTokens({});
        if (!title || !summary || marketIds.length === 0 || channelIds.length === 0 || !startDate) {
            setError('Fill in title, summary, at least one market, at least one channel, and a start date.');
            return;
        }
        setIsLoading(true);

        // Apply a streamed agent event to local state.
        const apply = (evt: AgentEvent) => {
            if (evt.type === 'step') {
                const { type, ...step } = evt;
                setSteps((prev) => {
                    const i = prev.findIndex((s) => s.id === step.id);
                    if (i === -1) return [...prev, step];
                    const next = [...prev];
                    next[i] = step; // upgrade active → done in place
                    return next;
                });
            } else if (evt.type === 'tokens') {
                setTokens({ prompt: evt.prompt, completion: evt.completion, total: evt.total, estimated: evt.estimated });
            } else if (evt.type === 'done') {
                setRecommendation(evt.recommendation);
            } else if (evt.type === 'error') {
                setError(evt.message);
            }
        };

        try {
            const res = await fetch('/api/agents/briefing-assistant/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    summary,
                    market_ids: marketIds,
                    channel_ids: channelIds,
                    start_date: startDate,
                    duration_weeks: durationWeeks || undefined,
                    budget_hint_gbp: budgetHint || undefined,
                    objectives: objectives.split('\n').map((s) => s.trim()).filter(Boolean),
                    notes,
                }),
            });

            if (!res.ok || !res.body) {
                let msg = `Request failed (${res.status})`;
                try {
                    const data = await res.json();
                    msg = data?.error || msg;
                } catch {}
                throw new Error(msg);
            }

            // Parse the SSE stream: events are separated by a blank line, each
            // line prefixed with "data: ".
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            for (;;) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const blocks = buffer.split('\n\n');
                buffer = blocks.pop() ?? ''; // keep the trailing partial block
                for (const block of blocks) {
                    const line = block.split('\n').find((l) => l.startsWith('data:'));
                    if (!line) continue;
                    try {
                        apply(JSON.parse(line.slice(5).trim()) as AgentEvent);
                    } catch {}
                }
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to get recommendation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-5 gap-6">
            {/* ----- Left: form ----- */}
            <div className="lg:col-span-2 space-y-4">
                <Card variant="elevated">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-neutral-400 mr-auto">Quick-load a demo brief:</span>
                            {DEMO_BRIEFS.map((b, i) => (
                                <button
                                    key={i}
                                    onClick={() => loadDemo(i)}
                                    className="text-[11px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                                >
                                    {b.label}
                                </button>
                            ))}
                            <button
                                onClick={reset}
                                title="Reset form"
                                className="text-[11px] px-2 py-1 rounded-md text-neutral-500 hover:text-neutral-300 flex items-center gap-1"
                            >
                                <RotateCcw className="h-3 w-3" /> reset
                            </button>
                        </div>

                        <Field label="Brief title">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Mineral SPF Push — DACH H2 2026"
                                className={inputCls}
                            />
                        </Field>

                        <Field label="What's the brief?">
                            <textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                rows={4}
                                placeholder="2–4 sentences describing what you want to do, for whom, and why now."
                                className={inputCls + ' resize-y'}
                            />
                        </Field>

                        <Field label="Markets">
                            <div className="flex flex-wrap gap-1.5">
                                {markets.map((m) => (
                                    <ChipButton
                                        key={m.id}
                                        active={marketIds.includes(m.id)}
                                        onClick={() => toggle(m.id, marketIds, setMarketIds)}
                                    >
                                        {m.label}
                                    </ChipButton>
                                ))}
                            </div>
                        </Field>

                        <Field label="Channels">
                            <div className="flex flex-wrap gap-1.5">
                                {channels.map((c) => (
                                    <ChipButton
                                        key={c.id}
                                        active={channelIds.includes(c.id)}
                                        onClick={() => toggle(c.id, channelIds, setChannelIds)}
                                    >
                                        {c.label}
                                    </ChipButton>
                                ))}
                            </div>
                        </Field>

                        <div className="grid grid-cols-3 gap-3">
                            <Field label="Start date">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className={inputCls + ' scheme-dark'}
                                />
                            </Field>
                            <Field label="Duration (wks)">
                                <input
                                    type="number"
                                    value={durationWeeks}
                                    onChange={(e) => setDurationWeeks(e.target.value ? parseInt(e.target.value) : '')}
                                    placeholder="—"
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Budget hint (£)">
                                <input
                                    type="number"
                                    value={budgetHint}
                                    onChange={(e) => setBudgetHint(e.target.value ? parseInt(e.target.value) : '')}
                                    placeholder="optional"
                                    className={inputCls}
                                />
                            </Field>
                        </div>

                        <Field label="Objectives (one per line)">
                            <textarea
                                value={objectives}
                                onChange={(e) => setObjectives(e.target.value)}
                                rows={3}
                                placeholder="e.g. Acquire 8,000 new customers&#10;Hit ROAS ≥ 2.8x"
                                className={inputCls + ' resize-y'}
                            />
                        </Field>

                        <Field label="Constraints / notes (optional)">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                placeholder="Anything specific — partners, approvers, persona angle…"
                                className={inputCls + ' resize-y'}
                            />
                        </Field>

                        <button
                            onClick={submit}
                            disabled={isLoading}
                            className={cn(
                                'w-full px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors',
                                isLoading
                                    ? 'bg-white/10 text-neutral-400 cursor-not-allowed'
                                    : 'bg-primary-600 hover:bg-primary-500 text-white',
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Reading the knowledge graph…
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Ask the Briefing Assistant
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-300 text-sm flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ----- Right: recommendation ----- */}
            <div className="lg:col-span-3">
                <RecommendationPanel
                    recommendation={recommendation}
                    isLoading={isLoading}
                    steps={steps}
                    tokens={tokens}
                />
            </div>
        </div>
    );
}

function RecommendationPanel({
    recommendation,
    isLoading,
    steps,
    tokens,
}: {
    recommendation: BriefRecommendation | null;
    isLoading: boolean;
    steps: AgentStep[];
    tokens: TokenUsage;
}) {
    if (isLoading) {
        return <AgentActivityFeed steps={steps} tokens={tokens} running />;
    }

    if (!recommendation) {
        return (
            <Card variant="elevated" className="h-full">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-[400px] text-neutral-400">
                    <Sparkles className="h-10 w-10 text-primary-500/40 mb-4" />
                    <p className="max-w-sm text-sm">
                        Fill in the brief on the left (or quick-load a demo brief above) and click <span className="text-white font-medium">Ask the Briefing Assistant</span>.
                    </p>
                    <p className="text-xs text-neutral-500 mt-3 max-w-sm">
                        Every recommendation cites specific historical campaigns and named people from the knowledge graph.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const r = recommendation;

    return (
        <div className="space-y-4">
            {/* Headline summary */}
            <Card variant="elevated">
                <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/30">
                            <Sparkles className="h-5 w-5 text-primary-400" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-base font-semibold text-white mb-1">Recommendation</h2>
                            <p className="text-sm text-neutral-300 leading-relaxed">{r.summary}</p>
                            <div className="mt-2 flex items-center gap-3 text-[11px] text-neutral-500 flex-wrap">
                                <span>Model: {r.meta.model}</span>
                                <span>·</span>
                                <span>{(r.meta.latency_ms / 1000).toFixed(1)}s</span>
                                <span>·</span>
                                <span>{r.meta.total_tokens.toLocaleString()} tokens ({r.meta.prompt_tokens.toLocaleString()} in / {r.meta.completion_tokens.toLocaleString()} out)</span>
                                <span>·</span>
                                <span>{r.meta.context_campaigns} campaigns · {r.meta.context_people} people · {r.meta.context_approvals} approvals analysed</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confidence read-out */}
            <ConfidenceCard confidence={r.confidence} />

            {/* Budget */}
            <Card variant="elevated">
                <CardContent className="p-5">
                    <SectionHeader icon={Banknote} title="Budget" />
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-semibold text-white">£{fmt(r.budget.recommended_low_gbp)}</span>
                        <span className="text-neutral-500">–</span>
                        <span className="text-2xl font-semibold text-white">£{fmt(r.budget.recommended_high_gbp)}</span>
                    </div>
                    <p className="text-sm text-neutral-300 mt-2 leading-relaxed">{r.budget.rationale}</p>
                    {r.budget.composition && r.budget.composition.total_gbp > 0 && (
                        <BudgetComposition composition={r.budget.composition} />
                    )}
                    {r.budget.cited_campaigns.length > 0 && (
                        <div className="mt-3 space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Cited campaigns</div>
                            {r.budget.cited_campaigns.map((c) => (
                                <Link
                                    key={c.id}
                                    href={`/knowledge-graph/campaigns/${encodeURIComponent(c.id)}`}
                                    className="block text-sm text-neutral-300 hover:text-white border border-white/5 hover:border-white/20 rounded-md px-2.5 py-1.5 transition-colors"
                                >
                                    <span className="font-medium">{c.name}</span>
                                    <span className="text-neutral-400">  ·  planned £{fmt(c.planned_gbp)} → actual £{fmt(c.actual_gbp)}</span>
                                    <span className={cn('ml-2', c.variance_pct > 4 ? 'text-amber-400' : c.variance_pct < -2 ? 'text-emerald-400' : 'text-neutral-400')}>
                                        {c.variance_pct > 0 ? '+' : ''}{c.variance_pct}%
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Timeline */}
            <Card variant="elevated">
                <CardContent className="p-5">
                    <SectionHeader icon={Calendar} title="Timeline" />
                    <div className="flex items-baseline gap-3 mt-2">
                        <span className="text-2xl font-semibold text-white">{r.timeline.recommended_weeks} weeks</span>
                    </div>
                    <p className="text-sm text-neutral-300 mt-2 leading-relaxed">{r.timeline.rationale}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-md bg-white/5 border border-white/10 px-3 py-2">
                            <div className="text-[10px] uppercase tracking-wider text-neutral-500">Internal review (planned 5d)</div>
                            <div className="text-white text-sm font-medium mt-0.5">{r.timeline.internal_review_days_avg} days avg actual</div>
                        </div>
                        <div className="rounded-md bg-white/5 border border-white/10 px-3 py-2">
                            <div className="text-[10px] uppercase tracking-wider text-neutral-500">Client review (planned 3d)</div>
                            <div className="text-white text-sm font-medium mt-0.5">{r.timeline.client_review_days_avg} days avg actual</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delivery dynamics */}
            {r.delivery && <DeliveryCard delivery={r.delivery} />}

            {/* Team */}
            <Card variant="elevated">
                <CardContent className="p-5">
                    <SectionHeader icon={Users} title={`Proposed team (${r.team.length})`} />
                    <div className="mt-3 space-y-2">
                        {r.team.map((m) => (
                            <div key={m.person_id} className={cn('rounded-lg border px-3 py-2.5 transition-colors', m.resource_type === 'agent' ? 'border-fuchsia-500/25 hover:border-fuchsia-500/40 bg-fuchsia-500/[0.04]' : 'border-white/5 hover:border-white/15 bg-white/[0.02]')}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium text-white flex items-center gap-1.5">
                                                {m.resource_type === 'agent' && <Bot className="h-3.5 w-3.5 text-fuchsia-400" />}
                                                {m.person_name}
                                            </span>
                                            {m.resource_type === 'agent' ? (
                                                <>
                                                    <Badge variant="outline" className="text-[10px] normal-case border-fuchsia-500/40 text-fuchsia-300">AI agent</Badge>
                                                    <span className="text-xs text-fuchsia-300/80">~£{fmt(m.est_cost_gbp || 0)} in tokens</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Badge variant="outline" className="text-[10px] normal-case">{m.seniority}</Badge>
                                                    <span className="text-xs text-neutral-400">£{m.daily_rate_gbp}/day</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="text-xs text-neutral-400 mt-0.5">{m.role_name} → <span className="text-neutral-300">{m.proposed_role_on_brief}</span></div>
                                        <p className="text-sm text-neutral-300 mt-1 leading-snug">{m.rationale}</p>
                                        {m.evidence.length > 0 && (
                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                {m.evidence.slice(0, 4).map((e, i) => (
                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400">{e}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        <MatchScore score={m.match_score} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Risks */}
            {r.risks.length > 0 && (
                <Card variant="elevated">
                    <CardContent className="p-5">
                        <SectionHeader icon={ShieldAlert} title="Risks" />
                        <div className="mt-3 space-y-2">
                            {r.risks.map((risk, i) => (
                                <div key={i} className="rounded-md border border-white/5 px-3 py-2.5 bg-white/[0.02]">
                                    <div className="flex items-start gap-2">
                                        <RiskIcon severity={risk.severity} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-medium text-white">{risk.title}</span>
                                                <Badge variant={severityToBadge(risk.severity)} className="text-[10px]">{risk.severity}</Badge>
                                            </div>
                                            <p className="text-sm text-neutral-300 mt-1 leading-snug">{risk.description}</p>
                                            {risk.mitigation && (
                                                <div className="mt-1.5 flex items-start gap-1.5 text-sm text-emerald-300/90">
                                                    <ShieldCheck className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-emerald-400" />
                                                    <span><span className="text-emerald-400/70 text-[10px] uppercase tracking-wider mr-1">Mitigation</span>{risk.mitigation}</span>
                                                </div>
                                            )}
                                            {risk.cited_signals.length > 0 && (
                                                <div className="mt-1.5 flex flex-wrap gap-1">
                                                    {risk.cited_signals.map((s, j) => (
                                                        <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400 font-mono">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Comparable campaigns */}
            {r.comparable_campaigns.length > 0 && (
                <Card variant="elevated">
                    <CardContent className="p-5">
                        <SectionHeader icon={LinkIcon} title="Most comparable historical campaigns" />
                        <div className="mt-3 space-y-1.5">
                            {r.comparable_campaigns.map((c) => (
                                <Link
                                    key={c.id}
                                    href={`/knowledge-graph/campaigns/${encodeURIComponent(c.id)}`}
                                    className="block rounded-md border border-white/5 hover:border-white/20 px-3 py-2 transition-colors"
                                >
                                    <div className="text-sm text-white">{c.name}</div>
                                    <div className="text-xs text-neutral-400 mt-0.5">{c.why_comparable}</div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Agent trace (what actually ran) — collapsible */}
            {steps.length > 0 && <AgentTrace steps={steps} tokens={tokens} />}
        </div>
    );
}

// ===========================================================================
// Live agent activity feed (shown while the agent works)
// ===========================================================================

const PHASES: { key: 'retrieve' | 'analyse' | 'reason'; label: string; icon: any }[] = [
    { key: 'retrieve', label: 'Retrieve', icon: Database },
    { key: 'analyse', label: 'Analyse', icon: BarChart3 },
    { key: 'reason', label: 'Reason', icon: Brain },
];

function AgentActivityFeed({ steps, tokens, running }: { steps: AgentStep[]; tokens: TokenUsage; running?: boolean }) {
    const liveCompletion = tokens.completion ?? 0;
    const totalShown = tokens.total ?? (tokens.prompt ?? 0) + liveCompletion;
    return (
        <Card variant="elevated" className="h-full">
            <CardContent className="p-5 min-h-[400px]">
                <div className="flex items-center gap-2 mb-1">
                    <div className="relative">
                        <Cpu className="h-5 w-5 text-primary-400" />
                        {running && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary-400 animate-ping" />}
                    </div>
                    <h2 className="text-base font-semibold text-white">Briefing agent — live</h2>
                    <span className="ml-auto text-[11px] text-neutral-500">retrieval-augmented · gpt-4o</span>
                </div>
                <p className="text-xs text-neutral-500 mb-4">
                    One agent, three phases. Reading the knowledge graph, scoring evidence, then reasoning.
                </p>

                {/* Token meter */}
                <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 mb-4">
                    <div className="flex items-baseline justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-neutral-500">Tokens {tokens.estimated ? '(live est.)' : 'used'}</span>
                        <span className="text-[11px] text-neutral-500">{(tokens.prompt ?? 0).toLocaleString()} in · {liveCompletion.toLocaleString()} out</span>
                    </div>
                    <div className="mt-1 font-mono text-2xl font-semibold text-white tabular-nums">
                        {totalShown.toLocaleString()}
                    </div>
                </div>

                {/* Phase-grouped steps */}
                <div className="space-y-4">
                    {PHASES.map((phase) => {
                        const phaseSteps = steps.filter((s) => s.phase === phase.key);
                        if (phaseSteps.length === 0 && !running) return null;
                        const Icon = phase.icon;
                        return (
                            <div key={phase.key}>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Icon className="h-3.5 w-3.5 text-primary-400/80" />
                                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">{phase.label}</span>
                                </div>
                                <div className="space-y-1 pl-1">
                                    {phaseSteps.length === 0 ? (
                                        <div className="flex items-center gap-2 text-xs text-neutral-600">
                                            <span className="h-3.5 w-3.5 rounded-full border border-white/10 inline-block" />
                                            waiting…
                                        </div>
                                    ) : (
                                        phaseSteps.map((s) => <StepRow key={s.id} step={s} />)
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function StepRow({ step }: { step: AgentStep }) {
    return (
        <div className="flex items-start gap-2 text-sm">
            {step.status === 'done' ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
                <Loader2 className="h-3.5 w-3.5 text-primary-400 animate-spin mt-0.5 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
                <span className={cn(step.status === 'done' ? 'text-neutral-300' : 'text-white')}>{step.label}</span>
                {step.detail && <span className="text-neutral-500"> — {step.detail}</span>}
            </div>
            {typeof step.ms === 'number' && <span className="text-[10px] text-neutral-600 flex-shrink-0 tabular-nums">{step.ms}ms</span>}
        </div>
    );
}

function ConfidenceCard({ confidence: c }: { confidence: BriefRecommendation['confidence'] }) {
    const colour = c.label === 'high' ? 'text-emerald-400' : c.label === 'medium' ? 'text-amber-400' : 'text-red-400';
    const bar = c.label === 'high' ? 'bg-emerald-400' : c.label === 'medium' ? 'bg-amber-400' : 'bg-red-400';
    return (
        <Card variant="elevated">
            <CardContent className="p-5">
                <SectionHeader icon={Gauge} title="Confidence" />
                <div className="mt-3 flex items-center gap-4">
                    <div className="text-right">
                        <div className={cn('text-3xl font-semibold leading-none tabular-nums', colour)}>{c.overall}</div>
                        <div className={cn('text-[10px] uppercase tracking-wider mt-1', colour)}>{c.label} grounding</div>
                    </div>
                    <div className="flex-1">
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div className={cn('h-full rounded-full', bar)} style={{ width: `${c.overall}%` }} />
                        </div>
                        <p className="text-xs text-neutral-400 mt-2 leading-snug">{c.basis}</p>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <ConfidenceStat label="Budget" value={c.budget} />
                    <ConfidenceStat label="Timeline" value={c.timeline} />
                    <ConfidenceStat label="Team match" value={c.team_match_avg} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                    <SignalChip label={`${c.signals.similar_campaigns} comparable campaigns`} />
                    <SignalChip label={`${c.signals.cost_line_samples.toLocaleString()} cost lines`} />
                    <SignalChip label={`${c.signals.approval_samples} approval samples`} />
                    <SignalChip label={`${c.signals.candidate_people} candidates`} />
                </div>
            </CardContent>
        </Card>
    );
}

function ConfidenceStat({ label, value }: { label: string; value: number }) {
    const colour = value >= 70 ? 'text-emerald-400' : value >= 40 ? 'text-amber-400' : 'text-neutral-400';
    return (
        <div className="rounded-md bg-white/5 border border-white/10 px-2 py-2">
            <div className={cn('text-lg font-semibold leading-none tabular-nums', colour)}>{value}</div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 mt-1">{label}</div>
        </div>
    );
}

function SignalChip({ label }: { label: string }) {
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400">{label}</span>;
}

const COMP_SEGMENTS = [
    { key: 'labour', label: 'Labour', colour: 'bg-primary-500' },
    { key: 'media', label: 'Media', colour: 'bg-emerald-500' },
    { key: 'production', label: 'Production', colour: 'bg-amber-500' },
    { key: 'localisation', label: 'Localisation', colour: 'bg-sky-500' },
    { key: 'ai', label: 'AI / Agents', colour: 'bg-fuchsia-500' },
] as const;

function BudgetComposition({ composition: c }: { composition: BriefRecommendation['budget']['composition'] }) {
    const segs = COMP_SEGMENTS.map((s) => ({
        ...s,
        pct: c[`${s.key}_pct` as const] as number,
        gbp: c[`${s.key}_gbp` as const] as number,
    })).filter((s) => s.pct > 0);
    return (
        <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">
                How comparable spend broke down ({c.cost_line_samples.toLocaleString()} cost lines)
            </div>
            {/* Stacked bar */}
            <div className="flex h-2.5 rounded-full overflow-hidden bg-white/5">
                {segs.map((s) => (
                    <div key={s.key} className={cn('h-full', s.colour)} style={{ width: `${s.pct}%` }} title={`${s.label} ${s.pct}%`} />
                ))}
            </div>
            {/* Legend */}
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {segs.map((s) => (
                    <span key={s.key} className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                        <span className={cn('h-2 w-2 rounded-sm', s.colour)} />
                        {s.label} <span className="text-neutral-300 font-medium">{s.pct}%</span>
                        <span className="text-neutral-600">£{fmt(s.gbp)}</span>
                    </span>
                ))}
            </div>
            {c.by_department.length > 0 && (
                <div className="mt-2 text-[11px] text-neutral-500">
                    Labour by team: {c.by_department.map((d) => `${d.department} ${d.pct}%`).join(' · ')}
                </div>
            )}
        </div>
    );
}

function AgentTrace({ steps, tokens }: { steps: AgentStep[]; tokens: TokenUsage }) {
    const [open, setOpen] = useState(false);
    return (
        <Card variant="elevated">
            <CardContent className="p-0">
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className="w-full flex items-center gap-2 px-5 py-3 text-left"
                >
                    <Cpu className="h-4 w-4 text-primary-400" />
                    <span className="text-sm font-semibold text-white">Agent trace</span>
                    <span className="text-[11px] text-neutral-500">{steps.length} steps · {(tokens.total ?? 0).toLocaleString()} tokens</span>
                    <ChevronDown className={cn('h-4 w-4 text-neutral-500 ml-auto transition-transform', open && 'rotate-180')} />
                </button>
                {open && (
                    <div className="px-5 pb-4 space-y-1 border-t border-white/5 pt-3">
                        {steps.map((s) => <StepRow key={s.id} step={s} />)}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function DeliveryCard({ delivery: d }: { delivery: BriefRecommendation['delivery'] }) {
    const coverageColour = (s: string) => (s === 'ok' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : s === 'thin' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10');
    return (
        <Card variant="elevated">
            <CardContent className="p-5">
                <SectionHeader icon={Truck} title="Delivery dynamics" />
                <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-semibold text-white">{d.expected_weeks_low}–{d.expected_weeks_high} weeks</span>
                    <span className="text-xs text-neutral-500">expected end-to-end · {d.sample_executions.toLocaleString()} past executions</span>
                </div>

                {/* Relay */}
                {d.relay.length > 0 && (
                    <div className="mt-4">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Workflow className="h-3.5 w-3.5 text-primary-400/80" />
                            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">The relay</span>
                        </div>
                        <div className="flex items-stretch gap-2 flex-wrap">
                            {d.relay.map((r, i) => (
                                <div key={r.stage} className="flex items-center gap-2">
                                    <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                                        <div className="text-sm text-white">{r.stage}</div>
                                        <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> ~{r.median_days}d · {r.dominant_department}
                                        </div>
                                    </div>
                                    {i < d.relay.length - 1 && <ArrowRight className="h-4 w-4 text-neutral-600 flex-shrink-0" />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Per-channel lead times */}
                {d.per_channel.length > 0 && (
                    <div className="mt-4">
                        <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">Lead time by channel</div>
                        <div className="space-y-1">
                            {d.per_channel.map((c) => (
                                <div key={c.channel} className="flex items-center gap-2 text-xs">
                                    <span className="text-neutral-300 w-28 flex-shrink-0">{c.channel}</span>
                                    <span className="text-white tabular-nums">{c.median_calendar_days}d</span>
                                    <span className="text-neutral-500">·</span>
                                    <span className="text-neutral-400 tabular-nums">{c.median_person_days} person-days</span>
                                    <span className="text-neutral-500">·</span>
                                    <span className={cn('tabular-nums', c.on_time_pct >= 50 ? 'text-emerald-400' : 'text-amber-400')}>{c.on_time_pct}% on-time</span>
                                    {c.avg_slip_days > 0 && <span className="text-neutral-600">+{c.avg_slip_days}d slip</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Channel coverage */}
                {d.channel_coverage.length > 0 && (
                    <div className="mt-4">
                        <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">Channel coverage (available / bench)</div>
                        <div className="flex flex-wrap gap-1.5">
                            {d.channel_coverage.map((c) => (
                                <span key={c.channel} className={cn('text-[11px] px-2 py-1 rounded-md border', coverageColour(c.status))}>
                                    {c.channel} {c.specialists_available}/{c.specialists_total}
                                    {c.status === 'none' ? ' · no bench' : c.status === 'thin' ? ' · thin' : ''}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wide">{label}</label>
            {children}
        </div>
    );
}

function ChipButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'text-xs px-2.5 py-1 rounded-md border transition-colors',
                active
                    ? 'bg-primary-500/20 border-primary-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white',
            )}
        >
            {children}
        </button>
    );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
    );
}

function MatchScore({ score }: { score: number }) {
    const colour = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-neutral-400';
    return (
        <div className="text-right">
            <div className={cn('text-lg font-semibold leading-none', colour)}>{score}</div>
            <div className="text-[9px] text-neutral-500 uppercase tracking-wider mt-0.5">match</div>
        </div>
    );
}

function RiskIcon({ severity }: { severity: 'low' | 'medium' | 'high' }) {
    if (severity === 'high') return <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />;
    if (severity === 'medium') return <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />;
    return <TrendingUp className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />;
}

function severityToBadge(s: string) {
    if (s === 'high') return 'destructive';
    if (s === 'medium') return 'warning';
    return 'default';
}

function fmt(n: number): string {
    return new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(n);
}

const inputCls =
    'w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary-500/50 transition-colors';
