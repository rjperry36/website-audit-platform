'use client'

import { PlannerEvent } from "@/lib/planner-data";
import { getInitiativeStyle } from "@/lib/initiatives";
import { motion } from "framer-motion";
import { ArrowUpRight, FileText, Target, Hash, Link as LinkIcon } from "lucide-react";

interface EventHoverCardProps {
    event: PlannerEvent;
}

export const EventHoverCard = ({ event }: EventHoverCardProps) => {
    const style = getInitiativeStyle(event.type);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 left-0 top-full mt-2 w-[320px] bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
            style={{
                // Ensure it stays on screen (simple fix for now, ideally use a positioning lib)
                // Left 0 aligns with bar start.
            }}
        >
            {/* Image Header */}
            <div className="h-32 w-full bg-neutral-800 relative">
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div
                        className="absolute inset-0 opacity-50 bg-gradient-to-br from-neutral-700 to-neutral-900"
                        style={{ backgroundColor: style.color }} // Tint with initiative color
                    />
                )}

                {/* Tint Overlay for text reliability if needed, or just keep it clean */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] to-transparent opacity-80" />

                {/* Type Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                    {style.label}
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Header */}
                <div>
                    <h4 className="text-lg font-bold text-white leading-tight mb-1">
                        {event.title}
                    </h4>
                    <div className="flex flex-wrap gap-2 text-[10px] text-neutral-400">
                        {event.tags?.map(tag => (
                            <span key={tag} className="bg-white/5 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Hash className="w-2.5 h-2.5" /> {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Description */}
                {event.description && (
                    <p className="text-xs text-neutral-300 leading-relaxed">
                        {event.description}
                    </p>
                )}

                {/* Outcome */}
                {event.outcome && (
                    <div className="flex gap-3 items-start bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        <Target className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[10px] uppercase font-bold text-emerald-400 mb-0.5">Expected Outcome</p>
                            <p className="text-xs text-emerald-100">{event.outcome}</p>
                        </div>
                    </div>
                )}

                {/* Resources */}
                {event.resources && event.resources.length > 0 && (
                    <div className="pt-2 border-t border-white/5">
                        <p className="text-[10px] uppercase font-bold text-neutral-500 mb-2 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Resources
                        </p>
                        <ul className="space-y-1">
                            {event.resources.map((res, i) => (
                                <li key={i}>
                                    <a
                                        href={res.url}
                                        className="flex items-center justify-between text-xs text-blue-400 hover:text-blue-300 group/link bg-white/5 p-1.5 rounded hover:bg-white/10 transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            <LinkIcon className="w-3 h-3 opacity-50" />
                                            {res.label}
                                        </span>
                                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
