'use client'

import { useState } from "react"

import { staticEvents, weeks } from "@/lib/planner-data"
import projects from "@/lib/projects.json"
import { getInitiativeStyle, getTagStyle } from "@/lib/initiatives"
import { Calendar, Tag, ChevronRight } from "lucide-react"
import clsx from "clsx"

const CURRENT_WEEK = 7; // Mock current week (mid-Feb)

const ProjectCard = ({ projectId, events }: { projectId: string, events: typeof staticEvents }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Find project metadata
    const firstEvent = events[0];
    const projectData = projects.find(p => p.id === projectId);

    // Use project title if available, otherwise fallback to event title (for Briefs), or ID cleanup
    const projectTitle = projectData?.title || firstEvent?.title || projectId.replace(/^(proj_|brief_)/, '').replace(/_/g, ' ').toUpperCase();

    const sortedInitiatives = [...events].sort((a, b) => a.startWeek - b.startWeek);

    // Calculate Progress
    // Simple logic: % of total duration passed relative to current week
    let totalWeeks = 0;
    let completedWeeks = 0;

    events.forEach(e => {
        totalWeeks += e.durationWeeks;
        const endWeek = e.startWeek + e.durationWeeks;
        if (CURRENT_WEEK >= endWeek) {
            completedWeeks += e.durationWeeks;
        } else if (CURRENT_WEEK > e.startWeek) {
            completedWeeks += (CURRENT_WEEK - e.startWeek);
        }
    });

    const progress = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;


    // Helper for month
    const getMonthForWeek = (week: number) => {
        // Simple approximation: Week 1-4 = Jan, 5-8 = Feb, etc.
        // Array of month names
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

        // Avg weeks per month = 52/12 = 4.33
        const monthIndex = Math.floor((week - 1) / 4.33);
        return monthNames[Math.max(0, Math.min(monthIndex, 11))] || 'N/A';
    }

    return (
        <div className="glass rounded-xl border border-white/10 overflow-hidden relative group">
            {/* Project Header */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="p-6 border-b border-white/5 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
            >
                <div className="md:flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <ChevronRight className={clsx("w-5 h-5 text-neutral-400 transition-transform", isOpen && "rotate-90")} />
                            <h4 className="text-xl font-bold text-white tracking-tight">
                                {projectTitle}
                            </h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                                {events.length} Initiatives
                            </span>
                        </div>
                        <p className="text-sm text-neutral-400 max-w-2xl ml-8">
                            {firstEvent.description || "Project description placeholder."}
                        </p>

                        {/* Progress Bar */}
                        <div className="ml-8 mt-4 flex items-center gap-3 max-w-md">
                            <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-xs font-mono text-neutral-400">{progress}% Done</span>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4 md:mt-0 ml-8 md:ml-0">
                        {firstEvent.tags?.map(tag => {
                            const style = getTagStyle(tag);
                            return (
                                <span
                                    key={tag}
                                    className="px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 shadow-sm border border-white/5"
                                    style={{ backgroundColor: style.color, color: 'white' }}
                                >
                                    <Tag className="w-3 h-3 opacity-70" /> {style.label}
                                </span>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Timeline Sequence List - Collapsible */}
            <div className={clsx("transition-all duration-300 ease-in-out overflow-hidden", isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0")}>
                <div className="p-0 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/5">
                        {sortedInitiatives.map((event, idx) => {
                            const style = getInitiativeStyle(event.type);
                            return (
                                <div key={event.id} className="p-4 hover:bg-white/5 transition-colors relative group/card flex flex-col h-full">
                                    {/* Step Number Background */}
                                    <span className="absolute right-2 top-2 text-[40px] font-black text-white/5 select-none pointer-events-none group-hover/card:text-white/10 transition-colors">
                                        {idx + 1}
                                    </span>

                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3 relative z-10">
                                        <span
                                            className="text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider text-white"
                                            style={{ backgroundColor: style.color }}
                                        >
                                            {style.label}
                                        </span>
                                        <span className="text-xs font-mono text-neutral-500">
                                            W{event.startWeek}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 relative z-10">
                                        <h5 className="font-bold text-neutral-200 text-sm mb-1 leading-snug group-hover/card:text-white transition-colors">
                                            {event.title}
                                        </h5>
                                        <p className="text-xs text-neutral-500">
                                            Duration: {event.durationWeeks} Weeks
                                        </p>
                                        {/* Status based on mock current week */}
                                        {event.startWeek + event.durationWeeks <= CURRENT_WEEK ? (
                                            <span className="text-[10px] text-emerald-500 font-bold mt-1 block">COMPLETE</span>
                                        ) : event.startWeek <= CURRENT_WEEK ? (
                                            <span className="text-[10px] text-blue-400 font-bold mt-1 block">IN PROGRESS</span>
                                        ) : (
                                            <span className="text-[10px] text-neutral-600 font-bold mt-1 block">UPCOMING</span>
                                        )}
                                    </div>

                                    {/* Month Indicator */}
                                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[10px] text-neutral-400 uppercase font-medium">
                                        <Calendar className="w-3 h-3 opacity-50" />
                                        {getMonthForWeek(event.startWeek)} Start
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export interface PlannerListViewProps {
    events?: typeof staticEvents;
}

export const PlannerListView = ({ events = staticEvents }: PlannerListViewProps) => {
    // Group events by Project ID
    const groupedEvents: Record<string, typeof staticEvents> = {};
    const noProjectEvents: typeof staticEvents = [];

    events.forEach(event => {
        if (event.projectId) {
            if (!groupedEvents[event.projectId]) {
                groupedEvents[event.projectId] = [];
            }
            groupedEvents[event.projectId].push(event);
        } else {
            noProjectEvents.push(event);
        }
    });

    // Sort projects by ID or manual order (optional)
    const projectKeys = Object.keys(groupedEvents);

    return (
        <div className="w-full pb-24">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Project Priorities & Work Sequence
            </h3>

            <div className="space-y-6">
                {/* Render Projects */}
                {projectKeys.map(projectId => (
                    <ProjectCard key={projectId} projectId={projectId} events={groupedEvents[projectId]} />
                ))}

                {/* Other Initiatives Section */}
                {noProjectEvents.length > 0 && (
                    <div className="glass rounded-xl border border-white/10 p-6 opacity-60 hover:opacity-100 transition-opacity">
                        <h4 className="text-lg font-bold text-white mb-4">Other / Ad-hoc Initiatives</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {noProjectEvents.map(event => {
                                const style = getInitiativeStyle(event.type);
                                return (
                                    <div key={event.id} className="bg-white/5 rounded p-3 text-sm flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: style.color }} />
                                        <span className="truncate text-neutral-300">{event.title}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
