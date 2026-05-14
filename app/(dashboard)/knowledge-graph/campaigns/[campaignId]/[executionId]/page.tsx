import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Users, CheckCircle2, Image as ImageIcon, Banknote } from 'lucide-react';
import { getExecutionDetail, formatCurrency, variancePct, varianceClass } from '@/lib/kg/loader';

export default async function ExecutionDetailPage({ params }: { params: { campaignId: string; executionId: string } }) {
    const executionId = decodeURIComponent(params.executionId);
    const campaignId = decodeURIComponent(params.campaignId);
    const detail = await getExecutionDetail(executionId);
    if (!detail) notFound();

    const { execution, approvals, assets, cost_lines, time_entries, media_spend, staffing, totals } = detail;

    return (
        <div className="space-y-6">
            <Link href={`/knowledge-graph/campaigns/${encodeURIComponent(campaignId)}`} className="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm">
                <ArrowLeft className="h-4 w-4" /> Back to campaign
            </Link>

            <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-lg font-semibold text-white">{execution.id.replace('execution:exec-', '')}</h2>
                    <Badge variant="outline" className="text-[10px]">{execution.properties.execution_type.replace('_', ' ')}</Badge>
                    <Badge variant={(execution.properties.status === 'shipped' ? 'success' : execution.properties.status === 'in_progress' ? 'warning' : 'default') as any} className="text-[10px]">
                        {execution.properties.status}
                    </Badge>
                </div>
                <p className="text-sm text-neutral-300">{execution.properties.summary}</p>
                <p className="text-xs text-neutral-500">
                    Campaign: <Link href={`/knowledge-graph/campaigns/${encodeURIComponent(campaignId)}`} className="text-primary-300 hover:underline">{execution.campaign_name}</Link>
                    {' · '}Market: {execution.market_label} · Channel: {execution.channel_label} · Lead: {execution.lead_name}
                </p>
            </div>

            {/* Top metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Metric icon={Calendar} label="Planned" value={`${execution.properties.planned_start} → ${execution.properties.planned_end}`} />
                <Metric icon={Calendar} label="Actual" value={`${execution.properties.actual_start} → ${execution.properties.actual_end}`} />
                <Metric icon={Banknote} label="Budget" value={`${formatCurrency(execution.properties.budget_planned)} → ${formatCurrency(execution.properties.budget_actual)}`}
                    sub={`${variancePct(execution.properties.budget_planned, execution.properties.budget_actual) > 0 ? '+' : ''}${variancePct(execution.properties.budget_planned, execution.properties.budget_actual)}%`}
                    subClass={varianceClass(execution.properties.budget_planned, execution.properties.budget_actual)} />
                <Metric icon={Users} label="Staffing" value={`${staffing.length} people`} sub={`${Math.round(totals.actual_hours)}h logged`} />
                <Metric icon={ImageIcon} label="Assets" value={`${assets.length}`} />
            </div>

            {/* Approvals */}
            <section>
                <h3 className="text-base font-semibold text-white mb-2">Approvals</h3>
                <div className="grid md:grid-cols-2 gap-3">
                    {approvals.map((a: any) => {
                        const variance = a.actual_duration_days - a.planned_duration_days;
                        return (
                            <Card key={a.id} variant="elevated">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                            <span className="font-medium text-white text-sm">{a.gate.replace('_', ' ')}</span>
                                        </div>
                                        <Badge variant={a.status === 'approved' ? 'success' : 'default'} className="text-[10px]">{a.status}</Badge>
                                    </div>
                                    <dl className="text-xs space-y-1">
                                        <Row label="Approver" value={a.approver_name || '—'} />
                                        <Row label="Planned" value={`${a.planned_duration_days} working days`} />
                                        <Row label="Actual" value={`${a.actual_duration_days} working days`}
                                            valueClass={variance > 4 ? 'text-red-400' : variance > 0 ? 'text-amber-400' : 'text-emerald-400'} />
                                        <Row label="Outcome" value={a.outcome || '—'} />
                                    </dl>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* Staffing */}
            <section>
                <h3 className="text-base font-semibold text-white mb-2">Staffing</h3>
                <Card variant="elevated">
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b border-white/10 text-neutral-400 text-xs uppercase tracking-wide">
                                    <th className="px-4 py-2 font-medium">Person</th>
                                    <th className="px-4 py-2 font-medium text-right">Days</th>
                                    <th className="px-4 py-2 font-medium text-right">Rate</th>
                                    <th className="px-4 py-2 font-medium text-right">Billed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffing.map((s: any) => (
                                    <tr key={s.person_id} className="border-b border-white/5">
                                        <td className="px-4 py-2 text-white">{s.person_name}</td>
                                        <td className="px-4 py-2 text-right text-neutral-300">{s.days}</td>
                                        <td className="px-4 py-2 text-right text-neutral-300">£{s.rate}</td>
                                        <td className="px-4 py-2 text-right text-white">{formatCurrency(s.billed)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-white/10">
                                    <td className="px-4 py-2 text-neutral-400 text-xs uppercase tracking-wide">Total billed</td>
                                    <td colSpan={2} />
                                    <td className="px-4 py-2 text-right text-white font-semibold">{formatCurrency(totals.cost_billed)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </CardContent>
                </Card>
            </section>

            {/* Cost lines */}
            {cost_lines.length > 0 && (
                <section>
                    <h3 className="text-base font-semibold text-white mb-2">Cost lines ({cost_lines.length})</h3>
                    <Card variant="elevated">
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b border-white/10 text-neutral-400 text-xs uppercase tracking-wide">
                                        <th className="px-4 py-2 font-medium">Type</th>
                                        <th className="px-4 py-2 font-medium">Person</th>
                                        <th className="px-4 py-2 font-medium text-right">Units</th>
                                        <th className="px-4 py-2 font-medium text-right">Unit cost</th>
                                        <th className="px-4 py-2 font-medium text-right">Markup</th>
                                        <th className="px-4 py-2 font-medium">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cost_lines.map((c: any) => (
                                        <tr key={c.cost_line_id} className="border-b border-white/5">
                                            <td className="px-4 py-2 text-neutral-300 text-xs">{c.line_type}</td>
                                            <td className="px-4 py-2 text-neutral-300 text-xs">{c.person_id?.replace('person:', '') || '—'}</td>
                                            <td className="px-4 py-2 text-right text-neutral-300">{c.units}</td>
                                            <td className="px-4 py-2 text-right text-neutral-300">£{c.unit_cost}</td>
                                            <td className="px-4 py-2 text-right text-neutral-300">{Math.round(parseFloat(c.markup_pct) * 100)}%</td>
                                            <td className="px-4 py-2 text-neutral-400 text-xs">{c.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* Media spend */}
            {media_spend.length > 0 && (
                <section>
                    <h3 className="text-base font-semibold text-white mb-2">Media spend</h3>
                    <Card variant="elevated">
                        <CardContent className="p-4 space-y-2">
                            {media_spend.map((m: any) => (
                                <div key={m.media_spend_id} className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-300">{m.platform} ({m.channel_id.replace('channel:', '')})</span>
                                    <span className="text-white">{formatCurrency(parseFloat(m.actual_spend))} <span className="text-neutral-500 text-xs">(planned {formatCurrency(parseFloat(m.planned_spend))})</span></span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* Assets produced */}
            {assets.length > 0 && (
                <section>
                    <h3 className="text-base font-semibold text-white mb-2">Assets produced</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                        {assets.slice(0, 9).map((a: any) => (
                            <Card key={a.id} variant="elevated">
                                <CardContent className="p-3">
                                    <div className="text-xs text-neutral-300 truncate">{a.properties.name}</div>
                                    <div className="text-[10px] text-neutral-500 font-mono mt-1">{a.id}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function Metric({ icon: Icon, label, value, sub, subClass = 'text-neutral-400' }: { icon: any; label: string; value: string; sub?: string; subClass?: string }) {
    return (
        <Card variant="elevated">
            <CardContent className="p-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-neutral-400">
                    <Icon className="h-3 w-3" />
                    {label}
                </div>
                <div className="text-sm text-white mt-1 break-words">{value}</div>
                {sub && <div className={`text-xs mt-0.5 ${subClass}`}>{sub}</div>}
            </CardContent>
        </Card>
    );
}

function Row({ label, value, valueClass = 'text-neutral-200' }: { label: string; value: string; valueClass?: string }) {
    return (
        <div className="flex justify-between">
            <dt className="text-neutral-500">{label}</dt>
            <dd className={valueClass}>{value}</dd>
        </div>
    );
}
