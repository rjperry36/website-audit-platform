'use client'

import { staticEvents, weeks } from "@/lib/planner-data"
import { getInitiativeStyle } from "@/lib/initiatives"
import { Calendar, Tag } from "lucide-react"

export const PlannerListView = () => {
    // Sort events by start week
    const sortedEvents = [...staticEvents].sort((a, b) => a.startWeek - b.startWeek);

    // Simple helper to guess month based on week number
    // Week 8 = Aug start.
    const getMonthForWeek = (week: number) => {
        const monthIndex = Math.floor((week - 8) / 4.3); // Rough approx
        const monthNames = ['AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL'];
        return monthNames[Math.max(0, Math.min(monthIndex, 11))] || 'N/A';
    }

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-400" />
                Initiative Schedule
            </h3>

            <div className="glass rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-xs uppercase font-medium text-neutral-400">
                            <tr>
                                <th className="px-6 py-4">Initiative Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Start (Est.)</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Timeline</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedEvents.map((event) => {
                                const style = getInitiativeStyle(event.type);
                                return (
                                    <tr key={event.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">
                                            {event.title}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="px-2 py-1 rounded-full text-[10px] font-bold text-white border border-white/20"
                                                style={{ backgroundColor: style.color }}
                                            >
                                                {style.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400">
                                            Week {event.startWeek} ({getMonthForWeek(event.startWeek)})
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400">
                                            {event.durationWeeks} Weeks
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Mini visual indicator */}
                                            <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${Math.min(100, (event.durationWeeks / 12) * 100)}%`, // Relative scale
                                                        backgroundColor: style.color
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
