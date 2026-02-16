
import React from 'react';
import { PlannerEvent } from '@/lib/planner-data';
import { INITIATIVE_CONFIG } from '@/lib/initiatives'; // Correct casing as per initiatives.ts

interface PlanningMarkerProps {
    event: PlannerEvent;
    viewStartWeek: number;
    hoveredProjectId: string | null;
    onHoverProject: (id: string | null) => void;
}

export const PlanningMarker = ({ event, viewStartWeek, hoveredProjectId, onHoverProject }: PlanningMarkerProps) => {

    // Calculate grid position
    // Week 8 is viewStartWeek (e.g. index 1)
    // If event starts week 10 -> col = 10 - 8 + 1 = 3
    const gridColumnStart = event.startWeek - viewStartWeek + 1;

    // Get style config
    // We need to handle potential case mismatch
    const typeKey = event.type.toUpperCase();
    const config = INITIATIVE_CONFIG[event.type] || INITIATIVE_CONFIG[typeKey] || { color: '#6B7280', label: event.type };

    // Opacity logic
    const isHoveredProject = hoveredProjectId === event.projectId;
    // If ANY project is hovered, dim others unless this is the one
    const isDimmed = hoveredProjectId && !isHoveredProject;

    return (
        <div
            className={`
                relative h-8 flex items-center justify-center transition-all duration-300 group cursor-pointer
                ${isDimmed ? 'opacity-30 blur-[1px]' : 'opacity-100'}
                ${isHoveredProject ? 'z-20 scale-110' : 'z-10'}
            `}
            style={{
                gridColumnStart,
                gridColumnEnd: `span 1`, // Circle is instantaneous, spans 1 week visually
            }}
            onMouseEnter={() => onHoverProject(event.projectId || null)}
            onMouseLeave={() => onHoverProject(null)}
        >
            {/* The Circle Marker */}
            <div
                className="w-4 h-4 rounded-full border-2 bg-transparent shadow-lg transition-all group-hover:bg-opacity-20 flex items-center justify-center"
                style={{
                    borderColor: config.color,
                    boxShadow: isHoveredProject ? `0 0 10px ${config.color}40` : 'none'
                }}
            >
                {/* Optional inner dot for visual anchor */}
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
            </div>

            {/* Hover Tooltip (Similar to EventBar but simpler) */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <div className="bg-gray-900 border border-white/10 rounded-lg p-2 text-xs shadow-xl">
                    <div className="font-bold text-white mb-1 truncate">{event.title}</div>
                    <div className="text-neutral-400 text-[10px] uppercase tracking-wide">Planning Phase</div>
                    <div className="mt-1 text-primary-400">Week {event.startWeek}</div>
                </div>
            </div>
        </div>
    );
};
