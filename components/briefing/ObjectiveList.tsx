
'use client'

import React from 'react'
import { BriefObjective } from '@/lib/planner-types'
import { Plus, Trash2 } from 'lucide-react'

interface ObjectiveListProps {
    objectives: BriefObjective[];
    onChange: (objectives: BriefObjective[]) => void;
}

export function ObjectiveList({ objectives, onChange }: ObjectiveListProps) {
    const addObjective = () => {
        const newObjective: BriefObjective = {
            id: `obj_${Date.now()}`,
            objective: '',
            kpi: '',
            target: ''
        };
        onChange([...objectives, newObjective]);
    };

    const removeObjective = (id: string) => {
        onChange(objectives.filter(obj => obj.id !== id));
    };

    const updateObjective = (id: string, field: keyof BriefObjective, value: string) => {
        onChange(objectives.map(obj =>
            obj.id === id ? { ...obj, [field]: value } : obj
        ));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-neutral-300">
                    Objectives & KPIs
                </label>
                <button
                    type="button"
                    onClick={addObjective}
                    className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                    <Plus className="h-3 w-3" />
                    Add Objective
                </button>
            </div>

            <div className="space-y-3">
                {objectives.map((obj, index) => (
                    <div key={obj.id} className="glass p-4 rounded-lg border border-white/5 space-y-3 relative group">
                        <button
                            type="button"
                            onClick={() => removeObjective(obj.id)}
                            className="absolute top-2 right-2 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>

                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">Objective</label>
                            <input
                                type="text"
                                value={obj.objective}
                                onChange={(e) => updateObjective(obj.id, 'objective', e.target.value)}
                                placeholder="e.g. Increase brand awareness"
                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-primary-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">KPI</label>
                                <input
                                    type="text"
                                    value={obj.kpi}
                                    onChange={(e) => updateObjective(obj.id, 'kpi', e.target.value)}
                                    placeholder="e.g. Impressions"
                                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">Target</label>
                                <input
                                    type="text"
                                    value={obj.target}
                                    onChange={(e) => updateObjective(obj.id, 'target', e.target.value)}
                                    placeholder="e.g. 1M"
                                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-primary-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {objectives.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-white/10 rounded-lg text-neutral-500 text-sm">
                        No objectives added yet.
                    </div>
                )}
            </div>
        </div>
    );
}
