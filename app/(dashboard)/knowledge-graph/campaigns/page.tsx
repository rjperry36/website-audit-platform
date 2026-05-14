import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCampaigns, getExecutionsEnriched, formatCurrency, variancePct, varianceClass } from '@/lib/kg/loader';

export default async function CampaignsPage() {
    const [campaigns, executions] = await Promise.all([
        getCampaigns(),
        getExecutionsEnriched(),
    ]);

    const executionsByCampaign = new Map<string, number>();
    const actualByCampaign = new Map<string, number>();
    const plannedByCampaign = new Map<string, number>();
    for (const e of executions) {
        if (!e.campaign_id) continue;
        executionsByCampaign.set(e.campaign_id, (executionsByCampaign.get(e.campaign_id) || 0) + 1);
        actualByCampaign.set(e.campaign_id, (actualByCampaign.get(e.campaign_id) || 0) + e.properties.budget_actual);
        plannedByCampaign.set(e.campaign_id, (plannedByCampaign.get(e.campaign_id) || 0) + e.properties.budget_planned);
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Campaigns" value={campaigns.length.toString()} />
                <Stat label="Executions" value={executions.length.toString()} />
                <Stat label="Shipped" value={executions.filter((e) => e.properties.status === 'shipped').length.toString()} />
                <Stat label="In progress" value={executions.filter((e) => e.properties.status === 'in_progress').length.toString()} />
            </div>

            <Card variant="elevated">
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-white/10 text-neutral-400 text-xs uppercase tracking-wide">
                                <th className="px-4 py-3 font-medium">Campaign</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">Dates</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Executions</th>
                                <th className="px-4 py-3 font-medium text-right">Budget</th>
                                <th className="px-4 py-3 font-medium text-right">Actual</th>
                                <th className="px-4 py-3 font-medium text-right">Var</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map((c) => {
                                const planned = c.properties.budget_planned;
                                const actual = c.properties.budget_actual;
                                return (
                                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="px-4 py-3">
                                            <Link href={`/knowledge-graph/campaigns/${encodeURIComponent(c.id)}`} className="text-white hover:text-primary-300 font-medium">
                                                {c.properties.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className="text-[10px]">{c.properties.campaign_type.replace('_', ' ')}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-300 text-xs whitespace-nowrap">
                                            {c.properties.start_date} → {c.properties.end_date}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={c.properties.status} />
                                        </td>
                                        <td className="px-4 py-3 text-right text-neutral-300">
                                            {executionsByCampaign.get(c.id) || 0}
                                        </td>
                                        <td className="px-4 py-3 text-right text-neutral-300">{formatCurrency(planned)}</td>
                                        <td className="px-4 py-3 text-right text-white">{formatCurrency(actual)}</td>
                                        <td className={`px-4 py-3 text-right font-medium ${varianceClass(planned, actual)}`}>
                                            {variancePct(planned, actual) > 0 ? '+' : ''}{variancePct(planned, actual)}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <Card variant="elevated">
            <CardContent className="p-4">
                <div className="text-xs text-neutral-400 uppercase tracking-wide">{label}</div>
                <div className="text-2xl font-semibold text-white mt-1">{value}</div>
            </CardContent>
        </Card>
    );
}

function StatusBadge({ status }: { status: string }) {
    const variant = status === 'shipped' ? 'success' : status === 'in_progress' ? 'warning' : 'default';
    return <Badge variant={variant as any} className="text-[10px]">{status.replace('_', ' ')}</Badge>;
}
