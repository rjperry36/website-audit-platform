import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPeopleEnriched, getDepartments, formatCurrency } from '@/lib/kg/loader';
import { PeopleDirectory } from './people-directory';

export default async function AgencyPage() {
    const [people, departments] = await Promise.all([
        getPeopleEnriched(),
        getDepartments(),
    ]);

    // Headcount by department
    const headcountByDept = departments.map((d) => ({
        id: d.id,
        name: d.properties.name,
        count: people.filter((p) => p.properties.department_id === d.id).length,
    }));

    // Aggregate stats
    const totalDailyRate = people.reduce((sum, p) => sum + p.properties.daily_rate_gbp, 0);
    const avgSeniority = {
        director: people.filter((p) => p.properties.seniority === 'director').length,
        lead: people.filter((p) => p.properties.seniority === 'lead').length,
        senior: people.filter((p) => p.properties.seniority === 'senior').length,
        mid: people.filter((p) => p.properties.seniority === 'mid').length,
        junior: people.filter((p) => p.properties.seniority === 'junior').length,
    };

    return (
        <div className="space-y-8">
            {/* Top-line stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card variant="elevated">
                    <CardContent className="p-4">
                        <div className="text-xs text-neutral-400 uppercase tracking-wide">Headcount</div>
                        <div className="text-2xl font-semibold text-white mt-1">{people.length}</div>
                    </CardContent>
                </Card>
                <Card variant="elevated">
                    <CardContent className="p-4">
                        <div className="text-xs text-neutral-400 uppercase tracking-wide">Departments</div>
                        <div className="text-2xl font-semibold text-white mt-1">{departments.length}</div>
                    </CardContent>
                </Card>
                <Card variant="elevated">
                    <CardContent className="p-4">
                        <div className="text-xs text-neutral-400 uppercase tracking-wide">Avg daily rate</div>
                        <div className="text-2xl font-semibold text-white mt-1">{formatCurrency(Math.round(totalDailyRate / people.length))}</div>
                    </CardContent>
                </Card>
                <Card variant="elevated">
                    <CardContent className="p-4">
                        <div className="text-xs text-neutral-400 uppercase tracking-wide">Directors / Leads</div>
                        <div className="text-2xl font-semibold text-white mt-1">{avgSeniority.director + avgSeniority.lead}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Department breakdown */}
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">By department</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {headcountByDept.map((d) => (
                        <Card key={d.id} variant="elevated">
                            <CardContent className="p-3">
                                <div className="text-xs text-neutral-400 uppercase tracking-wide">{d.name}</div>
                                <div className="text-xl font-semibold text-white mt-1">{d.count}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* People directory */}
            <section>
                <h2 className="text-lg font-semibold text-white mb-3">People directory</h2>
                <PeopleDirectory people={people} />
            </section>
        </div>
    );
}
