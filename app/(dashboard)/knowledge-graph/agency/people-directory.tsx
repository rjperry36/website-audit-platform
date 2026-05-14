'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type EnrichedPerson = {
    id: string;
    properties: {
        name: string;
        department_id: string;
        seniority: string;
        office: string;
        daily_rate_gbp: number;
        client_markup_pct: number;
        capacity_hours_per_week: number;
        start_date: string;
    };
    department_name: string;
    role_name: string;
    skills: Array<{ skill_id: string; skill_name: string; skill_domain: string; proficiency: number }>;
    channel_experience: Array<{ channel_id: string; channel_label: string; years: number }>;
    category_experience: Array<{ category_id: string; category_name: string; years: number }>;
};

const SENIORITY_ORDER = ['director', 'lead', 'senior', 'mid', 'junior'];

export function PeopleDirectory({ people }: { people: EnrichedPerson[] }) {
    const [query, setQuery] = useState('');
    const [seniorityFilter, setSeniorityFilter] = useState<string | null>(null);
    const [officeFilter, setOfficeFilter] = useState<string | null>(null);
    const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const offices = Array.from(new Set(people.map((p) => p.properties.office)));
    const departments = Array.from(new Set(people.map((p) => p.department_name)));

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        return people.filter((p) => {
            if (seniorityFilter && p.properties.seniority !== seniorityFilter) return false;
            if (officeFilter && p.properties.office !== officeFilter) return false;
            if (departmentFilter && p.department_name !== departmentFilter) return false;
            if (q) {
                const hay = [
                    p.properties.name,
                    p.role_name,
                    p.department_name,
                    ...p.skills.map((s) => s.skill_name),
                    ...p.channel_experience.map((c) => c.channel_label),
                    ...p.category_experience.map((c) => c.category_name),
                ].join(' ').toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [people, query, seniorityFilter, officeFilter, departmentFilter]);

    const selected = selectedId ? people.find((p) => p.id === selectedId) : null;

    return (
        <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search by name, skill, channel, category…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="bg-white/5 border border-white/10 text-white text-sm rounded-md px-3 py-2 placeholder:text-neutral-500 focus:outline-none focus:border-primary-500/50 max-w-xs flex-1 min-w-[200px]"
                    />
                    <select
                        value={seniorityFilter || ''}
                        onChange={(e) => setSeniorityFilter(e.target.value || null)}
                        className="bg-white/5 border border-white/10 text-white text-sm rounded-md px-3 py-2"
                    >
                        <option value="">All seniorities</option>
                        {SENIORITY_ORDER.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                    <select
                        value={officeFilter || ''}
                        onChange={(e) => setOfficeFilter(e.target.value || null)}
                        className="bg-white/5 border border-white/10 text-white text-sm rounded-md px-3 py-2"
                    >
                        <option value="">All offices</option>
                        {offices.map((o) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                    <select
                        value={departmentFilter || ''}
                        onChange={(e) => setDepartmentFilter(e.target.value || null)}
                        className="bg-white/5 border border-white/10 text-white text-sm rounded-md px-3 py-2"
                    >
                        <option value="">All departments</option>
                        {departments.map((d) => (<option key={d} value={d}>{d}</option>))}
                    </select>
                    <span className="text-xs text-neutral-400 ml-2">{filtered.length} of {people.length}</span>
                </div>

                {/* List */}
                <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-2">
                    {filtered.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedId(p.id)}
                            className={cn(
                                'w-full text-left bg-white/[0.02] hover:bg-white/[0.05] border rounded-lg px-4 py-3 transition-colors',
                                selectedId === p.id ? 'border-primary-500/60' : 'border-white/5',
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">{p.properties.name}</span>
                                        <Badge variant="outline" className="text-[10px]">{p.properties.seniority}</Badge>
                                    </div>
                                    <div className="text-xs text-neutral-400 mt-0.5">
                                        {p.role_name} · {p.department_name} · {p.properties.office}
                                    </div>
                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                        {p.skills.slice(0, 3).map((s) => (
                                            <Badge key={s.skill_id} variant="outline" className="text-[10px] normal-case">
                                                {s.skill_name} <span className="text-neutral-500 ml-1">{s.proficiency}/5</span>
                                            </Badge>
                                        ))}
                                        {p.skills.length > 3 && (
                                            <span className="text-[10px] text-neutral-500">+{p.skills.length - 3}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right text-xs text-neutral-400 whitespace-nowrap">
                                    £{p.properties.daily_rate_gbp}/day
                                    <div className="text-[10px] text-neutral-500">{p.properties.capacity_hours_per_week}h/wk</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Detail panel */}
            <Card variant="elevated" className="lg:sticky lg:top-4 lg:max-h-[720px] lg:overflow-y-auto">
                <CardContent className="p-5">
                    {!selected ? (
                        <div className="text-sm text-neutral-400">Select a person to see their full profile.</div>
                    ) : (
                        <div className="space-y-5">
                            <div>
                                <div className="text-lg font-semibold text-white">{selected.properties.name}</div>
                                <div className="text-sm text-neutral-400">{selected.role_name}</div>
                                <div className="text-xs text-neutral-500 mt-1">{selected.department_name} · {selected.properties.office}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <Stat label="Seniority" value={selected.properties.seniority} />
                                <Stat label="Start date" value={selected.properties.start_date} />
                                <Stat label="Daily rate" value={`£${selected.properties.daily_rate_gbp}`} />
                                <Stat label="Client markup" value={`${(selected.properties.client_markup_pct * 100).toFixed(0)}%`} />
                                <Stat label="Billed rate" value={`£${Math.round(selected.properties.daily_rate_gbp * (1 + selected.properties.client_markup_pct))}`} />
                                <Stat label="Capacity" value={`${selected.properties.capacity_hours_per_week}h/wk`} />
                            </div>

                            <div>
                                <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Skills</div>
                                <div className="space-y-1.5">
                                    {selected.skills.map((s) => (
                                        <div key={s.skill_id} className="flex items-center justify-between text-sm">
                                            <span className="text-neutral-200">{s.skill_name}</span>
                                            <ProficiencyDots value={s.proficiency} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Channel experience</div>
                                <div className="space-y-1.5">
                                    {selected.channel_experience.map((c) => (
                                        <div key={c.channel_id} className="flex items-center justify-between text-sm">
                                            <span className="text-neutral-200">{c.channel_label}</span>
                                            <span className="text-neutral-400 text-xs">{c.years}y</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Category experience</div>
                                <div className="space-y-1.5">
                                    {selected.category_experience.map((c) => (
                                        <div key={c.category_id} className="flex items-center justify-between text-sm">
                                            <span className="text-neutral-200">{c.category_name}</span>
                                            <span className="text-neutral-400 text-xs">{c.years}y</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
            <div className="text-white">{value}</div>
        </div>
    );
}

function ProficiencyDots({ value }: { value: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <div
                    key={n}
                    className={cn('w-2 h-2 rounded-full', n <= value ? 'bg-primary-400' : 'bg-white/10')}
                />
            ))}
        </div>
    );
}
