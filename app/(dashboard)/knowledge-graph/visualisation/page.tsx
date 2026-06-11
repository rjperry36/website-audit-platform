'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Brain,
    FlaskConical,
    Play,
    Pause,
    SkipForward,
    Sparkles,
    Wallet,
    CalendarClock,
    Palette,
} from 'lucide-react';

// -------- Schema model ----------------------------------------------------

type Domain = 'brand' | 'agency' | 'work' | 'outcome';

type Node = {
    id: string;
    label: string;
    domain: Domain;
    x: number;
    y: number;
};

type Edge = { from: string; to: string };

type Scenario = {
    id: string;
    title: string;
    agent: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
    question: string;
    path: string[];
    answer: string;
};

const DOMAIN_COLOUR: Record<Domain, { fill: string; stroke: string; glow: string }> = {
    brand: { fill: '#c084fc', stroke: '#a855f7', glow: 'rgba(168,85,247,0.55)' },
    agency: { fill: '#67e8f9', stroke: '#06b6d4', glow: 'rgba(6,182,212,0.55)' },
    work: { fill: '#fbbf24', stroke: '#f59e0b', glow: 'rgba(245,158,11,0.55)' },
    outcome: { fill: '#6ee7b7', stroke: '#10b981', glow: 'rgba(16,185,129,0.55)' },
};

const NODES: Node[] = [
    // Brand cluster (left)
    { id: 'brand', label: 'Brand', domain: 'brand', x: 200, y: 220 },
    { id: 'persona', label: 'Persona', domain: 'brand', x: 110, y: 340 },
    { id: 'audience', label: 'Audience', domain: 'brand', x: 240, y: 410 },
    { id: 'product', label: 'Product', domain: 'brand', x: 300, y: 240 },
    { id: 'asset', label: 'Asset', domain: 'brand', x: 340, y: 120 },
    // Work cluster (centre)
    { id: 'campaign', label: 'Campaign', domain: 'work', x: 500, y: 220 },
    { id: 'execution', label: 'Execution', domain: 'work', x: 540, y: 360 },
    { id: 'market', label: 'Market', domain: 'work', x: 430, y: 420 },
    { id: 'channel', label: 'Channel', domain: 'work', x: 640, y: 220 },
    { id: 'approval', label: 'Approval', domain: 'work', x: 460, y: 480 },
    // Agency cluster (right)
    { id: 'agency', label: 'Agency', domain: 'agency', x: 820, y: 220 },
    { id: 'person', label: 'Person', domain: 'agency', x: 900, y: 360 },
    { id: 'skill', label: 'Skill', domain: 'agency', x: 800, y: 420 },
    { id: 'role', label: 'Role', domain: 'agency', x: 720, y: 240 },
    // Outcomes (bottom)
    { id: 'budget', label: 'Budget', domain: 'outcome', x: 360, y: 560 },
    { id: 'kpi', label: 'KPI', domain: 'outcome', x: 540, y: 620 },
    { id: 'contract', label: 'Contract', domain: 'outcome', x: 700, y: 560 },
];

const EDGES: Edge[] = [
    // Brand intra
    { from: 'brand', to: 'persona' },
    { from: 'brand', to: 'audience' },
    { from: 'brand', to: 'product' },
    { from: 'brand', to: 'asset' },
    { from: 'persona', to: 'audience' },
    { from: 'product', to: 'asset' },
    // Brand → Work
    { from: 'brand', to: 'campaign' },
    { from: 'asset', to: 'campaign' },
    { from: 'persona', to: 'campaign' },
    // Work intra
    { from: 'campaign', to: 'execution' },
    { from: 'campaign', to: 'channel' },
    { from: 'campaign', to: 'market' },
    { from: 'execution', to: 'market' },
    { from: 'execution', to: 'channel' },
    { from: 'execution', to: 'approval' },
    // Agency intra
    { from: 'agency', to: 'person' },
    { from: 'agency', to: 'role' },
    { from: 'person', to: 'skill' },
    { from: 'person', to: 'role' },
    // Agency → Work
    { from: 'person', to: 'execution' },
    { from: 'skill', to: 'execution' },
    { from: 'agency', to: 'campaign' },
    // Outcomes
    { from: 'execution', to: 'budget' },
    { from: 'campaign', to: 'budget' },
    { from: 'execution', to: 'contract' },
    { from: 'agency', to: 'contract' },
    { from: 'campaign', to: 'kpi' },
    { from: 'execution', to: 'kpi' },
    // Market-skill (geo expertise)
    { from: 'market', to: 'skill' },
];

const SCENARIOS: Scenario[] = [
    {
        id: 'staffing',
        title: 'Staff a new brief',
        agent: 'Briefing Assistant',
        icon: Sparkles,
        accent: 'from-pink-500 to-rose-500',
        question: 'Who should staff this new beauty campaign for Germany?',
        path: ['brand', 'campaign', 'market', 'skill', 'person'],
        answer: 'Recommended: Maja, Sven, Lena — relevant skills, available capacity, and prior Germany market experience.',
    },
    {
        id: 'budget',
        title: 'Read the P&L',
        agent: 'Budget Insight',
        icon: Wallet,
        accent: 'from-emerald-500 to-teal-500',
        question: 'Are we on budget across all Q3 executions?',
        path: ['campaign', 'execution', 'budget', 'contract'],
        answer: 'On budget: 14 · Over: 3 (UK eCRM driving the variance) · Under: 6 — net £42k under plan.',
    },
    {
        id: 'capacity',
        title: 'Forecast capacity',
        agent: 'Capacity Planner',
        icon: CalendarClock,
        accent: 'from-amber-500 to-orange-500',
        question: 'Do we have capacity for the September hero shoot?',
        path: ['campaign', 'execution', 'person', 'skill'],
        answer: '4 senior creatives free in week 36 — comfortably ahead of the planned start date.',
    },
    {
        id: 'brand-fit',
        title: 'Check brand fit',
        agent: 'Brand SME',
        icon: Palette,
        accent: 'from-violet-500 to-fuchsia-500',
        question: 'Does this concept fit the Ritual Rina persona?',
        path: ['campaign', 'asset', 'persona', 'audience'],
        answer: 'Strong fit (87%) — aligns with ritual cadence cues and the warm-neutral palette in her audience response set.',
    },
];

const NODE_BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n]));

// -------- Component -------------------------------------------------------

export default function VisualisationPage() {
    const [scenarioIndex, setScenarioIndex] = useState(0);
    const [step, setStep] = useState(0); // 0 = question only, 1..path.length = traversed, path.length+1 = answer
    const [playing, setPlaying] = useState(true);

    const scenario = SCENARIOS[scenarioIndex];
    const ScenarioIcon = scenario.icon;
    const maxStep = scenario.path.length + 1; // last step shows the answer

    useEffect(() => {
        if (!playing) return;
        const stepMs = step === 0 ? 1400 : step === maxStep ? 3200 : 900;
        const t = setTimeout(() => {
            if (step >= maxStep) {
                setScenarioIndex((i) => (i + 1) % SCENARIOS.length);
                setStep(0);
            } else {
                setStep((s) => s + 1);
            }
        }, stepMs);
        return () => clearTimeout(t);
    }, [step, scenarioIndex, playing, maxStep]);

    const activeNodes = useMemo(() => new Set(scenario.path.slice(0, Math.min(step, scenario.path.length))), [scenario, step]);
    const activeEdgeKeys = useMemo(() => {
        const keys = new Set<string>();
        const reached = Math.min(step, scenario.path.length);
        for (let i = 0; i < reached - 1; i++) {
            const a = scenario.path[i];
            const b = scenario.path[i + 1];
            keys.add(edgeKey(a, b));
        }
        return keys;
    }, [scenario, step]);

    const showAnswer = step >= maxStep;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold mb-3 uppercase tracking-wider">
                        <FlaskConical className="h-3.5 w-3.5" />
                        Sample data — demonstration only
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Brain className="h-7 w-7 text-violet-400" />
                        How our agents think
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Each pulse is a connection in the knowledge graph firing. When an agent answers a question, it traces a path through these connections — the bright trail below shows what that looks like in real time.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPlaying((p) => !p)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-white text-sm hover:bg-white/10 transition-colors"
                    >
                        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {playing ? 'Pause' : 'Play'}
                    </button>
                    <button
                        onClick={() => {
                            setStep(0);
                            setScenarioIndex((i) => (i + 1) % SCENARIOS.length);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-white text-sm hover:bg-white/10 transition-colors"
                    >
                        <SkipForward className="h-4 w-4" />
                        Next
                    </button>
                </div>
            </div>

            {/* Stage */}
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.15),transparent_60%)] pointer-events-none" />

                {/* Question banner */}
                <div className="relative z-10 px-6 sm:px-10 pt-8">
                    <div className="flex items-start gap-3">
                        <div className={`shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${scenario.accent} flex items-center justify-center shadow-lg`}>
                            <ScenarioIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                {scenario.agent}
                            </div>
                            <div className="text-lg sm:text-xl text-white font-medium leading-snug">
                                {scenario.question}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SVG */}
                <div className="relative z-10">
                    <svg
                        viewBox="0 0 1000 700"
                        className="w-full h-auto"
                        style={{ maxHeight: '640px' }}
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <defs>
                            {/* Ambient pulse style: short bright dash moving along long dim line */}
                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="b" />
                                <feMerge>
                                    <feMergeNode in="b" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                            <filter id="big-glow" x="-100%" y="-100%" width="300%" height="300%">
                                <feGaussianBlur stdDeviation="6" result="b" />
                                <feMerge>
                                    <feMergeNode in="b" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Edges — render dim base + ambient pulse + active overlay */}
                        <g>
                            {EDGES.map((e, i) => {
                                const a = NODE_BY_ID[e.from];
                                const b = NODE_BY_ID[e.to];
                                const k = edgeKey(e.from, e.to);
                                const isActive = activeEdgeKeys.has(k);
                                const d = curvePath(a, b, i);
                                return (
                                    <g key={k}>
                                        {/* Dim base */}
                                        <path
                                            d={d}
                                            stroke="rgba(148,163,184,0.18)"
                                            strokeWidth={1}
                                            fill="none"
                                        />
                                        {/* Ambient pulse */}
                                        <path
                                            d={d}
                                            stroke="rgba(167,139,250,0.7)"
                                            strokeWidth={1.5}
                                            fill="none"
                                            strokeLinecap="round"
                                            style={{
                                                strokeDasharray: '6 240',
                                                animation: `synapse-pulse ${3 + (i % 5)}s linear ${(i * 0.27) % 6}s infinite`,
                                                filter: 'url(#glow)',
                                            }}
                                        />
                                        {/* Active overlay */}
                                        {isActive && (
                                            <>
                                                <path
                                                    d={d}
                                                    stroke="rgba(255,255,255,0.95)"
                                                    strokeWidth={2.5}
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    style={{ filter: 'url(#big-glow)' }}
                                                />
                                                <path
                                                    d={d}
                                                    stroke="#fef3c7"
                                                    strokeWidth={3}
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    style={{
                                                        strokeDasharray: '10 200',
                                                        animation: 'synapse-fire 0.9s linear infinite',
                                                        filter: 'url(#big-glow)',
                                                    }}
                                                />
                                            </>
                                        )}
                                    </g>
                                );
                            })}
                        </g>

                        {/* Nodes */}
                        <g>
                            {NODES.map((n) => {
                                const c = DOMAIN_COLOUR[n.domain];
                                const isActive = activeNodes.has(n.id);
                                return (
                                    <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
                                        {/* Halo for active nodes */}
                                        {isActive && (
                                            <circle
                                                r={26}
                                                fill={c.glow}
                                                style={{ animation: 'halo-pulse 1.2s ease-in-out infinite' }}
                                            />
                                        )}
                                        <circle
                                            r={12}
                                            fill={c.fill}
                                            stroke={c.stroke}
                                            strokeWidth={isActive ? 3 : 1.5}
                                            style={{
                                                filter: isActive ? 'url(#big-glow)' : 'url(#glow)',
                                                transition: 'all 250ms ease',
                                            }}
                                        />
                                        {/* Inner dot */}
                                        <circle r={4} fill="white" opacity={isActive ? 0.95 : 0.6} />
                                        {/* Label */}
                                        <text
                                            y={30}
                                            textAnchor="middle"
                                            fill={isActive ? '#ffffff' : '#cbd5e1'}
                                            fontSize="13"
                                            fontWeight={isActive ? 600 : 500}
                                            style={{
                                                fontFamily: 'inherit',
                                                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                                                transition: 'all 250ms ease',
                                            }}
                                        >
                                            {n.label}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    </svg>
                </div>

                {/* Answer banner */}
                <div className="relative z-10 px-6 sm:px-10 pb-8 min-h-[80px]">
                    <div
                        className={`rounded-xl border bg-slate-900/70 backdrop-blur-sm px-4 py-3 transition-all duration-500 ${
                            showAnswer
                                ? 'border-emerald-500/40 opacity-100 translate-y-0'
                                : 'border-white/10 opacity-40 translate-y-2'
                        }`}
                    >
                        <div className="text-xs uppercase tracking-wider text-emerald-300 font-semibold mb-1">
                            {showAnswer ? 'Answer' : 'Reasoning…'}
                        </div>
                        <div className="text-white text-sm sm:text-base leading-relaxed">
                            {showAnswer
                                ? scenario.answer
                                : `Tracing ${scenario.path.slice(0, Math.min(step, scenario.path.length)).map((id) => NODE_BY_ID[id].label).join(' → ') || '…'}`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scenario selector + legend */}
            <div className="grid md:grid-cols-[1fr_280px] gap-6">
                <div>
                    <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-3">
                        Scenarios
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {SCENARIOS.map((s, i) => {
                            const Icon = s.icon;
                            const active = i === scenarioIndex;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => {
                                        setScenarioIndex(i);
                                        setStep(0);
                                    }}
                                    className={`text-left rounded-2xl border p-4 transition-all ${
                                        active
                                            ? 'border-white/30 bg-white/10'
                                            : 'border-white/10 bg-slate-900/50 hover:bg-slate-800/60 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${s.accent} flex items-center justify-center`}>
                                            <Icon className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                                            {s.agent}
                                        </div>
                                    </div>
                                    <div className="text-white font-semibold mb-1">{s.title}</div>
                                    <div className="text-xs text-slate-400 leading-relaxed">{s.question}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-3">
                        Legend
                    </h2>
                    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-3">
                        <LegendRow domain="brand" label="Brand layer" hint="Client identity, personas, products, assets" />
                        <LegendRow domain="agency" label="Agency layer" hint="People, skills, roles, departments" />
                        <LegendRow domain="work" label="Work layer" hint="Campaigns, executions, approvals, channels" />
                        <LegendRow domain="outcome" label="Commercial layer" hint="Budgets, contracts, KPIs" />
                    </div>
                </div>
            </div>

            {/* Keyframes */}
            <style jsx global>{`
                @keyframes synapse-pulse {
                    0% {
                        stroke-dashoffset: 246;
                    }
                    100% {
                        stroke-dashoffset: 0;
                    }
                }
                @keyframes synapse-fire {
                    0% {
                        stroke-dashoffset: 210;
                    }
                    100% {
                        stroke-dashoffset: 0;
                    }
                }
                @keyframes halo-pulse {
                    0%,
                    100% {
                        opacity: 0.35;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.7;
                        transform: scale(1.18);
                    }
                }
            `}</style>
        </div>
    );
}

function LegendRow({ domain, label, hint }: { domain: Domain; label: string; hint: string }) {
    const c = DOMAIN_COLOUR[domain];
    return (
        <div className="flex items-start gap-3">
            <div
                className="shrink-0 w-4 h-4 rounded-full mt-0.5"
                style={{ background: c.fill, boxShadow: `0 0 12px ${c.glow}` }}
            />
            <div>
                <div className="text-sm text-white font-medium">{label}</div>
                <div className="text-xs text-slate-400">{hint}</div>
            </div>
        </div>
    );
}

// -------- Geometry helpers -----------------------------------------------

function edgeKey(a: string, b: string) {
    return a < b ? `${a}__${b}` : `${b}__${a}`;
}

function curvePath(a: Node, b: Node, seed: number) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    // Curve bend perpendicular to line, sign alternating by seed
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len;
    const ny = dx / len;
    const bend = ((seed % 2 === 0 ? 1 : -1) * Math.min(60, len * 0.18));
    const cx = mx + nx * bend;
    const cy = my + ny * bend;
    return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}
