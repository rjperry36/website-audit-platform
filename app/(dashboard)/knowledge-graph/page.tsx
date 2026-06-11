import Link from 'next/link';
import {
    Network,
    Brain,
    Activity,
    Sparkles,
    Users,
    Megaphone,
    BarChart3,
    ArrowRight,
    FlaskConical,
} from 'lucide-react';

export default function KgOverviewPage() {
    return (
        <div className="space-y-12 pb-16">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-violet-950/40 p-8 sm:p-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_50%),radial-gradient(circle_at_80%_60%,rgba(168,85,247,0.18),transparent_50%)] pointer-events-none" />
                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold mb-6 uppercase tracking-wider">
                        <FlaskConical className="h-3.5 w-3.5" />
                        Sample data — demonstration only
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                        The Knowledge Graph
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-200 leading-relaxed mb-3">
                        Think of it as a map of how everything in our agency connects — every client brand, every person, every campaign, every budget, every approval — all linked together so the platform (and our AI agents) can see the whole picture at once.
                    </p>
                    <p className="text-base text-slate-400 leading-relaxed">
                        Today this page shows a fictional brand called <span className="text-white font-medium">Aurelune</span> run by a fictional agency called <span className="text-white font-medium">Halo &amp; Helix</span>. It's a worked example so you can see what's possible — no real client data is shown here yet.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/knowledge-graph/visualisation"
                            className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow"
                        >
                            <Brain className="h-5 w-5" />
                            See how our agents think
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/knowledge-graph/brand"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/15 bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
                        >
                            Explore the data
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why a KG — three pillars */}
            <section>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Why a knowledge graph?</h2>
                    <p className="text-slate-400 max-w-3xl">
                        Most agencies keep client brands, people, budgets and campaigns in separate spreadsheets and tools. A knowledge graph stitches them together so the relationships become the data — and that's what lets AI actually reason about your business instead of just summarising it.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                    <Pillar
                        icon={Network}
                        accent="indigo"
                        title="Connected, not siloed"
                        body="Every person is linked to their skills, their availability, the campaigns they've worked on and the budgets they're attached to. Every campaign is linked to a client brand, a market, a channel, an approval trail and a cost ledger. Nothing lives in isolation."
                    />
                    <Pillar
                        icon={Brain}
                        accent="violet"
                        title="Built for reasoning"
                        body="Because everything is linked, an AI agent can answer questions by following the connections — who has the right skills and is free next month, which campaigns are running over budget and why, how a brief should be staffed given the brand's history. Not just search — actual reasoning."
                    />
                    <Pillar
                        icon={Activity}
                        accent="emerald"
                        title="Always current"
                        body="As people change teams, budgets shift, campaigns finish and approvals close, the graph updates. Every agent sees the same live picture, so a recommendation in the briefing tool reflects the same reality as a dashboard in finance."
                    />
                </div>
            </section>

            {/* Explore */}
            <section>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Explore the sample dataset</h2>
                    <p className="text-slate-400 max-w-3xl">
                        Four ways into the same graph. Each view filters the connections by what you care about right now.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ExploreCard
                        href="/knowledge-graph/brand"
                        icon={Sparkles}
                        accent="pink"
                        title="Brand"
                        body="Positioning, tone of voice, personas, audiences, products and visual assets — the client side of the graph."
                    />
                    <ExploreCard
                        href="/knowledge-graph/agency"
                        icon={Users}
                        accent="cyan"
                        title="Agency"
                        body="Departments, roles, people with skills, channel and category experience, daily rates and capacity — the delivery side."
                    />
                    <ExploreCard
                        href="/knowledge-graph/campaigns"
                        icon={Megaphone}
                        accent="amber"
                        title="Campaigns"
                        body="Global campaigns, local executions, localised assets, channel and market routing, approval trails — the work itself."
                    />
                    <ExploreCard
                        href="/knowledge-graph/insights"
                        icon={BarChart3}
                        accent="emerald"
                        title="Insights"
                        body="Budget variance by market, schedule slip, approval cycle time, capacity utilisation — what the graph tells us when you read across it."
                    />
                </div>
            </section>
        </div>
    );
}

const ACCENTS: Record<string, { bg: string; ring: string; text: string }> = {
    indigo: { bg: 'bg-indigo-500/15', ring: 'border-indigo-500/30', text: 'text-indigo-300' },
    violet: { bg: 'bg-violet-500/15', ring: 'border-violet-500/30', text: 'text-violet-300' },
    emerald: { bg: 'bg-emerald-500/15', ring: 'border-emerald-500/30', text: 'text-emerald-300' },
    pink: { bg: 'bg-pink-500/15', ring: 'border-pink-500/30', text: 'text-pink-300' },
    cyan: { bg: 'bg-cyan-500/15', ring: 'border-cyan-500/30', text: 'text-cyan-300' },
    amber: { bg: 'bg-amber-500/15', ring: 'border-amber-500/30', text: 'text-amber-300' },
};

function Pillar({
    icon: Icon,
    accent,
    title,
    body,
}: {
    icon: React.ComponentType<{ className?: string }>;
    accent: keyof typeof ACCENTS;
    title: string;
    body: string;
}) {
    const a = ACCENTS[accent];
    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
            <div className={`w-11 h-11 rounded-xl ${a.bg} ${a.ring} border flex items-center justify-center mb-4`}>
                <Icon className={`h-5 w-5 ${a.text}`} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
        </div>
    );
}

function ExploreCard({
    href,
    icon: Icon,
    accent,
    title,
    body,
}: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: keyof typeof ACCENTS;
    title: string;
    body: string;
}) {
    const a = ACCENTS[accent];
    return (
        <Link
            href={href}
            className="group block rounded-2xl border border-white/10 bg-slate-900/50 p-5 hover:bg-slate-800/60 hover:border-white/20 transition-colors"
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${a.bg} ${a.ring} border flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${a.text}`} />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
        </Link>
    );
}
