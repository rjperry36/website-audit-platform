
import React from 'react'
import { BriefObjective, StandardObjective } from '@/lib/planner-types'
import { Plus, Trash2, Sparkles } from 'lucide-react'

interface ObjectiveListProps {
    objectives: BriefObjective[];
    standardObjectives?: StandardObjective[];
    onChange: (objectives: BriefObjective[]) => void;
}

export function ObjectiveList({ objectives, standardObjectives = [], onChange }: ObjectiveListProps) {
    const addObjective = (base?: StandardObjective) => {
        const newObjective: BriefObjective = {
            id: `obj_${Date.now()}`,
            objective: base?.label || '',
            kpi: base?.default_kpi || '',
            target: base?.default_target || ''
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
                <div className="flex gap-2">
                    {/* Standard Objectives Quick Add */}
                    {standardObjectives.length > 0 && (
                        <div className="flex gap-1">
                            {standardObjectives.slice(0, 3).map(std => (
                                <button
                                    key={std.id}
                                    type="button"
                                    onClick={() => addObjective(std)}
                                    className="text-[10px] px-2 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 hover:bg-primary-500/20 transition-colors"
                                >
                                    + {std.label}
                                </button>
                            ))}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => addObjective()}
                        className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors ml-2"
                    >
                        <Plus className="h-3 w-3" />
                        Custom
                    </button>
                </div>
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
                    <div className="text-center py-6 border border-dashed border-white/10 rounded-lg text-neutral-500 text-sm flex flex-col items-center justify-center gap-2">
                        <span>No objectives added yet.</span>
                        {standardObjectives.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-sm">
                                {standardObjectives.map(std => (
                                    <button
                                        key={std.id}
                                        type="button"
                                        onClick={() => addObjective(std)}
                                        className="flex items-center gap-1 text-xs px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-neutral-300 transition-colors"
                                    >
                                        <Sparkles className="h-3 w-3 text-yellow-500" />
                                        {std.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
