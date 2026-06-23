import { Card, CardContent } from '@/components/ui/card';
import { Metadata } from 'next';
import {
    Sparkles, Target, Banknote, PieChart, Calendar, Truck, Workflow, Users, Bot,
    Gauge, ShieldAlert, Brain, Network,
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Methodology | Knowledge Graph',
    description: 'The algorithms, equations and rules behind every Briefing Assistant output.',
};

function Section({ icon: Icon, title, answers, children }: { icon: any; title: string; answers: string; children: React.ReactNode }) {
    return (
        <Card variant="elevated">
            <CardContent className="p-5">
                <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary-400" />
                    <h2 className="text-base font-semibold text-white">{title}</h2>
                </div>
                <p className="text-xs text-neutral-500 mt-1 mb-3">{answers}</p>
                <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">{children}</div>
            </CardContent>
        </Card>
    );
}

function Eq({ children }: { children: React.ReactNode }) {
    return <div className="rounded-md bg-black/30 border border-white/10 px-3 py-2 font-mono text-[12px] text-neutral-200 overflow-x-auto">{children}</div>;
}

function Inputs({ items }: { items: string[] }) {
    return (
        <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 mr-1 mt-0.5">Reads</span>
            {items.map((i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400 font-mono">{i}</span>
            ))}
        </div>
    );
}

export default function MethodologyPage() {
    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary-300 bg-primary-500/10 border border-primary-500/30 rounded px-2 py-0.5 mb-2">
                    <Network className="h-3 w-3" /> How it thinks
                </div>
                <h1 className="text-2xl font-semibold text-white">Briefing Assistant — Methodology</h1>
                <p className="text-sm text-neutral-400 mt-2 max-w-2xl">
                    Every recommendation is produced by <span className="text-white">one</span> retrieval-augmented agent in three phases:
                    <span className="text-white"> Retrieve</span> (read the knowledge graph), <span className="text-white">Analyse</span> (deterministic
                    scoring and statistics — the maths below, no LLM), then <span className="text-white">Reason</span> (a single gpt-4o call that turns the
                    evidence into the written recommendation). This page documents the exact inputs, equations and rules behind each output so the
                    "thinking" is fully auditable. Constants shown are the live values in <span className="font-mono text-neutral-300">lib/agents/briefing-assistant.ts</span>.
                </p>
            </div>

            <Section icon={Target} title="1. Comparable campaigns" answers="Which past work is this brief most like?">
                <p>Every campaign across <span className="text-white">all clients</span> is scored on how much it overlaps the brief, then the top 10 are kept. Same-client work is weighted higher, but strong cross-client analogues still surface — the agency learns from its whole book.</p>
                <Eq>score = (market_overlap × 3 + channel_overlap × 2) × recency × sameBrand<br />recency = 1 if started within 2 years, else 0.5<br />sameBrand = 1.5 if same client, else 1.0</Eq>
                <p>market_overlap / channel_overlap = count of the brief's markets / channels that the campaign also ran. Campaigns with score 0 are dropped; the rest are sorted desc and the top 10 retained.</p>
                <Inputs items={['campaigns', 'executions→market/channel', 'campaign→brand (COMMISSIONED_BY)']} />
            </Section>

            <Section icon={Banknote} title="2. Budget — prediction & alert" answers="How much should this cost, and is the hint right?">
                <p>The range is grounded in comparable <span className="text-white">actual</span> spend (not plan), because actuals already embed how this kind of work historically over- or under-ran. Benchmarks computed across the comparable set:</p>
                <Eq>actual P25 / P75 = 25th / 75th percentile of comparable actuals<br />avgVariancePct = mean( (actual − planned) / planned × 100 )   // + = over plan<br />overrunSharePct = % of comparables with variance &gt; +2%</Eq>
                <p>The recommended range comes from the model, anchored on those actuals and the brief's scope. A deterministic <span className="text-white">alert</span> then compares the range midpoint to the brief's budget hint:</p>
                <Eq>mid = (low + high) / 2<br />mid &gt; hint × 1.10  → INCREASE  (brief looks under-budgeted)<br />mid &lt; hint × 0.90  → REDUCE   (saving opportunity)<br />otherwise            → ALIGNED<br />+ over/under-run note from avgVariancePct (±5% threshold)</Eq>
                <p>So if similar work consistently ran over, the tool cautions to increase; if the agency delivers it efficiently, it suggests trimming — rather than blindly matching the hint.</p>
                <Inputs items={['campaign budget_planned/actual', 'cost-lines', 'media-spend']} />
            </Section>

            <Section icon={PieChart} title="3. Budget composition" answers="Where does the money actually go?">
                <p>Comparable-campaign spend is decomposed from the real cost ledger:</p>
                <Eq>cost_line_amount = units × unit_cost × (1 + markup_pct)<br />labour      = Σ fee_time lines<br />production  = Σ production_cost lines<br />localisation= Σ localisation_cost lines<br />media       = Σ media-spend actual_spend<br />ai          = Σ agent-usage cost_gbp<br />each %      = component / (labour+production+localisation+media+ai)</Eq>
                <p>Labour is further split by agency department via each fee_time line's role → department.</p>
                <Inputs items={['cost-lines (line_type, units, unit_cost, markup)', 'media-spend', 'agent-usage', 'roles→departments']} />
            </Section>

            <Section icon={Calendar} title="4. Timeline & approvals" answers="How long do sign-offs really take?">
                <p>From approval steps on executions in the brief's markets × channels:</p>
                <Eq>internalAvg / clientAvg = mean(actual_duration_days) per gate<br />internalSlipPct = % of internal gates &gt; 5 planned days<br />clientSlipPct   = % of client gates &gt; 3 planned days</Eq>
                <Inputs items={['approval-steps (gate, planned/actual duration)', 'executions']} />
            </Section>

            <Section icon={Truck} title="5. Delivery dynamics & the relay" answers="How long does delivery take, and in what sequence?">
                <p>Per in-scope channel, from past executions (calendar days = actual_end − actual_start; person-days from time-tracking hours ÷ 8):</p>
                <Eq>median_calendar_days = median(actual_end − actual_start)<br />avg_slip_days = mean( actual_duration − planned_duration )<br />on_time_pct = % of executions with slip ≤ 0<br />median_person_days = median( Σ actual_hours per execution ÷ 8 )</Eq>
                <p>The <span className="text-white">relay</span> is the repeatable stage sequence — global asset creation → localisation → local campaign — with the median duration and the cost-dominant department per stage. Expected end-to-end:</p>
                <Eq>expected_weeks_low  = round( Σ relay median_days / 7 )<br />expected_weeks_high = round( Σ relay median_days × 1.3 / 7 )   // +30% slip buffer</Eq>
                <Inputs items={['executions (planned/actual dates, type)', 'time-tracking (actual_hours)', 'cost-lines→department']} />
            </Section>

            <Section icon={Users} title="6. Team selection (people)" answers="Who from the bench fits, and are they free?">
                <p>Every person is scored on fit to the brief:</p>
                <Eq>score = channelMatch × 2 + categoryMatch × 2 + skillMatch × 1.5<br />channelMatch  = Σ years in the brief's channels<br />categoryMatch = Σ years in the brand's category (skincare for Aurelune, apparel/wellness for Kestrel)<br />skillMatch    = Σ proficiency in skills mapped from the brief's channels</Eq>
                <p>Top 15 form the shortlist. <span className="text-white">Availability</span> in the brief window is the dominant practical filter:</p>
                <Eq>available_pct = 100 − (allocated days in window ÷ window days × 100)<br />&lt; 30% → not proposed   ·   30–69% → supporting only   ·   ≥ 70% → any role</Eq>
                <p><span className="text-white">Hard staffing guarantee:</span> execution-heavy in-scope channels (Event, POSM, OOH) are force-included in the shortlist and, if the model still omits one, a specialist is added in code. If <span className="text-white">no internal specialist is available</span>, it becomes an outsourcing risk instead (see §10).</p>
                <Inputs items={['people + skills (HAS_SKILL)', 'channel/category experience (EXPERIENCED_IN)', 'availability', 'time-tracking (overload)']} />
            </Section>

            <Section icon={Bot} title="7. AI agents (the hybrid bench)" answers="Which agent fits, at what cost?">
                <p>Agents are scored on the same axes as people and carry real historical usage:</p>
                <Eq>agent_score = channel_fit × 2 + skill_fit<br />channel_fit = Σ channel suitability (1–5) for the brief's channels<br />skill_fit   = Σ proficiency (1–5) in mapped skills<br />avg_cost/execution = Σ cost_gbp ÷ executions used (from agent-usage)</Eq>
                <p>Agents bill per token (or per seat for Copilot) and are always available — so they are also the default mitigation for capacity / coverage gaps.</p>
                <Inputs items={['agents (skills, channels, pricing)', 'agent-usage (tokens, cost)']} />
            </Section>

            <Section icon={Sparkles} title="8. Man-days saved (per agent)" answers="What human effort does an agent displace?">
                <Eq>man_days_saved = min( 60, personDays × execsCovered × 0.4 )<br />personDays   = median person-days for the agent's best-fit channel<br />execsCovered = clamp( duration_weeks ÷ 4, 1, 6 )<br />displacement = 0.4 (an agent first-drafts ~40%; humans review/finish)<br />human_equiv_gbp = man_days_saved × blended bench day-rate</Eq>
                <p>The ceiling (60) and 0.4 displacement keep the claim defensible rather than implying an agent replaces whole teams.</p>
                <Inputs items={['delivery person-days', 'candidate day-rates']} />
            </Section>

            <Section icon={Gauge} title="9. Confidence" answers="How well-grounded is this recommendation?">
                <p>Confidence measures <span className="text-white">match quality</span>, not data volume (raw counts saturate once the book is large). Core signal:</p>
                <Eq>matchQuality = avg over top-5 comparables of<br />   ( min(market_overlap,M)/M + min(channel_overlap,C)/C ) / 2 × 100<br />   where M,C = # markets, channels in the brief</Eq>
                <Eq>budget   = 0.6 × matchQuality + 0.4 × spreadTightness × 100<br />   spreadTightness = 1 − (P75 − P25) / median actual<br />timeline = 0.6 × matchQuality + 0.4 × avg channel on-time %<br />team     = mean of the model's per-person match scores<br />overall  = 0.35×matchQuality + 0.2×budget + 0.2×timeline + 0.2×team + 5×sameClientShare</Eq>
                <Eq>label: ≥ 75 high · 50–74 medium · &lt; 50 low</Eq>
                <Inputs items={['comparable overlaps', 'budget spread', 'delivery on-time', 'team match scores']} />
            </Section>

            <Section icon={ShieldAlert} title="10. Risks & resource gaps" answers="What could go wrong, and how do we cover it?">
                <p>Risks combine two sources, capped at 6:</p>
                <p><span className="text-white">Deterministic resource-gap risks (first).</span> For each in-scope channel where no internal specialist is available in the window:</p>
                <Eq>specialists_available == 0  →  RISK "Resource gap — &lt;channel&gt;"<br />   specialists_total == 0  → severity HIGH  (no bench at all)<br />   else                    → severity MEDIUM (all booked)<br />   mitigation → outsource to a freelancer / specialist partner</Eq>
                <p><span className="text-white">Model risks (gpt-4o).</span> Schedule, capacity, budget-mismatch, timing, coherence and thin-signal risks — each with a concrete mitigation, constrained to the brief's own markets. Channel coverage itself: ≥2 available = ok · 1 = thin · 0 = none.</p>
                <Inputs items={['channel coverage (available/bench)', 'availability', 'approval slip rates', 'overload weeks']} />
            </Section>

            <Section icon={Brain} title="11. The reasoning step (gpt-4o)" answers="What does the LLM actually decide?">
                <p>All of the above is computed deterministically and assembled into a grounded prompt. A single <span className="font-mono text-neutral-300">gpt-4o</span> call (temperature 0.2, JSON output, streamed) then writes the recommendation — choosing the team mix, wording the rationales and risks, and citing specific campaigns/people. It cannot invent people or campaigns: it must pick from the candidate lists, and numeric guardrails (e.g. budget sanity repair) correct format slips. Token usage is reported live and exactly.</p>
                <Inputs items={['the assembled context above', 'gpt-4o (stream + usage)']} />
            </Section>

            <p className="text-xs text-neutral-600 pt-2">
                Source of truth: <span className="font-mono">lib/agents/briefing-assistant.ts</span>. This page is documentation — if the code changes, update it here too.
            </p>
        </div>
    );
}
