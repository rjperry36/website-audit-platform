import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    getExecutionsEnriched,
    getApprovalSteps,
    getTimeTracking,
    getPeople,
    getPeopleEnriched,
    getMarkets,
    getChannels,
    formatCurrency,
} from '@/lib/kg/loader';

export default async function InsightsPage() {
    const [executions, approvals, timeEntries, people, peopleEnriched, markets, channels] = await Promise.all([
        getExecutionsEnriched(),
        getApprovalSteps(),
        getTimeTracking(),
        getPeople(),
        getPeopleEnriched(),
        getMarkets(),
        getChannels(),
    ]);

    // --- 1. Budget variance by market ---
    const byMarket: Record<string, { under: number; on: number; over: number; total: number; planned: number; actual: number }> = {};
    for (const e of executions) {
        if (!e.market_id) continue;
        const key = e.market_label || e.market_id;
        byMarket[key] = byMarket[key] || { under: 0, on: 0, over: 0, total: 0, planned: 0, actual: 0 };
        const v = (e.properties.budget_actual - e.properties.budget_planned) / e.properties.budget_planned;
        if (v < -0.02) byMarket[key].under++;
        else if (v <= 0.04) byMarket[key].on++;
        else byMarket[key].over++;
        byMarket[key].total++;
        byMarket[key].planned += e.properties.budget_planned;
        byMarket[key].actual += e.properties.budget_actual;
    }

    // --- 2. Schedule slip distribution ---
    const slipBuckets = { onTime: 0, slip1to3: 0, slip4to7: 0, slip8plus: 0 };
    for (const e of executions) {
        const pe = new Date(e.properties.planned_end);
        const ae = new Date(e.properties.actual_end);
        const slip = Math.round((ae.getTime() - pe.getTime()) / 86400000);
        if (slip <= 0) slipBuckets.onTime++;
        else if (slip <= 3) slipBuckets.slip1to3++;
        else if (slip <= 7) slipBuckets.slip4to7++;
        else slipBuckets.slip8plus++;
    }

    // --- 3. Approval time by gate ---
    const approvalStats = { internal: { planned: 0, actual: 0, count: 0 }, client: { planned: 0, actual: 0, count: 0 } };
    for (const a of approvals) {
        const k = a.properties.gate === 'internal_review' ? 'internal' : 'client';
        approvalStats[k].planned += a.properties.planned_duration_days;
        approvalStats[k].actual += a.properties.actual_duration_days;
        approvalStats[k].count++;
    }
    const approvalSlipBuckets = { onTime: 0, slip1to2: 0, slip3to5: 0, slip6plus: 0 };
    for (const a of approvals) {
        const slip = a.properties.actual_duration_days - a.properties.planned_duration_days;
        if (slip <= 0) approvalSlipBuckets.onTime++;
        else if (slip <= 2) approvalSlipBuckets.slip1to2++;
        else if (slip <= 5) approvalSlipBuckets.slip3to5++;
        else approvalSlipBuckets.slip6plus++;
    }

    // --- 4. Capacity overload — top 10 most-overloaded ---
    const overloadByPerson = new Map<string, number>();
    const hoursByPersonWeek = new Map<string, number>();
    for (const t of timeEntries) {
        const key = `${t.person_id}|${t.week_starting}`;
        hoursByPersonWeek.set(key, (hoursByPersonWeek.get(key) || 0) + parseFloat(t.actual_hours || '0'));
    }
    const peopleById = new Map(people.map((p) => [p.id, p]));
    for (const [key, hours] of hoursByPersonWeek) {
        const personId = key.split('|')[0];
        const p = peopleById.get(personId);
        if (!p) continue;
        if (hours > p.properties.capacity_hours_per_week * 1.25) {
            overloadByPerson.set(personId, (overloadByPerson.get(personId) || 0) + 1);
        }
    }
    const topOverloaded = Array.from(overloadByPerson.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id, weeks]) => ({ id, weeks, name: peopleById.get(id)?.properties.name || id }));

    // --- 5. Skills coverage — for each channel, count people with experience ≥ 3 years ---
    const skillsCoverage = channels.map((c) => {
        const eligible = peopleEnriched.filter((p) => {
            const ce = p.channel_experience.find((ch) => ch.channel_id === c.id);
            return ce && ce.years >= 3;
        });
        return {
            channel_id: c.id,
            label: c.properties.label,
            count: eligible.length,
            senior_plus: eligible.filter((p) => ['senior', 'lead', 'director'].includes(p.properties.seniority)).length,
        };
    }).sort((a, b) => b.count - a.count);

    // --- Totals for top of page ---
    const totalPlanned = executions.reduce((s, e) => s + e.properties.budget_planned, 0);
    const totalActual = executions.reduce((s, e) => s + e.properties.budget_actual, 0);
    const overallVarPct = ((totalActual - totalPlanned) / totalPlanned * 100).toFixed(1);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Executions analysed" value={executions.length.toString()} />
                <Stat label="Total planned" value={formatCurrency(totalPlanned)} />
                <Stat label="Total actual" value={formatCurrency(totalActual)} />
                <Stat label="Overall variance" value={`${parseFloat(overallVarPct) > 0 ? '+' : ''}${overallVarPct}%`} valueClass={parseFloat(overallVarPct) > 4 ? 'text-amber-400' : 'text-emerald-400'} />
            </div>

            {/* Budget variance by market */}
            <section>
                <h2 className="text-lg font-semibold text-white mb-1">Budget variance by market</h2>
                <p className="text-xs text-neutral-500 mb-3">Distribution of executions per market — under / on / over budget. Hover ratios.</p>
                <Card variant="elevated">
                    <CardContent className="p-4 space-y-3">
                        {Object.entries(byMarket).sort(([, a], [, b]) => b.total - a.total).map(([market, d]) => (
                            <div key={market}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm text-white">{market}</span>
                                    <span className="text-xs text-neutral-400">
                                        {d.total} execs · planned {formatCurrency(d.planned)} → actual {formatCurrency(d.actual)}
                                    </span>
                                </div>
                                <div className="flex h-4 rounded overflow-hidden">
                                    <div className="bg-emerald-500/70 flex items-center justify-center text-[10px] text-emerald-50" style={{ width: `${(d.under / d.total) * 100}%` }} title={`${d.under} under`}>
                                        {d.under > 0 && d.under}
                                    </div>
                                    <div className="bg-neutral-500/70 flex items-center justify-center text-[10px] text-neutral-50" style={{ width: `${(d.on / d.total) * 100}%` }} title={`${d.on} on`}>
                                        {d.on > 0 && d.on}
                                    </div>
                                    <div className="bg-red-500/70 flex items-center justify-center text-[10px] text-red-50" style={{ width: `${(d.over / d.total) * 100}%` }} title={`${d.over} over`}>
                                        {d.over > 0 && d.over}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Legend items={[
                            { label: 'Under (≤ −2%)', color: 'bg-emerald-500/70' },
                            { label: 'On (−2% to +4%)', color: 'bg-neutral-500/70' },
                            { label: 'Over (> +4%)', color: 'bg-red-500/70' },
                        ]} />
                    </CardContent>
                </Card>
            </section>

            {/* Schedule slip */}
            <section>
                <h2 className="text-lg font-semibold text-white mb-1">Schedule slip distribution</h2>
                <p className="text-xs text-neutral-500 mb-3">Days late vs planned end. Across all executions.</p>
                <Card variant="elevated">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-4 gap-3">
                            <BucketBar label="On time" value={slipBuckets.onTime} total={executions.length} colour="bg-emerald-500/70" />
                            <BucketBar label="1–3 days" value={slipBuckets.slip1to3} total={executions.length} colour="bg-neutral-500/70" />
                            <BucketBar label="4–7 days" value={slipBuckets.slip4to7} total={executions.length} colour="bg-amber-500/70" />
                            <BucketBar label="8+ days" value={slipBuckets.slip8plus} total={executions.length} colour="bg-red-500/70" />
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Approval timing */}
            <section>
                <h2 className="text-lg font-semibold text-white mb-1">Approval timing</h2>
                <p className="text-xs text-neutral-500 mb-3">
                    Internal review planned 5d / client review planned 3d. Actuals show whether those targets hold up.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <Card variant="elevated">
                        <CardContent className="p-4">
                            <div className="text-sm text-white font-medium mb-2">Internal review (5d planned)</div>
                            <div className="text-3xl font-semibold text-white">
                                {(approvalStats.internal.actual / approvalStats.internal.count).toFixed(1)}<span className="text-base text-neutral-400 ml-1">days avg</span>
                            </div>
                            <div className="text-xs text-neutral-400 mt-1">
                                +{((approvalStats.internal.actual - approvalStats.internal.planned) / approvalStats.internal.count).toFixed(1)} days over planned
                            </div>
                        </CardContent>
                    </Card>
                    <Card variant="elevated">
                        <CardContent className="p-4">
                            <div className="text-sm text-white font-medium mb-2">Client review (3d planned)</div>
                            <div className="text-3xl font-semibold text-white">
                                {(approvalStats.client.actual / approvalStats.client.count).toFixed(1)}<span className="text-base text-neutral-400 ml-1">days avg</span>
                            </div>
                            <div className="text-xs text-neutral-400 mt-1">
                                +{((approvalStats.client.actual - approvalStats.client.planned) / approvalStats.client.count).toFixed(1)} days over planned
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card variant="elevated" className="mt-3">
                    <CardContent className="p-4">
                        <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Slip distribution (both gates)</div>
                        <div className="grid grid-cols-4 gap-3">
                            <BucketBar label="On time" value={approvalSlipBuckets.onTime} total={approvals.length} colour="bg-emerald-500/70" />
                            <BucketBar label="1–2 days" value={approvalSlipBuckets.slip1to2} total={approvals.length} colour="bg-neutral-500/70" />
                            <BucketBar label="3–5 days" value={approvalSlipBuckets.slip3to5} total={approvals.length} colour="bg-amber-500/70" />
                            <BucketBar label="6+ days" value={approvalSlipBuckets.slip6plus} total={approvals.length} colour="bg-red-500/70" />
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Capacity overload */}
            <section>
                <h2 className="text-lg font-semibold text-white mb-1">Capacity overload — top 10</h2>
                <p className="text-xs text-neutral-500 mb-3">
                    Person-weeks where logged hours exceeded contracted capacity by &gt;25%. The capacity-planning agent will use this to forecast risk.
                </p>
                <Card variant="elevated">
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b border-white/10 text-neutral-400 text-xs uppercase tracking-wide">
                                    <th className="px-4 py-2 font-medium">Person</th>
                                    <th className="px-4 py-2 font-medium text-right">Overload weeks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topOverloaded.map((o) => (
                                    <tr key={o.id} className="border-b border-white/5">
                                        <td className="px-4 py-2 text-white">{o.name}</td>
                                        <td className="px-4 py-2 text-right text-red-400 font-medium">{o.weeks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </section>

            {/* Skills coverage */}
            <section>
                <h2 className="text-lg font-semibold text-white mb-1">Channel coverage — people with ≥3 years experience</h2>
                <p className="text-xs text-neutral-500 mb-3">
                    The staffing-optimisation agent's pool size per channel. Senior+ count shown separately.
                </p>
                <Card variant="elevated">
                    <CardContent className="p-4 space-y-2">
                        {skillsCoverage.map((s) => (
                            <div key={s.channel_id} className="flex items-center gap-3">
                                <div className="w-32 text-sm text-neutral-300 truncate">{s.label}</div>
                                <div className="flex-1 flex items-center gap-2">
                                    <div className="flex-1 bg-white/5 rounded h-5 overflow-hidden">
                                        <div className="bg-primary-500/60 h-full" style={{ width: `${Math.min((s.count / 12) * 100, 100)}%` }} />
                                    </div>
                                    <div className="text-xs text-neutral-300 w-32 text-right">
                                        {s.count} total · <span className="text-emerald-400">{s.senior_plus} senior+</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

function Stat({ label, value, valueClass = 'text-white' }: { label: string; value: string; valueClass?: string }) {
    return (
        <Card variant="elevated">
            <CardContent className="p-4">
                <div className="text-xs text-neutral-400 uppercase tracking-wide">{label}</div>
                <div className={`text-2xl font-semibold mt-1 ${valueClass}`}>{value}</div>
            </CardContent>
        </Card>
    );
}

function BucketBar({ label, value, total, colour }: { label: string; value: number; total: number; colour: string }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div>
            <div className="text-xs text-neutral-400 mb-1">{label}</div>
            <div className="text-xl font-semibold text-white">{value}</div>
            <div className="text-xs text-neutral-500 mb-1.5">{pct}%</div>
            <div className="h-2 bg-white/5 rounded overflow-hidden">
                <div className={cn('h-full', colour)} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function Legend({ items }: { items: Array<{ label: string; color: string }> }) {
    return (
        <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-neutral-400">
            {items.map((i) => (
                <div key={i.label} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-sm ${i.color}`} />
                    {i.label}
                </div>
            ))}
        </div>
    );
}
