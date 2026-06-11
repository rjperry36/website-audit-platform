'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CalendarDays, Building2, Briefcase, Users, Plane, Baby, GraduationCap, MapPin } from 'lucide-react';

interface Person {
    id: string;
    name: string;
    role_name: string;
    department_id: string;
    department_name: string;
    office: string;
    seniority: string;
    capacity_hours_per_week: number;
}
interface Block {
    id: string;
    person_id: string;
    start_date: string;
    end_date: string;
    allocation_pct: number;
    reason: string;
}
interface Department { id: string; name: string }

interface Props {
    people: Person[];
    blocks: Block[];
    departments: Department[];
    timelineStart: string;
    timelineEnd: string;
}

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function AvailabilityGantt({ people, blocks, departments, timelineStart, timelineEnd }: Props) {
    const [deptFilter, setDeptFilter] = useState<string | null>(null);
    const [officeFilter, setOfficeFilter] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const offices = useMemo(() => Array.from(new Set(people.map((p) => p.office))).sort(), [people]);

    const tlStart = useMemo(() => new Date(timelineStart).getTime(), [timelineStart]);
    const tlEnd = useMemo(() => new Date(timelineEnd).getTime(), [timelineEnd]);
    const tlSpanMs = tlEnd - tlStart;

    // Build month-column headers
    const months = useMemo(() => {
        const out: Array<{ label: string; year: number; monthIdx: number; startOffset: number; widthOffset: number }> = [];
        const start = new Date(timelineStart);
        const end = new Date(timelineEnd);
        let cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
        while (cur <= end) {
            const next = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1));
            const startOffset = ((cur.getTime() - tlStart) / tlSpanMs) * 100;
            const widthOffset = ((next.getTime() - cur.getTime()) / tlSpanMs) * 100;
            out.push({
                label: MONTHS[cur.getUTCMonth()],
                year: cur.getUTCFullYear(),
                monthIdx: cur.getUTCMonth(),
                startOffset,
                widthOffset,
            });
            cur = next;
        }
        return out;
    }, [timelineStart, timelineEnd, tlStart, tlSpanMs]);

    // Filtered people, grouped by department for visual separation
    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        const list = people.filter((p) => {
            if (deptFilter && p.department_id !== deptFilter) return false;
            if (officeFilter && p.office !== officeFilter) return false;
            if (q && !`${p.name} ${p.role_name}`.toLowerCase().includes(q)) return false;
            return true;
        });
        // Group by department in declared order
        const grouped: Array<{ department_id: string; department_name: string; people: Person[] }> = [];
        for (const d of departments) {
            const peopleInDept = list.filter((p) => p.department_id === d.id);
            if (peopleInDept.length > 0) grouped.push({ department_id: d.id, department_name: d.name, people: peopleInDept });
        }
        return grouped;
    }, [people, departments, deptFilter, officeFilter, search]);

    // Quick availability stats for "now" window (next 4 weeks from timeline start)
    const nowWindow = useMemo(() => {
        const start = new Date(timelineStart);
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 28);
        const startMs = start.getTime();
        const endMs = end.getTime();
        let availableCount = 0;
        let partialCount = 0;
        let blockedCount = 0;
        for (const p of people) {
            const personBlocks = blocks.filter((b) => b.person_id === p.id);
            let allocatedDays = 0;
            for (const b of personBlocks) {
                const bs = new Date(b.start_date).getTime();
                const be = new Date(b.end_date).getTime();
                const overlapStart = Math.max(bs, startMs);
                const overlapEnd = Math.min(be, endMs);
                if (overlapEnd < overlapStart) continue;
                const overlapDays = (overlapEnd - overlapStart) / 86400000 + 1;
                allocatedDays += overlapDays * (b.allocation_pct / 100);
            }
            const windowDays = (endMs - startMs) / 86400000;
            const pct = Math.max(0, 100 - Math.round((allocatedDays / windowDays) * 100));
            if (pct >= 70) availableCount++;
            else if (pct >= 30) partialCount++;
            else blockedCount++;
        }
        return { availableCount, partialCount, blockedCount };
    }, [people, blocks, timelineStart]);

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Total bench" value={people.length.toString()} icon={Users} />
                <Stat label="Available next 4 weeks" value={nowWindow.availableCount.toString()} icon={CalendarDays} valueClass="text-emerald-400" />
                <Stat label="Partially booked" value={nowWindow.partialCount.toString()} icon={Briefcase} valueClass="text-amber-400" />
                <Stat label="Heavily booked" value={nowWindow.blockedCount.toString()} icon={Plane} valueClass="text-red-400" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <input
                    type="text"
                    placeholder="Search name / role…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white text-sm rounded-md px-3 py-2 placeholder:text-neutral-500 focus:outline-none focus:border-primary-500/50 max-w-xs"
                />
                <select
                    value={deptFilter || ''}
                    onChange={(e) => setDeptFilter(e.target.value || null)}
                    className="bg-white/5 border border-white/10 text-white text-sm rounded-md px-3 py-2"
                >
                    <option value="">All departments</option>
                    {departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                </select>
                <select
                    value={officeFilter || ''}
                    onChange={(e) => setOfficeFilter(e.target.value || null)}
                    className="bg-white/5 border border-white/10 text-white text-sm rounded-md px-3 py-2"
                >
                    <option value="">All offices</option>
                    {offices.map((o) => (<option key={o} value={o}>{o}</option>))}
                </select>
                <Legend />
            </div>

            {/* Timeline */}
            <Card variant="elevated">
                <CardContent className="p-0">
                    {/* Month header */}
                    <div className="flex border-b border-white/10 text-xs">
                        <div className="w-56 flex-shrink-0 px-4 py-2 text-neutral-400 font-medium border-r border-white/10">Person</div>
                        <div className="flex-1 relative h-9">
                            {months.map((m, i) => (
                                <div
                                    key={`${m.year}-${m.monthIdx}`}
                                    className="absolute top-0 bottom-0 flex items-center justify-center text-neutral-400 border-l border-white/5"
                                    style={{ left: `${m.startOffset}%`, width: `${m.widthOffset}%` }}
                                >
                                    <span>{m.label}<span className="text-neutral-600 ml-1">{String(m.year).slice(-2)}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Body */}
                    <div className="max-h-[640px] overflow-y-auto">
                        {filtered.map((group) => (
                            <div key={group.department_id}>
                                {/* Department header */}
                                <div className="bg-white/[0.02] border-y border-white/5 px-4 py-1.5 text-[10px] uppercase tracking-wider text-neutral-500 font-medium sticky top-0">
                                    {group.department_name}
                                    <span className="text-neutral-600 ml-2">({group.people.length})</span>
                                </div>
                                {/* People rows */}
                                {group.people.map((p) => {
                                    const personBlocks = blocks.filter((b) => b.person_id === p.id);
                                    return (
                                        <div key={p.id} className="flex border-b border-white/5 hover:bg-white/[0.015]">
                                            <div className="w-56 flex-shrink-0 px-4 py-2 border-r border-white/10">
                                                <div className="text-sm text-white truncate">{p.name}</div>
                                                <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                                                    <span className="truncate">{p.role_name}</span>
                                                    <span className="text-neutral-700">·</span>
                                                    <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                                                    <span>{p.office}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 relative h-12">
                                                {/* Vertical month dividers (decorative) */}
                                                {months.map((m) => (
                                                    <div
                                                        key={`${p.id}-${m.year}-${m.monthIdx}`}
                                                        className="absolute top-0 bottom-0 border-l border-white/5"
                                                        style={{ left: `${m.startOffset}%` }}
                                                    />
                                                ))}
                                                {/* Block bars */}
                                                {personBlocks.map((b) => {
                                                    const bs = new Date(b.start_date).getTime();
                                                    const be = new Date(b.end_date).getTime();
                                                    if (be < tlStart || bs > tlEnd) return null;
                                                    const clampedStart = Math.max(bs, tlStart);
                                                    const clampedEnd = Math.min(be, tlEnd);
                                                    const left = ((clampedStart - tlStart) / tlSpanMs) * 100;
                                                    const width = ((clampedEnd - clampedStart) / tlSpanMs) * 100;
                                                    return (
                                                        <BlockBar
                                                            key={b.id}
                                                            block={b}
                                                            left={left}
                                                            width={width}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="text-center text-sm text-neutral-500 py-12">No people match these filters.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function BlockBar({ block, left, width }: { block: Block; left: number; width: number }) {
    const pct = block.allocation_pct;
    const isFull = pct >= 100;
    const isHigh = pct >= 70 && pct < 100;
    const isPartial = pct < 70;

    const colour = isFull
        ? 'bg-red-500/60 border-red-500/70'
        : isHigh
            ? 'bg-amber-500/55 border-amber-500/65'
            : 'bg-blue-500/45 border-blue-500/60';

    const reason = block.reason || 'Unavailable';
    const icon = reasonIcon(reason);

    return (
        <div
            className={cn(
                'absolute top-1.5 bottom-1.5 rounded border px-1.5 text-[10px] text-white truncate flex items-center gap-1 cursor-default',
                colour,
            )}
            style={{ left: `${left}%`, width: `${width}%` }}
            title={`${reason} · ${block.start_date} → ${block.end_date} · ${pct}% allocation`}
        >
            {icon}
            <span className="truncate">{reason}</span>
        </div>
    );
}

function reasonIcon(reason: string) {
    const r = reason.toLowerCase();
    if (r.includes('vacation') || r.includes('holiday')) return <Plane className="h-3 w-3 flex-shrink-0" />;
    if (r.includes('parental') || r.includes('maternity') || r.includes('paternity')) return <Baby className="h-3 w-3 flex-shrink-0" />;
    if (r.includes('training') || r.includes('conference') || r.includes('summit') || r.includes('lions') || r.includes('searchlove') || r.includes('litmus') || r.includes('pmp')) return <GraduationCap className="h-3 w-3 flex-shrink-0" />;
    if (r.includes('on ')) return <Briefcase className="h-3 w-3 flex-shrink-0" />;
    if (r.includes('sabbatical')) return <Plane className="h-3 w-3 flex-shrink-0" />;
    return <Building2 className="h-3 w-3 flex-shrink-0" />;
}

function Stat({ label, value, icon: Icon, valueClass = 'text-white' }: { label: string; value: string; icon: any; valueClass?: string }) {
    return (
        <Card variant="elevated">
            <CardContent className="p-3 flex items-center gap-3">
                <Icon className="h-4 w-4 text-neutral-500" />
                <div>
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wide">{label}</div>
                    <div className={cn('text-xl font-semibold mt-0.5', valueClass)}>{value}</div>
                </div>
            </CardContent>
        </Card>
    );
}

function Legend() {
    return (
        <div className="ml-auto flex items-center gap-3 text-[10px] text-neutral-400">
            <div className="flex items-center gap-1.5">
                <span className="w-3 h-2.5 rounded bg-red-500/60 border border-red-500/70" /> Fully out
            </div>
            <div className="flex items-center gap-1.5">
                <span className="w-3 h-2.5 rounded bg-amber-500/55 border border-amber-500/65" /> 70–99% booked
            </div>
            <div className="flex items-center gap-1.5">
                <span className="w-3 h-2.5 rounded bg-blue-500/45 border border-blue-500/60" /> Partial &lt;70%
            </div>
        </div>
    );
}
