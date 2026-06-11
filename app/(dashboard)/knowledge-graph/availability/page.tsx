import { getPeopleEnriched, getAvailability, getDepartments } from '@/lib/kg/loader';
import { AvailabilityGantt } from './availability-gantt';

export const metadata = {
    title: 'Availability | Knowledge Graph',
    description: 'Who is booked, when, and why — across the agency bench.',
};

export default async function AvailabilityPage() {
    const [people, blocks, departments] = await Promise.all([
        getPeopleEnriched(),
        getAvailability(),
        getDepartments(),
    ]);

    // Timeline: 12 months starting from "now" (May 2026)
    const startDate = '2026-06-01';
    const endDate = '2027-05-31';

    return (
        <div className="space-y-4">
            <div className="text-xs text-neutral-500">
                Forward-looking availability across the agency bench. Bars show vacations, parental leave, training, conferences,
                and existing campaign allocations. The Briefing Assistant uses this data to filter team picks for any new brief.
            </div>
            <AvailabilityGantt
                people={people.map((p) => ({
                    id: p.id,
                    name: p.properties.name,
                    role_name: p.role_name,
                    department_id: p.properties.department_id,
                    department_name: p.department_name,
                    office: p.properties.office,
                    seniority: p.properties.seniority,
                    capacity_hours_per_week: p.properties.capacity_hours_per_week,
                }))}
                blocks={blocks.map((b) => ({
                    id: b.id,
                    person_id: b.properties.person_id,
                    start_date: b.properties.start_date,
                    end_date: b.properties.end_date,
                    allocation_pct: b.properties.allocation_pct,
                    reason: b.properties.reason || '—',
                }))}
                departments={departments.map((d) => ({ id: d.id, name: d.properties.name }))}
                timelineStart={startDate}
                timelineEnd={endDate}
            />
        </div>
    );
}
