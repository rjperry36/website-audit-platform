'use client'

import { INITIATIVE_CONFIG } from "@/lib/initiatives";
import { Check } from "lucide-react";
import clsx from "clsx";

interface TimelineFilterProps {
    selectedTypes: string[];
    onToggle: (type: string) => void;
    onSelectAll: () => void;
    onClearAll: () => void;
}

export const TimelineFilter = ({ selectedTypes, onToggle, onSelectAll, onClearAll }: TimelineFilterProps) => {
    // Only show the core types (uppercase keys) to avoid legacy duplicates
    const availableTypes = Object.entries(INITIATIVE_CONFIG).filter(([key]) => key === key.toUpperCase());

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm font-medium text-neutral-400 mr-2">Filter:</span>

            <button
                onClick={onSelectAll}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/5"
            >
                All
            </button>
            <button
                onClick={onClearAll}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors mr-4 border border-white/5"
            >
                Clear
            </button>

            {availableTypes.map(([type, config]) => {
                const isSelected = selectedTypes.includes(type);

                return (
                    <button
                        key={type}
                        onClick={() => onToggle(type)}
                        className={clsx(
                            "pl-2 pr-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all duration-200 border",
                            isSelected
                                ? "text-white opacity-100 scale-100 shadow-sm"
                                : "text-neutral-500 bg-transparent opacity-60 scale-95 grayscale hover:grayscale-0 hover:opacity-80 border-white/10"
                        )}
                        style={{
                            backgroundColor: isSelected ? config.color : 'transparent',
                            borderColor: isSelected ? 'rgba(255,255,255,0.2)' : undefined
                        }}
                    >
                        {isSelected ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current opacity-50" />}
                        {config.label}
                    </button>
                );
            })}
        </div>
    );
};
