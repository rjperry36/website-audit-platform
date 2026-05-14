import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { getCampaignDetail, formatCurrency, variancePct, varianceClass } from '@/lib/kg/loader';

export default async function CampaignDetailPage({ params }: { params: { campaignId: string } }) {
    const campaignId = decodeURIComponent(params.campaignId);
    const detail = await getCampaignDetail(campaignId);
    if (!detail) notFound();

    const { campaign, executions, objectives, market_ids, channel_ids } = detail;

    return (
        <div className="space-y-6">
            <Link href="/knowledge-graph/campaigns" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm">
                <ArrowLeft className="h-4 w-4" /> Back to campaigns
            </Link>

            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-white">{campaign.properties.name}</h2>
                    <Badge variant="outline" className="text-[10px]">{campaign.properties.campaign_type.replace('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-neutral-300">{campaign.properties.summary}</p>
                <p className="text-xs text-neutral-500">
                    {campaign.properties.start_date} → {campaign.properties.end_date} · status: {campaign.properties.status}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="Executions" value={executions.length.toString()} />
                <MetricCard label="Budget planned" value={formatCurrency(campaign.properties.budget_planned)} />
                <MetricCard label="Budget actual" value={formatCurrency(campaign.properties.budget_actual)}
                    valueClass={varianceClass(campaign.properties.budget_planned, campaign.properties.budget_actual)} />
                <MetricCard label="Variance"
                    value={`${variancePct(campaign.properties.budget_planned, campaign.properties.budget_actual) > 0 ? '+' : ''}${variancePct(campaign.properties.budget_planned, campaign.properties.budget_actual)}%`}
                    valueClass={varianceClass(campaign.properties.budget_planned, campaign.properties.budget_actual)} />
            </div>

            {/* Scope */}
            <Card variant="elevated">
                <CardContent className="p-4 space-y-3">
                    <div>
                        <div className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Markets</div>
                        <div className="flex flex-wrap gap-1.5">
                            {market_ids.map((m) => (<Badge key={m} variant="outline" className="text-[10px]">{m.replace('market:', '')}</Badge>))}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Channels</div>
                        <div className="flex flex-wrap gap-1.5">
                            {channel_ids.map((c) => (<Badge key={c} variant="outline" className="text-[10px]">{c.replace('channel:', '')}</Badge>))}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Objectives</div>
                        <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-0.5">
                            {objectives.map((o: any) => (<li key={o.id}>{o.properties.name}</li>))}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Executions */}
            <section>
                <h3 className="text-base font-semibold text-white mb-2">Executions ({executions.length})</h3>
                <Card variant="elevated">
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b border-white/10 text-neutral-400 text-xs uppercase tracking-wide">
                                    <th className="px-4 py-3 font-medium">Execution</th>
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 font-medium">Market</th>
                                    <th className="px-4 py-3 font-medium">Channel</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium text-right">Planned</th>
                                    <th className="px-4 py-3 font-medium text-right">Actual</th>
                                    <th className="px-4 py-3 font-medium text-right">Var</th>
                                </tr>
                            </thead>
                            <tbody>
                                {executions.slice(0, 200).map((e) => (
                                    <tr key={e.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="px-4 py-3">
                                            <Link href={`/knowledge-graph/campaigns/${encodeURIComponent(campaign.id)}/${encodeURIComponent(e.id)}`} className="text-white hover:text-primary-300">
                                                {e.id.replace('execution:exec-', '')}
                                            </Link>
                                            <div className="text-xs text-neutral-500 mt-0.5 max-w-md truncate">{e.properties.summary}</div>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-300 text-xs">{e.properties.execution_type.replace('_', ' ')}</td>
                                        <td className="px-4 py-3 text-neutral-300">{e.market_label}</td>
                                        <td className="px-4 py-3 text-neutral-300">{e.channel_label}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={(e.properties.status === 'shipped' ? 'success' : e.properties.status === 'in_progress' ? 'warning' : 'default') as any} className="text-[10px]">{e.properties.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right text-neutral-300">{formatCurrency(e.properties.budget_planned)}</td>
                                        <td className="px-4 py-3 text-right text-white">{formatCurrency(e.properties.budget_actual)}</td>
                                        <td className={`px-4 py-3 text-right ${varianceClass(e.properties.budget_planned, e.properties.budget_actual)}`}>
                                            {variancePct(e.properties.budget_planned, e.properties.budget_actual) > 0 ? '+' : ''}{variancePct(e.properties.budget_planned, e.properties.budget_actual)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {executions.length > 200 && (
                            <div className="px-4 py-2 text-xs text-neutral-500 border-t border-white/5">
                                Showing first 200 of {executions.length} executions.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

function MetricCard({ label, value, valueClass = 'text-white' }: { label: string; value: string; valueClass?: string }) {
    return (
        <Card variant="elevated">
            <CardContent className="p-4">
                <div className="text-xs text-neutral-400 uppercase tracking-wide">{label}</div>
                <div className={`text-xl font-semibold mt-1 ${valueClass}`}>{value}</div>
            </CardContent>
        </Card>
    );
}
