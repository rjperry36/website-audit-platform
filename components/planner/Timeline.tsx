"use client";

import { useState } from "react";
import { staticEvents, staticRows, months, weeks } from "@/lib/planner-data";
import channelTypes from "@/lib/channel-initiative-types.json";
import { TimelineHeader } from "./TimelineHeader";
import { TimelineRow } from "./TimelineRow";
import { TimelineFilter } from "./TimelineFilter";
import { INITIATIVE_CONFIG } from "@/lib/initiatives";
import { PlannerEvent } from "@/lib/planner-data";
import clsx from "clsx";
import { Calendar, CalendarDays, CalendarRange, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ViewDuration = 3 | 6 | 12;

/**
 * Timeline Component
 *
 * The primary visualization for the Market Planner.
 *
 * @component
 * @description
 * Renders a Gantt-style timeline for marketing initiatives.
 * Features:
 * - View switching (3k/6/12 month views)
 * - Strict filtering by Channel type (sourced from channel-initiative-types.json)
 * - Collapsible project rows with progress tracking
 * - "X-Ray" mode for highlighting specific projects
 *
 * @returns {JSX.Element} The rendered Timeline dashboard
 */

interface TimelineProps {
    events?: PlannerEvent[];
    market?: string;
}

export const Timeline = ({ events = staticEvents, market }: TimelineProps) => {
    const [viewDuration, setViewDuration] = useState<ViewDuration>(3);

    // Filter State
    const allTypes = channelTypes.map(c => c.id);
    const [selectedTypes, setSelectedTypes] = useState<string[]>(allTypes);

    const handleToggleType = (type: string) => {
        if (selectedTypes.includes(type)) {
            setSelectedTypes(selectedTypes.filter(t => t !== type));
        } else {
            setSelectedTypes([...selectedTypes, type]);
        }
    };

    const handleSelectAll = () => setSelectedTypes(allTypes);
    const handleClearAll = () => setSelectedTypes([]);

    // Collapsed State
    const [collapsedTypes, setCollapsedTypes] = useState<string[]>([]);

    const handleToggleCollapse = (type: string) => {
        if (collapsedTypes.includes(type)) {
            setCollapsedTypes(collapsedTypes.filter(t => t !== type));
        } else {
            setCollapsedTypes([...collapsedTypes, type]);
        }
    };

    // Project Hover State
    const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

    // Logic to slice data based on view duration
    // 3 Months: Start from CURRENT month
    // 6 Months: Start from CURRENT month
    // 12 Months: Start from JAN (Index 0)

    // We need to determine the start index in the `months` array.
    // `months` array is now JAN...DEC (0...11)

    const getCurrentMonthIndex = () => {
        const now = new Date();
        return now.getMonth(); // 0 = Jan, 1 = Feb, etc.
    };

    const getStartIndex = () => {
        if (viewDuration === 12) return 0; // Always start Jan
        return getCurrentMonthIndex(); // Start current month
    };

    const startIndex = getStartIndex();
    // Safety check: if start index + duration > 12, we might stick to end?
    // Or just show what we have. 
    // If we are in Dec and show 3 months, do we wrap? 
    // The current `months` array only has 12 items.
    // For MVP, let's clamp or show available.
    // If wrapping is needed, we'd need next year's data. 
    // Let's assume non-wrapping simple view for now, or just slice safely.

    const visibleMonths = months.slice(
        startIndex,
        Math.min(startIndex + viewDuration, months.length)
    );

    // If we run out of months (e.g. start Nov, view 3), we only show Nov-Dec. 
    // Ideally we'd wrap to Jan next year but that requires data support.

    // Calculate visible weeks
    if (visibleMonths.length === 0) return null; // Safety

    // Start is first week of first visible month
    const startWeek = visibleMonths[0].startWeek;
    // End is last week of last visible month
    const endWeek = visibleMonths[visibleMonths.length - 1].endWeek;

    // Slice the weeks array to match range [startWeek, endWeek]
    const visibleWeeks = weeks.filter(w => w >= startWeek && w <= endWeek);

    const totalColumns = visibleWeeks.length;

    return (
        <div className="w-full h-full bg-transparent overflow-hidden flex flex-col">
            {/* Filter Bar */}
            <TimelineFilter
                selectedTypes={selectedTypes}
                onToggle={handleToggleType}
                onSelectAll={handleSelectAll}
                onClearAll={handleClearAll}
            />

            {/* Controls Header */}
            <div className="p-4 flex items-center gap-4 text-sm border-b border-white/10 bg-[#1a1a2e]">
                <button
                    onClick={() => setViewDuration(3)}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 border",
                        viewDuration === 3
                            ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                            : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">3 Month View</span>
                </button>

                <button
                    onClick={() => setViewDuration(6)}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 border",
                        viewDuration === 6
                            ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                            : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <CalendarDays className="w-4 h-4" />
                    <span className="font-medium">6 Month View</span>
                </button>

                <button
                    onClick={() => setViewDuration(12)}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 border",
                        viewDuration === 12
                            ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                            : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <CalendarRange className="w-4 h-4" />
                    <span className="font-medium">12 Month View</span>
                </button>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-auto relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div
                    className="min-w-full"
                    style={{
                        // Ensure the container is wide enough for larger views if needed, 
                        // but min-w-full usually handles it with the grid system taking over.
                        // We might want a minimum width per column to avoid squishing:
                        minWidth: `${totalColumns * 60}px`
                    }}
                >
                    <TimelineHeader
                        months={visibleMonths}
                        weeks={visibleWeeks}
                        totalColumns={totalColumns}
                    />

                    <div className="min-h-[300px]">
                        {/* Iterate through selected types and render groups */}
                        {selectedTypes.map(type => {
                            const typeConfig = INITIATIVE_CONFIG[type];
                            // Get events for this type
                            const typeEvents = events.filter(e =>
                                (e.type === type) || (e.type.toUpperCase() === type)
                            );

                            if (typeEvents.length === 0) return null;

                            const isCollapsed = collapsedTypes.includes(type);

                            // Sort events by start time
                            const sortedEvents = [...typeEvents].sort((a, b) => a.startWeek - b.startWeek);

                            // Pack events into visual lanes (rows) to handle overlaps
                            const lanes: PlannerEvent[][] = [];
                            sortedEvents.forEach(event => {
                                let placed = false;
                                for (const lane of lanes) {
                                    const lastEvent = lane[lane.length - 1];
                                    // If potential overlap, check buffer. 
                                    // Simple check: if last event ends before this one starts
                                    if ((lastEvent.startWeek + lastEvent.durationWeeks) <= event.startWeek) {
                                        lane.push(event);
                                        placed = true;
                                        break;
                                    }
                                }
                                if (!placed) lanes.push([event]);
                            });

                            return (
                                <div key={type} className="relative group">
                                    {/* Type Header / Label */}
                                    <button
                                        onClick={() => handleToggleCollapse(type)}
                                        className="w-full px-4 py-2 text-xs font-bold text-white/50 bg-white/5 border-y border-white/5 flex items-center gap-2 hover:bg-white/10 transition-colors"
                                    >
                                        {isCollapsed ? (
                                            <ChevronRight className="w-3 h-3" />
                                        ) : (
                                            <ChevronDown className="w-3 h-3" />
                                        )}
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: typeConfig.color }} />
                                        {typeConfig.label}
                                        <span className="ml-auto text-[10px] opacity-50">
                                            {sortedEvents.length} events
                                        </span>
                                    </button>

                                    {/* Render Lanes for this Type */}
                                    {!isCollapsed && sortedEvents.length > 0 && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {lanes.map((laneEvents, laneIndex) => (
                                                <TimelineRow
                                                    key={`${type}-lane-${laneIndex}`}
                                                    row={{ id: `${type}-${laneIndex}` }} // Dynamic row ID
                                                    events={laneEvents}
                                                    totalColumns={totalColumns}
                                                    viewStartWeek={startWeek}
                                                    hoveredProjectId={hoveredProjectId}
                                                    onHoverProject={setHoveredProjectId}
                                                />
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })}

                        {selectedTypes.length === 0 && (
                            <div className="flex items-center justify-center p-12 text-neutral-500 text-sm">
                                No initiative types selected.
                            </div>
                        )}
                    </div>


                </div>
            </div>
        </div>
    );
};
